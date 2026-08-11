'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Gates first paint of the real site behind a deliberate, unapologetic loading
 * sequence. Progress is REAL — driven by the frame-sequence preload count
 * (via the `progress` prop, 0-1), not a fake timed bar. The copy communicates
 * "wait for me" rather than apologizing for the wait.
 */
export default function PreloadGate({
  progress,
  onDone,
}: {
  progress: number; // 0..1, from frame preloader
  onDone: () => void;
}) {
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current || !pctRef.current) return;
    gsap.to(barRef.current, { scaleX: progress, duration: 0.4, ease: 'power2.out' });
    gsap.to(pctRef.current, {
      textContent: Math.round(progress * 100),
      duration: 0.4,
      snap: { textContent: 1 },
      onUpdate: function () {
        if (pctRef.current) pctRef.current.textContent = `${Math.round(gsap.getProperty(this.targets()[0], 'textContent') as number)}%`;
      },
    });

    if (progress >= 1 && !exiting) {
      setExiting(true);
      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(rootRef.current, { delay: 0.35, duration: 0.9, yPercent: -100, ease: 'power4.inOut' });
    }
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-bg"
    >
      <div className="mb-10 font-display text-xs uppercase tracking-widest2 text-muted">
        Hemansh Kumar Mishra
      </div>
      <div className="mb-6 h-px w-64 origin-left bg-line">
        <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
      <div ref={pctRef} className="font-hud text-sm text-fg">0%</div>
      <div className="mt-10 max-w-xs text-center font-hud text-[10px] uppercase tracking-widest text-muted">
        You are entering a system, not a page. Give it a second.
      </div>
    </div>
  );
}
