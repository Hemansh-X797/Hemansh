import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import { createPayPalOrder } from '@/lib/server/paypal';

export async function POST(req: NextRequest) {
  const { bookSlug, refSlug } = await req.json();
  if (typeof bookSlug !== 'string') {
    return NextResponse.json({ error: 'bookSlug required' }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { data: book, error: bookErr } = await sb
    .from('books')
    .select('id, price_cents')
    .eq('slug', bookSlug)
    .single();
  if (bookErr || !book) return NextResponse.json({ error: 'Unknown book' }, { status: 404 });

  let influencerId: string | null = null;
  let amountCents = book.price_cents;

  if (typeof refSlug === 'string' && refSlug) {
    const { data: inf } = await sb
      .from('influencers')
      .select('id, discount_pct')
      .eq('slug', refSlug)
      .eq('active', true)
      .single();
    if (inf) {
      influencerId = inf.id;
      amountCents = Math.round(book.price_cents * (1 - inf.discount_pct / 100));
    }
  }

  const { data: order, error: orderErr } = await sb
    .from('orders')
    .insert({ book_id: book.id, influencer_id: influencerId, amount_cents: amountCents, status: 'pending' })
    .select('id')
    .single();
  if (orderErr || !order) return NextResponse.json({ error: 'Could not create order' }, { status: 500 });

  const ppOrder = await createPayPalOrder(amountCents, order.id);

  await sb.from('orders').update({ paypal_order_id: ppOrder.id }).eq('id', order.id);

  return NextResponse.json({ paypalOrderId: ppOrder.id, internalOrderId: order.id });
}
