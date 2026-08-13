'use client';

import Image from 'next/image';
import { Project } from '@/lib/data/projects';
import PulseFlameLogo from './PulseFlameLogo';
import VinceOrb from './VinceOrb';

/**
 * The dark panel splits in two on hover (real slice-displacement mechanism,
 * from your test6.html reference) — but the mark itself (Pulse's flame,
 * V.I.N.C.E.'s orb, a project's real logo) sits on its own fixed layer above
 * the split, centered, never moving with the halves. It gets its own hover
 * reaction instead: flame flickers, orb speeds up, logos lift slightly.
 */
function VisualMark({ project }: { project: Project }) {
  if (project.slug === 'pulse') return <PulseFlameLogo size={72} />;
  if (project.slug === 'vince') return <VinceOrb size={104} />;
  if (project.logo) {
    return (
      <div className="relative h-20 w-20 opacity-90 transition-transform duration-500 ease-luxury group-hover:scale-110">
        <Image src={project.logo} alt="" fill className="object-contain" />
      </div>
    );
  }
  return (
    <span className="font-display text-6xl uppercase tracking-widest text-muted/40 transition-transform duration-500 ease-luxury group-hover:scale-110">
      {project.name.charAt(0)}
    </span>
  );
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const href = project.status === 'private' ? undefined : project.url ?? project.repo;
  const isPrivate = project.status === 'private';
  const num = String(index + 1).padStart(2, '0');

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        data-magnetic
        data-cursor-label="OPEN"
        className="group relative block overflow-hidden border border-line bg-bg transition-[border-color] duration-500 ease-luxury hover:border-accent"
      >
        {children}
      </a>
    ) : (
      <div data-magnetic data-cursor-label="LOCKED" className="group relative block overflow-hidden border border-line bg-bg">
        {children}
      </div>
    );

  return (
    <Wrapper>
      {/* visual band: panel splits apart, mark layer stays fixed and reacts on its own */}
      <div className="relative h-52 w-full overflow-hidden bg-[#070707]">
        {/* splitting panel — pure background, carries no content, so nothing icon-like moves with it */}
        <div className="absolute left-0 top-0 h-full w-1/2 border-r border-line/40 bg-gradient-to-br from-[#0c0c0c] to-[#050505] transition-transform duration-700 ease-luxury group-hover:-translate-y-4 group-hover:-translate-x-1" />
        <div className="absolute right-0 top-0 h-full w-1/2 border-l border-line/40 bg-gradient-to-bl from-[#0c0c0c] to-[#050505] transition-transform duration-700 ease-luxury group-hover:translate-y-4 group-hover:translate-x-1" />

        {/* fixed mark layer — sits above the split, never translates with it */}
        <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center">
          <VisualMark project={project} />
        </div>

        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </div>

      <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 -translate-x-full -translate-y-full border-l border-t border-accent opacity-0 transition-all duration-300 ease-luxury group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 translate-x-full translate-y-full border-b border-r border-accent opacity-0 transition-all duration-300 ease-luxury group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />

      <div className="relative p-7 pt-5">
        <div className="flex items-start justify-between">
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted transition-colors duration-300 group-hover:text-accent">
            {num} / {project.tag}
          </span>
          {isPrivate && (
            <span className="border border-accent/40 px-2 py-0.5 font-hud text-[9px] uppercase tracking-widest text-accent">
              Collaborators Only
            </span>
          )}
        </div>

        <h3 className="mt-4 font-display text-2xl uppercase leading-none tracking-wide text-fg">{project.name}</h3>

        <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-muted">{project.description}</p>

        <div className="mt-8 flex items-center gap-2 font-hud text-[10px] uppercase tracking-widest text-fg opacity-50 transition-opacity duration-300 group-hover:opacity-100">
          {isPrivate ? (
            <>Access Restricted</>
          ) : (
            <>
              {project.status === 'live' ? 'View Live' : 'View Repository'}
              <span>→</span>
            </>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
