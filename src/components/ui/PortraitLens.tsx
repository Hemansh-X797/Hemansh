'use client';

import { useRef } from 'react';
import Image from 'next/image';

/**
 * A CSS-only "lens" effect on the real portrait: a circular clipped layer
 * of the same image, scaled up, follows the cursor within the frame —
 * genuine optical-zoom read, not a filter overlay. Grayscale base image
 * sharpens to full color exactly inside the lens circle.
 */
export default function PortraitLens({
  src = '/portrait/hemansh-portrait.jpg',
  alt = 'Hemansh Kumar Mishra',
}: {
  src?: string;
  alt?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || !lensRef.current) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lensRef.current.style.opacity = '1';
    lensRef.current.style.clipPath = `circle(90px at ${x}px ${y}px)`;
    lensRef.current.style.setProperty('--lx', `${(x / rect.width) * 100}%`);
    lensRef.current.style.setProperty('--ly', `${(y / rect.height) * 100}%`);
  };

  const onLeave = () => {
    if (lensRef.current) lensRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={frameRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative aspect-[4/5] w-full max-w-md overflow-hidden border border-line bg-[#0a0a0a]"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 480px"
        className="object-cover grayscale contrast-110"
        priority
      />
      <div
        ref={lensRef}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200"
        style={{ clipPath: 'circle(0px at 50% 50%)' }}
      >
        <Image src={src} alt="" fill sizes="(max-width: 640px) 100vw, 480px" className="scale-125 object-cover" />
        <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(201,162,75,0.6)]" />
      </div>
    </div>
  );
}
