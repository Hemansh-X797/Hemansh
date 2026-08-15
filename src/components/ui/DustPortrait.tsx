'use client';

import { useEffect, useRef, useState } from 'react';
import { PORTRAIT_DATA_URI } from '@/lib/data/portraitBase64';

/**
 * The portrait, rebuilt on the technique that actually reads as premium:
 * dust particles sampled from real image brightness, drawn in two passes
 * (a soft additive glow halo, then a crisp core dot) so they look lit
 * rather than flat, a genuine 3D tilt that follows the cursor within the
 * frame, a slow "breathing" idle scale when untouched, and — the piece
 * the old hover-lens version didn't have — a real click-to-disperse:
 * the dust blows outward from the click point and the actual sharp
 * portrait fades in underneath. Click again to pull the dust back
 * together. Colors are the site's own obsidian/bronze tokens, not the
 * reference's neon palette.
 */
export default function DustPortrait({ className = '' }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const srcImgRef = useRef<HTMLImageElement>(null);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    const tiltWrapper = tiltRef.current;
    const canvas = canvasRef.current;
    const srcImg = srcImgRef.current;
    if (!stage || !tiltWrapper || !canvas || !srcImg) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    type Particle = {
      baseX: number; baseY: number; x: number; y: number;
      r: number; alpha: number; alpha0: number;
      phase: number; speed: number; amp: number;
      vx: number; vy: number; dispersing: boolean;
      depth: number;
    };

    let W = 0, H = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let mouse = { x: -9999, y: -9999, active: false };
    let tiltTarget = { x: 0, y: 0 };
    let tiltCurrent = { x: 0, y: 0 };
    let lastInteraction = performance.now();
    let breathePhase = 0;
    const TILT_MAX = 7;
    const FORCE_RADIUS = 46;

    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = stage!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function buildParticles() {
      sizeCanvas();
      const sampleW = 90;
      const sampleH = Math.round(sampleW * (H / W || 1));
      const off = document.createElement('canvas');
      off.width = sampleW;
      off.height = sampleH;
      const octx = off.getContext('2d');
      if (!octx) return;

      const iw = srcImg!.naturalWidth || 1;
      const ih = srcImg!.naturalHeight || 1;
      const scale = Math.max(sampleW / iw, sampleH / ih); // cover, matches CSS object-fit: cover
      const dw = iw * scale, dh = ih * scale;
      const dx = (sampleW - dw) / 2;
      const dy = (sampleH - dh) / 2;
      octx.drawImage(srcImg!, dx, dy, dw, dh);

      let data: Uint8ClampedArray | null = null;
      try {
        data = octx.getImageData(0, 0, sampleW, sampleH).data;
      } catch {
        data = null;
      }

      function brightnessAt(nx: number, ny: number) {
        const sx = Math.min(sampleW - 1, Math.max(0, Math.round(nx * (sampleW - 1))));
        const sy = Math.min(sampleH - 1, Math.max(0, Math.round(ny * (sampleH - 1))));
        if (!data) return 0.55;
        const idx = (sy * sampleW + sx) * 4;
        return (data[idx] + data[idx + 1] + data[idx + 2]) / (3 * 255);
      }

      const pts: Particle[] = [];
      const gridCols = 74;
      const gridRows = Math.round(gridCols * (H / W || 1));
      const cellW = W / gridCols, cellH = H / gridRows;

      for (let gy = 0; gy < gridRows; gy++) {
        for (let gx = 0; gx < gridCols; gx++) {
          const px = gx * cellW + cellW * 0.5;
          const py = gy * cellH + cellH * 0.5;
          const nx = px / W, ny = py / H;
          const b = brightnessAt(nx, ny);
          const adj = Math.max(0, (b - 0.05) / 0.95);
          const faceBoost = Math.pow(adj, 0.7);
          const density = Math.min(1, 0.22 + faceBoost * 0.74);
          if (Math.random() > density) continue;

          const baseX = px + (Math.random() - 0.5) * cellW * 1.05;
          const baseY = py + (Math.random() - 0.5) * cellH * 1.05;
          const alpha = Math.min(1, 0.26 + density * 0.7 + Math.random() * 0.1);
          pts.push({
            baseX, baseY, x: baseX, y: baseY,
            r: 0.42 + density * 1.0 + Math.random() * 0.25,
            alpha, alpha0: alpha,
            phase: Math.random() * Math.PI * 2,
            speed: 0.006 + Math.random() * 0.01,
            amp: 1.8 + Math.random() * 3.2,
            vx: 0, vy: 0, dispersing: false,
            depth: 0.3 + Math.random() * 0.9,
          });
        }
      }
      particles = pts.slice(0, 6500);
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // pass 1: additive glow halo
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        if (p.dispersing) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.alpha *= 0.965;
        } else {
          p.phase += p.speed;
          let targetX = p.baseX + Math.sin(p.phase) * p.amp + tiltCurrent.y * p.depth * 0.6;
          let targetY = p.baseY + Math.cos(p.phase * 0.85) * p.amp - tiltCurrent.x * p.depth * 0.6;
          if (mouse.active && !revealedRef.current) {
            const dx = targetX - mouse.x, dy = targetY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < FORCE_RADIUS) {
              const nx2 = dx / (dist || 1), ny2 = dy / (dist || 1);
              const tx = -ny2, ty = nx2;
              let bx = nx2 * 0.85 + tx * 0.38, by = ny2 * 0.85 + ty * 0.38;
              const blen = Math.sqrt(bx * bx + by * by) || 1;
              bx /= blen; by /= blen;
              targetX = mouse.x + bx * FORCE_RADIUS * 1.03;
              targetY = mouse.y + by * FORCE_RADIUS * 1.03;
            }
          }
          p.x += (targetX - p.x) * 0.16;
          p.y += (targetY - p.y) * 0.16;
        }
        if (p.alpha <= 0.01 || p.r < 1.1) continue;
        const haloAlpha = p.alpha * 0.22;
        if (haloAlpha <= 0) continue;
        ctx.fillStyle = `rgba(201,162,75,${haloAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // pass 2: crisp core dots
      for (const p of particles) {
        if (p.alpha <= 0.01) continue;
        ctx.fillStyle = `rgba(245,240,230,${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      applyTilt();
      raf = requestAnimationFrame(draw);
    }

    function applyTilt() {
      tiltCurrent.x += (tiltTarget.x - tiltCurrent.x) * 0.08;
      tiltCurrent.y += (tiltTarget.y - tiltCurrent.y) * 0.08;

      const idleFor = performance.now() - lastInteraction;
      let scale = 1;
      if (!revealedRef.current && idleFor > 1600) {
        breathePhase += 0.012;
        scale = 1 + Math.sin(breathePhase) * 0.01;
      }
      tiltWrapper!.style.transform = `scale(${scale}) rotateX(${tiltCurrent.x}deg) rotateY(${tiltCurrent.y}deg)`;
    }

    function onMove(e: PointerEvent) {
      const rect = stage!.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      mouse.x = px;
      mouse.y = py;
      mouse.active = px >= 0 && px <= W && py >= 0 && py <= H && !revealedRef.current;
      lastInteraction = performance.now();

      if (!revealedRef.current) {
        const cx = W / 2, cy = H / 2;
        const nx = Math.max(-1, Math.min(1, (px - cx) / (W / 2 || 1)));
        const ny = Math.max(-1, Math.min(1, (py - cy) / (H / 2 || 1)));
        tiltTarget.x = -ny * TILT_MAX;
        tiltTarget.y = nx * TILT_MAX;
      }
    }

    function onLeave() {
      mouse.active = false;
      tiltTarget.x = 0;
      tiltTarget.y = 0;
    }

    function disperse() {
      if (revealedRef.current) return;
      revealedRef.current = true;
      setRevealed(true);

      const cx = W / 2, cy = H / 2;
      for (const p of particles) {
        const dx = p.x - cx, dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 3 + Math.random() * 5;
        p.vx = (dx / dist) * speed + (Math.random() - 0.5) * 2;
        p.vy = (dy / dist) * speed + (Math.random() - 0.5) * 2;
        p.dispersing = true;
      }
    }

    function reset() {
      revealedRef.current = false;
      setRevealed(false);
      for (const p of particles) {
        p.x = p.baseX;
        p.y = p.baseY;
        p.alpha = p.alpha0;
        p.dispersing = false;
        p.vx = 0;
        p.vy = 0;
      }
    }

    const onClick = () => {
      if (revealedRef.current) reset();
      else disperse();
    };

    const init = () => {
      buildParticles();
    };
    if (srcImg.complete && srcImg.naturalWidth) init();
    else srcImg.onload = init;

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildParticles, 150);
    };

    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stage.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={`relative aspect-[4/5] w-full cursor-pointer overflow-hidden ${className}`}
      style={{ perspective: '900px' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- used only as an offscreen sample source, never rendered */}
      <img ref={srcImgRef} src={PORTRAIT_DATA_URI} alt="" className="hidden" crossOrigin="anonymous" />

      <div
        ref={tiltRef}
        className="absolute inset-0 transition-opacity duration-500"
        style={{ transformStyle: 'preserve-3d', opacity: revealed ? 0 : 1, pointerEvents: revealed ? 'none' : 'auto' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      <div
        ref={revealRef}
        aria-hidden
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: revealed ? 1 : 0, pointerEvents: revealed ? 'auto' : 'none' }}
      >
        <img
          src={PORTRAIT_DATA_URI}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: 'grayscale(35%) contrast(1.08) brightness(1.02)' }}
        />
      </div>

      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-hud text-[9px] uppercase tracking-widest text-muted opacity-60">
        {revealed ? 'Click to re-scatter' : 'Click to reveal'}
      </span>
    </div>
  );
}
