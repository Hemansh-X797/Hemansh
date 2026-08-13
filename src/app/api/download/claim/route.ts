import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { internalOrderId, email } = await req.json();
  if (!internalOrderId || !email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: order } = await sb.from('orders').select('id, status').eq('id', internalOrderId).single();
  if (!order || order.status !== 'paid') {
    return NextResponse.json({ error: 'order is not paid' }, { status: 403 });
  }

  const { data: dl } = await sb.from('downloads').select('*').eq('order_id', order.id).single();
  if (!dl) return NextResponse.json({ error: 'no download record for this order' }, { status: 404 });

  // email is immutable once set — this is the "only that email, ever" guarantee
  if (dl.email && dl.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: 'this order is already claimed by a different email' }, { status: 403 });
  }
  if (!dl.email) {
    await sb.from('downloads').update({ email, claimed_at: new Date().toISOString() }).eq('id', dl.id);
  }

  return NextResponse.json({ token: dl.token });
}
