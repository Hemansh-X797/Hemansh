'use client';

import { useEffect, useRef, useState } from 'react';
import { initFrameScrubber, ScrubberHandle } from './FrameScrubber';
import PreloadGate from '../loader/PreloadGate';

export default function DualHeroCanvas() {
  const pinRef = useRef<HTMLDivElement>(null);
  const scrubCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrubberHandle = useRef<ScrubberHandle | null>(null);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    scrubberHandle.current = initFrameScrubber(
      scrubCanvasRef,
      pinRef,
      (p) => setProgress(p),
      () => setLoading(false),
      () => {} // ring's own fade timeline is driven by scroll position directly, see PersistentRing
    );
    return () => scrubberHandle.current?.kill();
  }, []);

  return (
    <>
      {loading && <PreloadGate progress={progress} onDone={() => setLoading(false)} />}

      {/* Hero I — pinned frame-scrubber video. Fade-out (not a hard cut) is handled
          by PersistentRing reading the same scroll range and crossfading itself in. */}
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-bg" data-hero-video>
        <canvas ref={scrubCanvasRef} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-2 sm:left-10 sm:top-8">
          <span className="h-1.5 w-1.5 bg-accent" />
          <span className="font-hud text-[10px] uppercase tracking-widest text-fg/80">Hemansh · System</span>
        </div>
      </div>
    </>
  );
}
