'use client';

import Image from 'next/image';
import { Project } from '@/lib/data/projects';
import PulseFlameLogo from './PulseFlameLogo';
import VinceOrb from './VinceOrb';

/**
 * The visual band is a real split-slice card (ported from your test6.html
 * reference): the mark is rendered twice, each half clipped to 50% width,
 * and on hover the two halves displace vertically in opposite directions —
 * the actual mechanism from the file, not a redraw of the idea. No stock
 * photos are faked in; each project gets its own real mark (Pulse's flame,
 * V.I.N.C.E.'s orb, Conclave's real logo) rendered large.
 */
function VisualMark({ project }: { project: Project }) {
  if (project.slug === 'pulse') return <PulseFlameLogo size={72} />;
  if (project.slug === 'vince') return <VinceOrb size={104} />;
  if (project.logo) {
    return (
      <div className="relative h-20 w-20 opacity-90">
        <Image src={project.logo} alt="" fill className="object-contain" />
      </div>
    );
  }
  return (
    <span className="font-display text-6xl uppercase tracking-widest text-muted/40">
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
      {/* visual band — split into two slices that displace apart on hover */}
      <div className="relative h-52 w-full overflow-hidden bg-[#070707]">
        <div className="absolute left-0 top-0 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-luxury group-hover:-translate-y-3">
          <div className="flex h-full w-[200%] items-center justify-center">
            <VisualMark project={project} />
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-luxury group-hover:translate-y-3">
          <div className="relative -right-1/2 flex h-full w-[200%] items-center justify-center">
            <VisualMark project={project} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </div>

      {/* corner brackets — snap in on hover */}
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
