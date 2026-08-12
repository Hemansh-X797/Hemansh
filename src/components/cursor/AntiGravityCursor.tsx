'use client';

import { useEffect, useRef } from 'react';

/**
 * One shape only — a small faceted obsidian shard (clip-path polygon, dark
 * fill + thin bevel edge), not a dot, not a ring, not a dot-with-a-ring.
 * Straight exponential follow, no spring overshoot. On a magnetic target it
 * flattens into a thin bracket-edge outline sized to that element instead of
 * spawning a second shape.
 */
export default function AntiGravityCursor() {
  const shardRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>();

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let x = mouseX;
    let y = mouseY;
    let rot = 0;

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const findMagnet = (): HTMLElement | null => {
      const els = document.querySelectorAll<HTMLElement>('[data-magnetic]');
      let closest: HTMLElement | null = null;
      let bestDist = Infinity;
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (
          mouseX > rect.left - 8 &&
          mouseX < rect.right + 8 &&
          mouseY > rect.top - 8 &&
          mouseY < rect.bottom + 8
        ) {
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const d = Math.hypot(cx - mouseX, cy - mouseY);
          if (d < bestDist) {
            bestDist = d;
            closest = el;
          }
        }
      });
      return closest;
    };

    const tick = () => {
      const magnet = findMagnet();
      x += (mouseX - x) * 0.22;
      y += (mouseY - y) * 0.22;
      rot = magnet ? 0 : rot + 0.35; // shard slowly rotates at idle, stills when locked

      if (shardRef.current) {
        if (magnet) {
          const rect = magnet.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          x += (cx - x) * 0.3;
          y += (cy - y) * 0.3;
          shardRef.current.style.width = `${rect.width + 12}px`;
          shardRef.current.style.height = `${rect.height + 12}px`;
          shardRef.current.dataset.mode = 'frame';
        } else {
          shardRef.current.style.width = '16px';
          shardRef.current.style.height = '16px';
          shardRef.current.dataset.mode = 'shard';
        }
        shardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rot}deg)`;
      }

      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, 16px)`;
        labelRef.current.style.opacity = magnet?.dataset.cursorLabel ? '1' : '0';
        labelRef.current.textContent = magnet?.dataset.cursorLabel ?? '';
      }

      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove);
    rafId.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <div
        ref={shardRef}
        data-mode="shard"
        className="pointer-events-none fixed left-0 top-0 z-[9999] bg-fg transition-[background-color,border-color] duration-200 will-change-transform
          data-[mode=shard]:[clip-path:polygon(50%_0%,100%_38%,80%_100%,20%_100%,0%_38%)]
          data-[mode=frame]:border data-[mode=frame]:border-accent data-[mode=frame]:bg-transparent"
      />
      <div
        ref={labelRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] whitespace-nowrap font-hud text-[9px] uppercase tracking-widest text-accent opacity-0 transition-opacity duration-150 will-change-transform"
      />
    </>
  );
}
