'use client';

import { useEffect, useRef, useState } from 'react';
import { quotes } from '@/lib/data/quotes';

const TYPE_SPEED = 28; // ms per char
const HOLD_MS = 2400;
const FADE_MS = 700;

export default function TypedQuoteCycler() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [visible, setVisible] = useState(true);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    const text = quotes[index].text;
    setTyped('');
    setVisible(true);

    let i = 0;
    const typeNext = () => {
      i++;
      setTyped(text.slice(0, i));
      if (i < text.length) {
        timeouts.current.push(setTimeout(typeNext, TYPE_SPEED));
      } else {
        timeouts.current.push(
          setTimeout(() => {
            setVisible(false);
            timeouts.current.push(
              setTimeout(() => {
                setIndex((prev) => (prev + 1) % quotes.length);
              }, FADE_MS)
            );
          }, HOLD_MS)
        );
      }
    };
    timeouts.current.push(setTimeout(typeNext, TYPE_SPEED));

    return () => timeouts.current.forEach(clearTimeout);
  }, [index]);

  const current = quotes[index];

  return (
    <div className="mx-auto max-w-2xl px-6 text-center">
      <p
        className="min-h-[4.5em] font-hud text-base leading-relaxed text-fg transition-opacity ease-luxury sm:text-lg"
        style={{ opacity: visible ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
      >
        "{typed}"
        <span className="caret text-accent">_</span>
      </p>
      {current.attribution && typed.length === current.text.length && (
        <p className="mt-2 text-xs uppercase tracking-widest text-muted">— {current.attribution}</p>
      )}
    </div>
  );
}
