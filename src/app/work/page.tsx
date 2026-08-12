'use client';

import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import ProjectCard from '@/components/ui/ProjectCard';
import { projects, ongoingProjects } from '@/lib/data/projects';
import { useLenis } from '@/hooks/useLenis';

export default function WorkPage() {
  useLenis();

  return (
    <main className="relative bg-bg pt-40">
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-10">
        <Reveal>
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">02 / Work</span>
          <h1 className="mt-4 font-display text-4xl uppercase leading-tight tracking-wide text-shine sm:text-5xl">
            Systems &amp; Software
          </h1>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-muted">
            Everything below is real and either live or actively maintained. Private systems are marked and
            gated accordingly.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-display text-xl uppercase tracking-widest2 text-fg">All Projects</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.06} className="bg-bg">
                <ProjectCard project={p} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 py-16 hud-grid sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-display text-xl uppercase tracking-widest2 text-fg">Ongoing</h2>
            <p className="mt-2 font-hud text-[11px] uppercase tracking-widest text-muted">
              Actively shipping. Not archived, not abandoned.
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {ongoingProjects.map((p) => (
              <a
                key={p.slug}
                href={p.url ?? p.repo}
                target="_blank"
                rel="noreferrer"
                data-magnetic
                data-cursor-label="OPEN"
                className="border border-line px-5 py-3 font-hud text-[11px] uppercase tracking-widest text-fg transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                {p.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
