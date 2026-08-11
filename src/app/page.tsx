'use client';

import DualHeroCanvas from '@/components/canvas/DualHeroCanvas';
import TypedQuoteCycler from '@/components/quote/TypedQuoteCycler';
import ProjectCard from '@/components/ui/ProjectCard';
import HUDStat from '@/components/ui/HUDStat';
import Footer from '@/components/layout/Footer';
import { projects } from '@/lib/data/projects';
import { useLenis } from '@/hooks/useLenis';

export default function Home() {
  useLenis();

  return (
    <main className="relative bg-bg">
      <DualHeroCanvas />

      <section className="relative z-10 flex flex-col items-center justify-center gap-8 border-t border-line bg-bg px-6 py-32 hud-grid">
        <span className="font-hud text-[10px] uppercase tracking-widest text-muted">Transmission</span>
        <TypedQuoteCycler />
      </section>

      <section className="relative z-10 border-t border-line bg-bg px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl uppercase tracking-widest2 text-fg">Selected Work</h2>
          <div className="mt-10 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <div key={p.slug} className="bg-bg">
                <ProjectCard project={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-line bg-bg px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl uppercase tracking-widest2 text-fg">System Readout</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <HUDStat label="Location" value="INDIA" />
            <HUDStat label="Domain" value="MULTI-VERTICAL" />
            <HUDStat label="Status" value="BUILDING" />
            <HUDStat label="Type" value="ENTP" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
