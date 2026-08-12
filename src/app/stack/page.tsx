'use client';

import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { languages, frameworks, databases, other, skillTable } from '@/lib/data/stack';
import { useLenis } from '@/hooks/useLenis';

function Row({ label, items }: { label: string; items: string[] }) {
  return (
    <Reveal className="border-b border-line py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="font-hud text-[10px] uppercase tracking-widest text-muted sm:w-40">{label}</span>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {items.map((it) => (
            <span key={it} className="border border-line px-3 py-1 font-hud text-xs uppercase tracking-widest text-fg">
              {it}
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export default function StackPage() {
  useLenis();

  return (
    <main className="relative bg-bg pt-40">
      <section className="mx-auto max-w-4xl px-6 pb-16 sm:px-10">
        <Reveal>
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">04 / Stack</span>
          <h1 className="mt-4 font-display text-4xl uppercase leading-tight tracking-wide text-shine sm:text-5xl">
            System Readout
          </h1>
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <Row label="Languages" items={languages} />
          <Row label="Frameworks" items={frameworks} />
          <Row label="Data" items={databases} />
          <Row label="Other" items={other} />
        </div>
      </section>

      <section className="border-t border-line px-6 py-16 hud-grid sm:px-10">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="font-display text-xl uppercase tracking-widest2 text-fg">Beyond Code</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
            {skillTable.map((row, i) => (
              <Reveal key={row.category} delay={(i % 2) * 0.06} className="bg-bg p-6">
                <span className="font-hud text-[10px] uppercase tracking-widest text-accent">{row.category}</span>
                <p className="mt-3 font-body text-sm leading-relaxed text-muted">{row.skill}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
