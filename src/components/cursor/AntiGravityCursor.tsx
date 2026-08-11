'use client';

import { useEffect, useRef } from 'react';
import { AntiGravitySpring, magneticPull } from '@/lib/physics/antigravity';

/**
 * Not a dot. Not a ring. An asymmetric open bracket — like a camera viewfinder
 * corner-frame — that continuously rotates at idle (slow, mechanical, never
 * stops), snaps into a tight square lock around magnetic targets, and drags
 * a single thin blade-line behind it that points back at true cursor position.
 * The rotation + asymmetry is what kills the "generic AI cursor" read: nothing
 * about it is a circle or a centered ring.
 */
export default function AntiGravityCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bladeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>();
  const rotation = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const pos = new AntiGravitySpring(0.3, 0.74);
    const blade = new AntiGravitySpring(0.06, 0.86);
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

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
        const force = magneticPull({ x: mouseX, y: mouseY }, rect);
        if (force) {
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
      let tx = mouseX;
      let ty = mouseY;
      let w = 26;
      let h = 26;

      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        tx = rect.left + rect.width / 2;
        ty = rect.top + rect.height / 2;
        w = rect.width + 14;
        h = rect.height + 14;
      }

      pos.setTarget(tx, ty);
      blade.setTarget(mouseX, mouseY);
      const p = pos.step();
      const b = blade.step();

      // idle rotation never stops; locking onto a magnet snaps it to axis-aligned
      rotation.current = magnet ? 0 : rotation.current + 0.6;

      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) rotate(${rotation.current}deg)`;
        rootRef.current.style.width = `${w}px`;
        rootRef.current.style.height = `${h}px`;
        rootRef.current.dataset.locked = magnet ? 'true' : 'false';
      }

      // blade: a thin line from the reticle center to raw cursor position —
      // reads as a targeting laser, disappears when locked
      if (bladeRef.current) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const len = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        bladeRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${angle}deg)`;
        bladeRef.current.style.width = `${Math.min(len, 120)}px`;
        bladeRef.current.style.opacity = magnet ? '0' : Math.min(len / 60, 0.5).toString();
      }

      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${b.x + 20}px, ${b.y + 20}px, 0)`;
        labelRef.current.style.opacity = magnet ? '1' : '0';
        labelRef.current.textContent = magnet?.dataset.cursorLabel ?? 'VIEW';
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
        ref={bladeRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-px origin-left bg-fg/40 will-change-transform"
      />
      <div
        ref={rootRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] will-change-transform"
        data-locked="false"
      >
        <svg viewBox="0 0 26 26" className="h-full w-full overflow-visible">
          <g className="[[data-locked=true]_&]:stroke-accent stroke-fg" fill="none" strokeWidth="1.1">
            <path d="M1 8 V1 H8" />
            <path d="M25 6 V1 H19" />
            <path d="M25 18 V25 H16" />
            <path d="M9 25 H1 V20" />
          </g>
        </svg>
      </div>
      <div
        ref={labelRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] whitespace-nowrap font-hud text-[10px] uppercase tracking-widest text-accent opacity-0 transition-opacity duration-150 will-change-transform"
      />
    </>
  );
}
