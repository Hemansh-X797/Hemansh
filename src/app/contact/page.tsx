'use client';

import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import SocialIconLink from '@/components/ui/SocialIconLink';
import { socials } from '@/lib/data/socials';
import { useLenis } from '@/hooks/useLenis';

export default function ContactPage() {
  useLenis();

  return (
    <main className="relative bg-bg pt-40">
      <section className="mx-auto max-w-4xl px-6 pb-16 sm:px-10">
        <Reveal>
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">05 / Contact</span>
          <h1 className="mt-4 font-display text-4xl uppercase leading-tight tracking-wide text-shine sm:text-5xl">
            Limelight
          </h1>
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-10">
        <Reveal className="mx-auto flex max-w-4xl flex-wrap gap-4">
          {socials.map((s) => (
            <SocialIconLink key={s.key} social={s} />
          ))}
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
