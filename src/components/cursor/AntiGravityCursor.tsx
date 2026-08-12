'use client';

import { useEffect, useRef } from 'react';

/**
 * Deliberately boring physics: a straight critically-damped lerp, no spring
 * overshoot, no rotation gimmick. The dot tracks the raw cursor almost 1:1;
 * the ring trails a touch slower and expands to frame whatever is under
 * [data-magnetic]. That restraint IS the luxury cue — nothing wobbles.
 */
export default function AntiGravityCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>();

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let ringSize = 20;
    let targetSize = 20;

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

      // no overshoot: single exponential approach, no velocity term
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;
      targetSize = magnet ? 0 : 20; // 0 signals "use magnet bounds" below
      ringSize += ((magnet ? ringSize : 20) - ringSize) * 0.25;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        dotRef.current.style.opacity = magnet ? '0' : '1';
      }

      if (ringRef.current) {
        if (magnet) {
          const rect = magnet.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          ringX += (cx - ringX) * 0.3;
          ringY += (cy - ringY) * 0.3;
          const w = rect.width + 12;
          const h = rect.height + 12;
          ringRef.current.style.width = `${w}px`;
          ringRef.current.style.height = `${h}px`;
          ringRef.current.style.borderRadius = '0px';
        } else {
          ringRef.current.style.width = `${ringSize}px`;
          ringRef.current.style.height = `${ringSize}px`;
          ringRef.current.style.borderRadius = '9999px';
        }
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        ringRef.current.dataset.locked = magnet ? 'true' : 'false';
      }

      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, 14px)`;
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
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-fg transition-opacity duration-150 will-change-transform"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] border border-fg/50 transition-[border-color] duration-200 will-change-transform [[data-locked=true]_&]:border-accent"
        data-locked="false"
      />
      <div
        ref={labelRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] whitespace-nowrap font-hud text-[9px] uppercase tracking-widest text-accent opacity-0 transition-opacity duration-150 will-change-transform"
      />
    </>
  );
}
