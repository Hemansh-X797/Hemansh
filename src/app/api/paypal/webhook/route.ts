import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import { verifyWebhookSignature } from '@/lib/server/paypal';

/**
 * Runs independently of the buyer's browser: if their connection drops
 * right after paying, this is what still marks the order paid and issues
 * the download. Every event is signature-verified against PayPal directly
 * before anything is trusted — an unverified POST to this URL (anyone can
 * find it) does nothing.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const valid = await verifyWebhookSignature(req.headers, rawBody);
  if (!valid) return NextResponse.json({ error: 'invalid signature' }, { status: 400 });

  const event = JSON.parse(rawBody);
  if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
    return NextResponse.json({ ok: true }); // ignore everything else
  }

  const resource = event.resource;
  const paypalOrderId: string | undefined = resource?.supplementary_data?.related_ids?.order_id;
  const capturedAmount = Math.round(parseFloat(resource.amount.value) * 100);
  if (!paypalOrderId) return NextResponse.json({ ok: true });

  const sb = supabaseAdmin();
  const { data: order } = await sb.from('orders').select('*').eq('paypal_order_id', paypalOrderId).single();
  if (!order || order.status === 'paid') return NextResponse.json({ ok: true }); // unknown or already handled

  if (capturedAmount !== order.amount_cents) {
    await sb.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ ok: true });
  }

  await sb.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', order.id);
  await sb.from('downloads').upsert({ order_id: order.id }, { onConflict: 'order_id', ignoreDuplicates: true });

  return NextResponse.json({ ok: true });
}
