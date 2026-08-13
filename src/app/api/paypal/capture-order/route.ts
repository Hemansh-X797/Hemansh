import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import { capturePayPalOrder } from '@/lib/server/paypal';

/**
 * This is the enforcement point for "a sale only counts once payment is
 * actually done": we don't trust the client telling us "it worked" — we
 * call PayPal server-to-server, read PayPal's own capture status, and
 * cross-check the captured amount against what we ourselves calculated at
 * order-creation time. Only if both match does status flip to 'paid' and a
 * download row get created. The webhook route below performs the identical
 * check independently, so even if this call is skipped, dropped, or the
 * client is malicious, the webhook still catches it.
 */
export async function POST(req: NextRequest) {
  const { internalOrderId, paypalOrderId } = await req.json();
  if (!internalOrderId || !paypalOrderId) {
    return NextResponse.json({ error: 'missing ids' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: order } = await sb.from('orders').select('*').eq('id', internalOrderId).single();
  if (!order || order.paypal_order_id !== paypalOrderId) {
    return NextResponse.json({ error: 'order mismatch' }, { status: 400 });
  }
  if (order.status === 'paid') {
    return NextResponse.json({ status: 'paid' }); // already confirmed, idempotent
  }

  const { ok, data } = await capturePayPalOrder(paypalOrderId);
  const captured = data?.purchase_units?.[0]?.payments?.captures?.[0];
  const capturedAmount = captured ? Math.round(parseFloat(captured.amount.value) * 100) : 0;

  if (!ok || data.status !== 'COMPLETED' || capturedAmount !== order.amount_cents) {
    await sb.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ error: 'capture not confirmed' }, { status: 402 });
  }

  await sb.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', order.id);
  await sb.from('downloads').upsert({ order_id: order.id }, { onConflict: 'order_id', ignoreDuplicates: true });

  return NextResponse.json({ status: 'paid' });
}
