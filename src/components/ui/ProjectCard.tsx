import { Project } from '@/lib/data/projects';

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
        className="group relative block overflow-hidden border border-line bg-bg p-7 transition-[border-color,background-color] duration-500 ease-luxury hover:border-accent"
      >
        {children}
      </a>
    ) : (
      <div
        data-magnetic
        data-cursor-label="LOCKED"
        className="group relative block overflow-hidden border border-line bg-bg p-7"
      >
        {children}
      </div>
    );

  return (
    <Wrapper>
      {/* corner brackets — snap in on hover, echoes the cursor's own bracket motif */}
      <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 -translate-x-full -translate-y-full border-l border-t border-accent opacity-0 transition-all duration-300 ease-luxury group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 translate-x-full translate-y-full border-b border-r border-accent opacity-0 transition-all duration-300 ease-luxury group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />

      {/* diagonal sweep fill on hover */}
      <span className="pointer-events-none absolute inset-0 origin-top-left -translate-x-full skew-x-[-12deg] bg-accent/[0.04] transition-transform duration-500 ease-luxury group-hover:translate-x-0" />

      <div className="relative flex items-start justify-between">
        <span className="font-hud text-[10px] uppercase tracking-widest text-muted transition-colors duration-300 group-hover:text-accent">
          {num} / {project.tag}
        </span>
        {isPrivate && (
          <span className="border border-accent/40 px-2 py-0.5 font-hud text-[9px] uppercase tracking-widest text-accent">
            Collaborators Only
          </span>
        )}
      </div>

      <h3 className="relative mt-5 font-display text-2xl uppercase leading-none tracking-wide text-fg transition-transform duration-500 ease-luxury group-hover:translate-x-1">
        {project.name}
      </h3>

      <p className="relative mt-4 max-w-xs font-body text-sm leading-relaxed text-muted">
        {project.description}
      </p>

      <div className="relative mt-8 flex items-center gap-2 font-hud text-[10px] uppercase tracking-widest text-fg opacity-50 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
        {isPrivate ? (
          <>Access Restricted</>
        ) : (
          <>
            {project.status === 'live' ? 'View Live' : 'View Repository'}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </>
        )}
      </div>
    </Wrapper>
  );
}
