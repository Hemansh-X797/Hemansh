import { socials } from '@/lib/data/socials';

export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-14 sm:px-10">
      <div className="flex flex-wrap gap-3">
        {socials.map((s) => (
          <a
            key={s.key}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            data-magnetic
            className="border border-line px-4 py-2 font-hud text-[10px] uppercase tracking-widest text-muted transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            {s.label} · {s.handle}
          </a>
        ))}
      </div>
      <div className="mt-10 font-hud text-[10px] uppercase tracking-widest text-muted">
        © {new Date().getFullYear()} Hemansh Kumar Mishra. All rights reserved.
      </div>
    </footer>
  );
}
