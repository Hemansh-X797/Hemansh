'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { initFractureRing, FractureRingHandle } from './FractureRing';

const CORNER_SIZE = 340; // a real hero presence, not a small corner icon
const CORNER_MARGIN = 40;
const VIDEO_END = 3000; // matches FrameScrubber's pinned scrub distance
const GROW_ZONE = 900; // video fades out / ring grows to fullscreen over this range
const SHRINK_ZONE = 900; // fullscreen ring shrinks into the corner over this range

export default function PersistentRing() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handle = useRef<FractureRingHandle | null>(null);
  const raf = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;
    handle.current = initFractureRing(canvasRef.current);

    const onMove = (e: PointerEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      handle.current?.setMouse(nx, ny);
      handle.current?.setPointer(e.clientX, e.clientY);
    };
    window.addEventListener('pointermove', onMove);

    let lastSize = -1;
    const loop = () => {
      const isHome = pathname === '/';
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const y = window.scrollY;

      let size: number;
      let top: number;
      let left: number;
      let visible = true;

      if (isHome && y < VIDEO_END) {
        visible = false;
        size = CORNER_SIZE;
        top = vh - CORNER_SIZE - CORNER_MARGIN;
        left = vw - CORNER_SIZE - CORNER_MARGIN;
      } else if (isHome && y < VIDEO_END + GROW_ZONE) {
        const t = (y - VIDEO_END) / GROW_ZONE;
        size = CORNER_SIZE + (Math.max(vw, vh) - CORNER_SIZE) * t;
        const cornerTop = vh - CORNER_SIZE - CORNER_MARGIN;
        const cornerLeft = vw - CORNER_SIZE - CORNER_MARGIN;
        top = cornerTop + (0 - cornerTop) * t;
        left = cornerLeft + (0 - cornerLeft) * t;
      } else if (isHome && y < VIDEO_END + GROW_ZONE + SHRINK_ZONE) {
        const t = (y - VIDEO_END - GROW_ZONE) / SHRINK_ZONE;
        size = Math.max(vw, vh) + (CORNER_SIZE - Math.max(vw, vh)) * t;
        const cornerTop = vh - CORNER_SIZE - CORNER_MARGIN;
        const cornerLeft = vw - CORNER_SIZE - CORNER_MARGIN;
        top = 0 + (cornerTop - 0) * t;
        left = 0 + (cornerLeft - 0) * t;
      } else {
        size = CORNER_SIZE;
        top = vh - CORNER_SIZE - CORNER_MARGIN;
        left = vw - CORNER_SIZE - CORNER_MARGIN;
      }

      if (wrapRef.current) {
        wrapRef.current.style.opacity = visible ? '1' : '0';
        wrapRef.current.style.width = `${size}px`;
        wrapRef.current.style.height = `${size}px`;
        wrapRef.current.style.top = `${top}px`;
        wrapRef.current.style.left = `${left}px`;
        wrapRef.current.style.borderRadius = size >= Math.min(vw, vh) * 0.9 ? '0px' : '9999px';
      }
      handle.current?.setActive(visible);
      if (Math.abs(size - lastSize) > 1) {
        lastSize = size;
        handle.current?.resize();
      }

      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      handle.current?.dispose();
    };
  }, [pathname]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed z-30 overflow-hidden transition-[border-radius] duration-300"
      style={{ width: CORNER_SIZE, height: CORNER_SIZE, opacity: 0 }}
    >
      <canvas ref={canvasRef} className="pointer-events-auto h-full w-full" />
    </div>
  );
}
