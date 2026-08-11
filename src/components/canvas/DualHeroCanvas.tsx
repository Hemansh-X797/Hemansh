'use client';

import { useEffect, useRef, useState } from 'react';
import { initFrameScrubber, ScrubberHandle } from './FrameScrubber';
import { initFractureRing, FractureRingHandle } from './FractureRing';
import PreloadGate from '../loader/PreloadGate';

type Mode = 'loading' | 'scrubber' | 'ring';

export default function DualHeroCanvas() {
  const pinRef = useRef<HTMLDivElement>(null);
  const scrubCanvasRef = useRef<HTMLCanvasElement>(null);
  const ringCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrubberHandle = useRef<ScrubberHandle | null>(null);
  const ringHandle = useRef<FractureRingHandle | null>(null);

  const [mode, setMode] = useState<Mode>('loading');
  const [progress, setProgress] = useState(0);

  // Init frame scrubber (also drives the loader progress)
  useEffect(() => {
    scrubberHandle.current = initFrameScrubber(
      scrubCanvasRef,
      pinRef,
      (p) => setProgress(p),
      () => setMode((m) => (m === 'loading' ? 'scrubber' : m)),
      () => setMode('ring')
    );
    return () => scrubberHandle.current?.kill();
  }, []);

  // Init fracture ring once, keep mounted, toggle active/inactive rather than remount
  useEffect(() => {
    if (!ringCanvasRef.current) return;
    ringHandle.current = initFractureRing(ringCanvasRef.current);

    const onResize = () => ringHandle.current?.resize();
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      ringHandle.current?.setMouse(nx, ny);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      ringHandle.current?.dispose();
    };
  }, []);

  useEffect(() => {
    ringHandle.current?.setActive(mode === 'ring');
  }, [mode]);

  return (
    <>
      {mode === 'loading' && (
        <PreloadGate progress={progress} onDone={() => setMode('scrubber')} />
      )}

      {/* Hero I — pinned frame scrubber section */}
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-bg">
        <canvas ref={scrubCanvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      {/* Hero II — obsidian fracture ring, fixed underlay, revealed once scrubber completes */}
      <canvas
        ref={ringCanvasRef}
        className="fixed left-0 top-0 z-0 h-screen w-full transition-opacity duration-1000"
        style={{ opacity: mode === 'ring' ? 1 : 0, pointerEvents: mode === 'ring' ? 'auto' : 'none' }}
      />
    </>
  );
}
