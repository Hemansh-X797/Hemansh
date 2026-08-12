'use client';

import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import SocialEmbed from '@/components/ui/SocialEmbed';
import { socials } from '@/lib/data/socials';
import { useLenis } from '@/hooks/useLenis';

export default function ContactPage() {
  useLenis();

  return (
    <main className="relative bg-bg pt-40">
      <section className="mx-auto max-w-4xl px-6 pb-16 sm:px-10">
        <Reveal>
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">05 / Contact</span>
          <h1 className="mt-4 font-display text-4xl uppercase leading-tight tracking-wide text-fg sm:text-5xl">
            Limelight
          </h1>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-muted">
            Live feeds, not a link list. X and Instagram render their real platform widgets; Spotify is a real
            playback embed. LinkedIn and Discord don&apos;t offer public embed widgets, so those open straight
            to the profile.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-10">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {socials.map((s, i) => (
            <Reveal key={s.key} delay={(i % 2) * 0.08} className="border border-line bg-[#050505] p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-sm uppercase tracking-widest text-fg">{s.label}</span>
                <span className="font-hud text-[10px] text-muted">{s.handle}</span>
              </div>
              <SocialEmbed social={s} />
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
