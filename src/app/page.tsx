'use client';

import DualHeroCanvas from '@/components/canvas/DualHeroCanvas';
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
