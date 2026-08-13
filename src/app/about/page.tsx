'use client';

import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import HUDStat from '@/components/ui/HUDStat';
import DustPortrait from '@/components/ui/DustPortrait';
import FiberNet from '@/components/net/FiberNet';
import { spokenLanguages } from '@/lib/data/stack';
import { useLenis } from '@/hooks/useLenis';

export default function AboutPage() {
  useLenis();

  return (
    <main className="relative bg-bg pt-40">
      <section className="relative mx-auto max-w-5xl px-6 pb-24 sm:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <Reveal>
              <span className="font-hud text-[10px] uppercase tracking-widest text-muted">01 / About</span>
              <h1 className="mt-4 font-display text-4xl uppercase leading-tight tracking-wide text-shine sm:text-5xl">
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
          </div>

          <Reveal delay={0.15} className="mx-auto flex w-full max-w-sm flex-col gap-4 lg:mx-0">
            <DustPortrait />
            {/* small, dark, looping — reads as a gif rather than a video */}
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-line bg-[#050505]">
              <video
                src="/og/hemansh.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover grayscale contrast-125 brightness-75"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_20px_rgba(0,0,0,0.7)]" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-line px-6 py-20 sm:px-10">
        <FiberNet />
        <div className="relative mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-display text-xl uppercase tracking-widest2 text-fg">Languages</h2>
            <p className="mt-2 font-hud text-[11px] uppercase tracking-widest text-muted">
              Six, actively working. More in progress — including one being built from scratch.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {spokenLanguages.map((lang) => (
              <div key={lang} className="border border-line bg-bg px-4 py-3 text-center font-hud text-xs uppercase tracking-widest text-fg">
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

      <section className="border-t border-line bg-bg px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <span className="font-hud text-[10px] uppercase tracking-widest text-muted">Interlude</span>
            <h2 className="mt-2 font-display text-xl uppercase tracking-widest2 text-fg">Sound, Between Sections</h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 overflow-hidden border border-line">
            <video
              src="/og/video.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="h-full max-h-[420px] w-full object-cover grayscale"
            />
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
