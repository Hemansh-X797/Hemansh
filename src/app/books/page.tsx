import { cookies } from 'next/headers';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import BookPurchaseCard from '@/components/checkout/BookPurchaseCard';
import { books, heroBook } from '@/lib/data/books';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

async function getReferralDiscount(): Promise<number> {
  const refSlug = cookies().get('ref')?.value;
  if (!refSlug) return 0;
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('influencers')
      .select('discount_pct')
      .eq('slug', refSlug)
      .eq('active', true)
      .single();
    return data?.discount_pct ?? 0;
  } catch {
    return 0; // Supabase not configured yet — degrade to full price rather than error the page
  }
}

export default async function BooksPage() {
  const discountPct = await getReferralDiscount();
  const restBooks = books.filter((b) => !b.isHero);

  return (
    <main className="relative bg-bg pt-40">
      <section className="mx-auto max-w-4xl px-6 pb-16 sm:px-10">
        <Reveal>
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">03 / Books</span>
          <h1 className="mt-4 font-display text-4xl uppercase leading-tight tracking-wide text-shine sm:text-5xl">
            Written Work
          </h1>
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-10">
        <Reveal className="mx-auto max-w-4xl">
          <BookPurchaseCard book={heroBook} discountPct={discountPct} large />
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-10">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
          {restBooks.map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.08}>
              <BookPurchaseCard book={b} discountPct={discountPct} />
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
