'use client';

import DualHeroCanvas from '@/components/canvas/DualHeroCanvas';
import Image from 'next/image';
import TypedQuoteCycler from '@/components/quote/TypedQuoteCycler';
import ProjectCard from '@/components/ui/ProjectCard';
import HUDStat from '@/components/ui/HUDStat';
import Reveal from '@/components/ui/Reveal';
import Footer from '@/components/layout/Footer';
import FiberNet from '@/components/net/FiberNet';
import { featuredProjects } from '@/lib/data/projects';
import { useLenis } from '@/hooks/useLenis';

export default function Home() {
  useLenis();

  return (
    <main className="relative bg-bg">
      <DualHeroCanvas />

      <section className="relative z-10 flex flex-col items-center justify-center gap-8 overflow-hidden border-t border-line bg-bg px-6 py-32">
        <FiberNet />
        <Reveal className="relative flex flex-col items-center gap-8">
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">Transmission</span>
          <TypedQuoteCycler />
        </Reveal>
      </section>

      {/* Hero III — the piano recording plays over the real night photo; the frame itself
          is the visual, nothing narrates it */}
      <section className="relative z-10 flex h-[80vh] w-full items-end overflow-hidden border-t border-line">
        <Image
          src="/og/night-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top opacity-70"
        />
        <video
          src="/og/video.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
        <Reveal className="relative z-10 w-full px-6 pb-16 sm:px-10">
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">Interlude</span>
          <h2 className="mt-3 max-w-xl font-display text-3xl uppercase leading-tight tracking-wide text-shine sm:text-4xl">
            Everything Compounds
          </h2>
        </Reveal>
      </section>

      <section className="relative z-10 border-t border-line bg-bg px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-display text-2xl uppercase tracking-widest2 text-fg">Selected Work</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.06} className="bg-bg">
                <ProjectCard project={p} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-line bg-bg px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-display text-2xl uppercase tracking-widest2 text-fg">System Readout</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Reveal><HUDStat label="Location" value="INDIA" /></Reveal>
            <Reveal delay={0.05}><HUDStat label="Domain" value="MULTI-VERTICAL" /></Reveal>
            <Reveal delay={0.1}><HUDStat label="Status" value="BUILDING" /></Reveal>
            <Reveal delay={0.15}><HUDStat label="Type" value="ENTP" /></Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
