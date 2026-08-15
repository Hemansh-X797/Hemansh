import Link from 'next/link';
import Image from 'next/image';

const links = [
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Work' },
  { href: '/books', label: 'Books' },
  { href: '/stack', label: 'Stack' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  return (
    <nav className="fixed left-0 top-0 z-50 flex w-full items-center justify-between px-6 py-5 sm:px-10">
      <Link
        href="/"
        data-magnetic
        data-cursor-label="HOME"
        className="flex items-center gap-2.5"
      >
        <Image
          src="/logo-h.png"
          alt=""
          width={22}
          height={22}
          className="h-[22px] w-[22px] shrink-0"
          priority
        />
        <span className="text-shine font-display text-sm uppercase tracking-widest2">Hemansh</span>
      </Link>
      <ul className="hidden gap-8 sm:flex">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              data-magnetic
              data-cursor-label="GO"
              className="font-hud text-[11px] uppercase tracking-widest text-muted transition-colors duration-300 hover:text-accent"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
