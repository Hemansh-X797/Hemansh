'use client';

import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
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
            Reach The System
          </h1>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-muted">
            Real accounts, direct links. Native embeds are wired for platforms that actually provide official
            widgets (X, Instagram, Spotify) — the rest open straight to the profile.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-10">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
          {socials.map((s, i) => (
            <Reveal key={s.key} delay={(i % 2) * 0.06} className="bg-bg">
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                data-magnetic
                data-cursor-label="OPEN"
                className="group flex items-center justify-between p-6 transition-colors duration-300 hover:bg-[#080808]"
              >
                <div>
                  <div className="font-display text-lg uppercase tracking-wide text-fg group-hover:text-accent">
                    {s.label}
                  </div>
                  <div className="mt-1 font-hud text-xs text-muted">{s.handle}</div>
                </div>
                <span className="font-hud text-xs text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                  →
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
