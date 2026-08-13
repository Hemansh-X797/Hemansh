import 'server-only';

/**
 * Deliberately dependency-free: PayPal's REST API is called directly with
 * fetch rather than pulling in an SDK, so there's no third-party license to
 * track for the payment path itself. Credentials (client id + secret) live
 * only in server env vars and are exchanged for a short-lived OAuth token
 * per request — nothing is cached across requests, so a leaked token can't
 * outlive a single call's process lifetime by design.
 */

const PAYPAL_API =
  process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function getAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!id || !secret) throw new Error('PAYPAL_CLIENT_ID / PAYPAL_SECRET are not set — see SETUP.md');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function createPayPalOrder(amountCents: number, orderId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId, // our internal order id, for reconciling the webhook later
          amount: { currency_code: 'USD', value: (amountCents / 100).toFixed(2) },
        },
      ],
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PayPal create order failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

/**
 * Verifies a PayPal webhook actually came from PayPal, using PayPal's own
 * verification endpoint (server-to-server) — the standard, correct way to
 * do this rather than hand-rolling signature math. A webhook whose
 * verification_status isn't SUCCESS is discarded, full stop.
 */
export async function verifyWebhookSignature(headers: Headers, rawBody: string) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error('PAYPAL_WEBHOOK_ID is not set — see SETUP.md');
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
    cache: 'no-store',
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === 'SUCCESS';
}
