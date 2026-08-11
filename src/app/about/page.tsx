'use client';

import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import HUDStat from '@/components/ui/HUDStat';
import { spokenLanguages } from '@/lib/data/stack';
import { useLenis } from '@/hooks/useLenis';

export default function AboutPage() {
  useLenis();

  return (
    <main className="relative bg-bg pt-40">
      <section className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
        <Reveal>
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">01 / About</span>
          <h1 className="mt-4 font-display text-4xl uppercase leading-tight tracking-wide text-fg sm:text-5xl">
            Aspiring Polymath
          </h1>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 space-y-6 font-body text-base leading-relaxed text-muted sm:text-lg">
          <p>
            Hemansh Kumar Mishra is a systems architect operating across a deliberately wide surface area —
            software, language, sound, and strategy — under one working principle: depth in each vertical
            compounds into the others. The engineering discipline that goes into a bare-metal C++ codebase is
            the same discipline that goes into learning a language from its grammar up, or composing a piece
            of music from silence.
          </p>
          <p>
            An <span className="text-fg">ENTP</span> by wiring — restless, idea-first, allergic to doing things
            the boring way. Currently building toward a multi-vertical company, which is the reason the range
            here isn&apos;t scattered: software funds it, language and communication sell it, finance and law
            structure it, and the rest — music, sketching, writing, physics — keeps the thinking sharp.
          </p>
          <p>
            Author of <span className="text-fg">The Discipline Code</span>, and two other short-form works —
            see <a href="/books" data-magnetic data-cursor-label="GO" className="text-fg underline decoration-accent underline-offset-4">Books</a>.
            Creator of <span className="text-fg">Pulse</span>, a social platform built from scratch, among
            other ongoing systems — see <a href="/work" data-magnetic data-cursor-label="GO" className="text-fg underline decoration-accent underline-offset-4">Work</a>.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-20 hud-grid sm:px-10">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-display text-xl uppercase tracking-widest2 text-fg">Languages</h2>
            <p className="mt-2 font-hud text-[11px] uppercase tracking-widest text-muted">
              Six, actively working. More in progress — including one being built from scratch.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {spokenLanguages.map((lang) => (
              <div key={lang} className="border border-line px-4 py-3 text-center font-hud text-xs uppercase tracking-widest text-fg">
                {lang}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line px-6 py-20 sm:px-10">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          <Reveal><HUDStat label="Type" value="ENTP" /></Reveal>
          <Reveal delay={0.05}><HUDStat label="Height" value="6'1.5&quot;" /></Reveal>
          <Reveal delay={0.1}><HUDStat label="Status" value="Building" /></Reveal>
          <Reveal delay={0.15}><HUDStat label="Focus" value="Multi-Vertical" /></Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
