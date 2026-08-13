import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

/**
 * hemansh.vercel.app/r/<slug> — validated server-side against the
 * influencers table (so a made-up slug just falls through with no
 * discount, rather than trusting whatever's in the URL), then a short
 * signed marker is set as a cookie so /books can apply their discount and
 * /api/paypal/create-order can attribute the sale — the actual crediting
 * happens server-side in that route using the influencer's DB id, not
 * anything read back out of the cookie's content.
 */
export default async function ReferralPage({ params }: { params: { slug: string } }) {
  const sb = supabaseAdmin();
  const { data: inf } = await sb
    .from('influencers')
    .select('slug, active')
    .eq('slug', params.slug)
    .eq('active', true)
    .single();

  if (inf) {
    cookies().set('ref', inf.slug, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 14, // 14 days — standard affiliate attribution window
      path: '/',
    });
  }

  redirect('/books');
}
