'use client';

import { useRef } from 'react';
import gsap from 'gsap';

/**
 * A genuinely custom mark for Pulse, not a stock flame icon: three layered
 * flame paths (core / mid / outer) in green, each with its own idle flicker
 * timeline. Hover intensifies the flicker and brightens; click triggers a
 * single sharp "pulse" — a quick scale-punch + brightness flash — matching
 * the product name rather than just being decorative motion.
 */
export default function PulseFlameLogo({ size = 40 }: { size?: number }) {
  const rootRef = useRef<SVGSVGElement>(null);
  const coreRef = useRef<SVGPathElement>(null);
  const midRef = useRef<SVGPathElement>(null);
  const outerRef = useRef<SVGPathElement>(null);

  const flicker = (intensity: number) => {
    [outerRef, midRef, coreRef].forEach((ref, i) => {
      if (!ref.current) return;
      gsap.to(ref.current, {
        scaleY: 1 + intensity * (0.06 + i * 0.02) * (Math.random() > 0.5 ? 1 : -1),
        duration: 0.35 + Math.random() * 0.25,
        ease: 'sine.inOut',
        transformOrigin: '50% 100%',
        onComplete: () => flicker(intensity),
      });
    });
  };

  const handleEnter = () => {
    gsap.killTweensOf([coreRef.current, midRef.current, outerRef.current]);
    flicker(1.6);
    gsap.to(rootRef.current, { filter: 'brightness(1.35) saturate(1.2)', duration: 0.3 });
  };

  const handleLeave = () => {
    gsap.killTweensOf([coreRef.current, midRef.current, outerRef.current]);
    flicker(1);
    gsap.to(rootRef.current, { filter: 'brightness(1) saturate(1)', duration: 0.4 });
  };

  const handleClick = () => {
    gsap.timeline()
      .to(rootRef.current, { scale: 1.18, duration: 0.12, ease: 'power2.out' })
      .to(rootRef.current, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
      .to(rootRef.current, { filter: 'brightness(2) saturate(1.4)', duration: 0.08 }, 0)
      .to(rootRef.current, { filter: 'brightness(1) saturate(1)', duration: 0.6 }, 0.1);
  };

  return (
    <svg
      ref={rootRef}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      data-magnetic
      data-cursor-label="PULSE"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className="cursor-none"
      style={{ transformOrigin: '50% 50%' }}
    >
      <path
        ref={outerRef}
        d="M20 3C13 11 9 17 9 24a11 11 0 0 0 22 0c0-4-1.5-7-4-10 .3 3-1 5-2.5 5.5C26 15 23 10 20 3Z"
        fill="#1f7a3f"
        opacity="0.55"
      />
      <path
        ref={midRef}
        d="M20 9c-4.5 6-7 10.5-7 15a7 7 0 0 0 14 0c0-2.5-.8-4.5-2.3-6.3.1 2-.9 3.2-2 3.6C23.5 17 22 13 20 9Z"
        fill="#38c96a"
        opacity="0.85"
      />
      <path
        ref={coreRef}
        d="M20 15c-2 3-3 5-3 7.5a3.2 3.2 0 0 0 6.4 0c0-1.2-.4-2-1-2.9 0 1-.5 1.5-1 1.7-.7-2-.7-3.8-1.4-6.3Z"
        fill="#c9ffdf"
      />
    </svg>
  );
}
