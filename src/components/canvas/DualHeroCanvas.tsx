'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initFrameScrubber, ScrubberHandle } from './FrameScrubber';
import { initFractureRing, FractureRingHandle } from './FractureRing';
import PreloadGate from '../loader/PreloadGate';

gsap.registerPlugin(ScrollTrigger);

type Mode = 'loading' | 'scrubber' | 'ring';

export default function DualHeroCanvas() {
  const pinRef = useRef<HTMLDivElement>(null);
  const scrubCanvasRef = useRef<HTMLCanvasElement>(null);
  const ringSectionRef = useRef<HTMLDivElement>(null);
  const ringCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrubberHandle = useRef<ScrubberHandle | null>(null);
  const ringHandle = useRef<FractureRingHandle | null>(null);

  const [mode, setMode] = useState<Mode>('loading');
  const [progress, setProgress] = useState(0);

  // Hero I — frame scrubber, pinned for its own 3000px scroll span
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

  // Hero II — fracture ring, lives in its OWN section further down the page,
  // sized to that section (not fullscreen), activated only while in view.
  useEffect(() => {
    if (!ringCanvasRef.current || !ringSectionRef.current) return;
    ringHandle.current = initFractureRing(ringCanvasRef.current);

    const onResize = () => ringHandle.current?.resize();
    const onMove = (e: PointerEvent) => {
      const rect = ringSectionRef.current!.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      ringHandle.current?.setMouse(nx, ny);
      ringHandle.current?.setPointer(e.clientX, e.clientY);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove);

    const st = ScrollTrigger.create({
      trigger: ringSectionRef.current,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => ringHandle.current?.setActive(true),
      onLeave: () => ringHandle.current?.setActive(false),
      onEnterBack: () => ringHandle.current?.setActive(true),
      onLeaveBack: () => ringHandle.current?.setActive(false),
    });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      st.kill();
      ringHandle.current?.dispose();
    };
  }, []);

  return (
    <>
      {mode === 'loading' && <PreloadGate progress={progress} onDone={() => setMode('scrubber')} />}

      {/* Hero I — pinned frame-scrubber video */}
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-bg">
        <canvas ref={scrubCanvasRef} className="absolute inset-0 h-full w-full" />
        {/* covers the source watermark baked into the top-left of the generated frames */}
        <div className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-2 sm:left-10 sm:top-8">
          <span className="h-1.5 w-1.5 bg-accent" />
          <span className="font-hud text-[10px] uppercase tracking-widest text-fg/80">Hemansh · System</span>
        </div>
      </div>

      {/* Hero II — obsidian fracture ring, its own dedicated full-height section */}
      <section
        ref={ringSectionRef}
        className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden border-t border-line bg-bg"
      >
        <canvas ref={ringCanvasRef} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute left-6 top-8 z-10 sm:left-10">
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">Hero II · Object</span>
        </div>
        <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-center">
          <span className="font-hud text-[10px] uppercase tracking-widest text-muted">
            Hover the surface — it breaks toward you
          </span>
        </div>
      </section>
    </>
  );
}
