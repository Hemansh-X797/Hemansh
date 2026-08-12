'use client';

import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { books } from '@/lib/data/books';
import { useLenis } from '@/hooks/useLenis';

export default function BooksPage() {
  useLenis();

  return (
    <main className="relative bg-bg pt-40">
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-10">
        <Reveal>
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">03 / Books</span>
          <h1 className="mt-4 font-display text-4xl uppercase leading-tight tracking-wide text-shine sm:text-5xl">
            Written Work
          </h1>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-muted">
            A showcase for now — a dedicated marketplace is next in line.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
          {books.map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.08} className="group relative flex flex-col bg-bg p-7">
              <div className="relative aspect-[2/3] w-full overflow-hidden border border-line bg-[#0a0a0a]">
                <Image
                  src={b.cover}
                  alt={b.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover grayscale transition-[filter] duration-500 ease-luxury group-hover:grayscale-0"
                />
              </div>
              <h3 className="mt-6 font-display text-lg uppercase leading-snug tracking-wide text-fg">
                {b.title}
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-muted">{b.description}</p>
              <span className="mt-6 font-hud text-[10px] uppercase tracking-widest text-accent">
                {b.status === 'available' ? 'Available' : 'Coming Soon'}
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
