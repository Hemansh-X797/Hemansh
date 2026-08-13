import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: dl } = await sb
    .from('downloads')
    .select('*, orders(book_id, status)')
    .eq('token', params.token)
    .single();

  if (!dl || !dl.email || dl.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: 'invalid token or email' }, { status: 403 });
  }
  if (dl.orders?.status !== 'paid') {
    return NextResponse.json({ error: 'order not paid' }, { status: 403 });
  }

  const { data: book } = await sb
    .from('books')
    .select('storage_path')
    .eq('id', dl.orders.book_id)
    .single();
  if (!book) return NextResponse.json({ error: 'book not found' }, { status: 404 });

  // Short-lived (2 min) signed URL from a PRIVATE storage bucket — the file
  // itself is never publicly reachable; this is the only way to it, and it
  // expires almost immediately.
  const { data: signed, error } = await sb.storage
    .from('books')
    .createSignedUrl(book.storage_path, 120);
  if (error || !signed) return NextResponse.json({ error: 'could not sign url' }, { status: 500 });

  await sb.from('downloads').update({ download_count: dl.download_count + 1 }).eq('id', dl.id);

  return NextResponse.redirect(signed.signedUrl);
}
