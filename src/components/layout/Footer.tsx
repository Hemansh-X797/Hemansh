import { socials } from '@/lib/data/socials';
import SocialIconLink from '@/components/ui/SocialIconLink';

export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-14 sm:px-10">
      <div className="flex flex-wrap gap-3">
        {socials.map((s) => (
          <SocialIconLink key={s.key} social={s} />
        ))}
      </div>
      <div className="mt-10 font-hud text-[10px] uppercase tracking-widest text-muted">
        © {new Date().getFullYear()} Hemansh Kumar Mishra. All rights reserved.
      </div>
    </footer>
  );
}
