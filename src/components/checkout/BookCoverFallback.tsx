/**
 * Renders in place of a book's cover when the real cover art file isn't
 * present yet (see books.ts — two of the three still have no uploaded
 * image). Not a gray "missing image" box: a real typographic cover
 * built from the same tokens as the rest of the site — Josefin Sans
 * display type, JetBrains Mono for the price/category readout, thin
 * hairline border, obsidian background — so the /books grid still
 * looks intentional rather than broken while real cover art is pending.
 */
export default function BookCoverFallback({
  title,
  large = false,
}: {
  title: string;
  large?: boolean;
}) {
  const words = title.split(' ');

  return (
    <div className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-[#0a0a0a] p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255,255,255,0.5) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(255,255,255,0.5) 24px)',
        }}
      />

      <span className="relative font-hud text-[9px] uppercase tracking-widest text-muted">
        Hemansh / Print
      </span>

      <h4
        className={`relative font-display uppercase leading-[1.05] tracking-wide text-shine ${
          large ? 'text-3xl' : 'text-xl'
        }`}
      >
        {words.map((w, i) => (
          <span key={i} className="block">
            {w}
          </span>
        ))}
      </h4>

      <div className="relative flex items-center justify-between border-t border-line pt-3">
        <span className="font-hud text-[9px] uppercase tracking-widest text-muted">Cover pending</span>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </div>
    </div>
  );
}
