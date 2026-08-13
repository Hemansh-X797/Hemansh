'use client';

import { useEffect, useRef } from 'react';
import { PORTRAIT_DATA_URI } from '@/lib/data/portraitBase64';

type Particle = {
  tx: number; ty: number;
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  a: number;
};

/**
 * The portrait, decomposed into dust — sourced from an inline base64 data
 * URI (PORTRAIT_DATA_URI), so there's no separate image file to go missing
 * or fail to load. Darker pixels sample as denser particles inside a tight
 * oval, forming a legible face rather than generic noise; particles thin
 * out and drift past the oval edge. On hover, inside the oval only: a
 * force field pushes particles clear of the cursor, and a circular lens
 * reveals the real photo in black-and-white underneath.
 */
export default function DustPortrait({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const ctx = ctx2d;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let mouseX = -9999, mouseY = -9999;
    let inOval = false;
    let raf = 0;
    let img: HTMLImageElement | null = null;

    const ovalRect = () => ({ cx: w / 2, cy: h * 0.44, rx: w * 0.3, ry: h * 0.36 });

    const insideOval = (x: number, y: number) => {
      const { cx, cy, rx, ry } = ovalRect();
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      return dx * dx + dy * dy <= 1;
    };

    function buildParticles() {
      if (!img) return;
      const sampleW = 130;
      const sampleH = Math.round((sampleW * img.height) / img.width);
      const off = document.createElement('canvas');
      off.width = sampleW;
      off.height = sampleH;
      const octx = off.getContext('2d');
      if (!octx) return;
      octx.drawImage(img, 0, 0, sampleW, sampleH);
      const data = octx.getImageData(0, 0, sampleW, sampleH).data;

      const { cx, cy, rx, ry } = ovalRect();
      const pts: Particle[] = [];

      for (let sy = 0; sy < sampleH; sy++) {
        for (let sx = 0; sx < sampleW; sx++) {
          const i = (sy * sampleW + sx) * 4;
          const lum = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255;
          const px = cx - rx + (sx / sampleW) * rx * 2;
          const py = cy - ry + (sy / sampleH) * ry * 2;
          if (!insideOval(px, py)) continue;
          const density = Math.pow(1 - lum, 1.4); // sharper falloff — reads as a face, not fog
          if (Math.random() > 0.06 + density * 0.85) continue;
          pts.push({
            tx: px, ty: py,
            x: px + (Math.random() - 0.5) * 70,
            y: py + (Math.random() - 0.5) * 70,
            vx: 0, vy: 0,
            r: 0.7 + Math.random() * 1.0,
            a: 0.4 + density * 0.55,
          });
        }
      }

      const ambientCount = Math.round(pts.length * 0.15);
      for (let i = 0; i < ambientCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 1 + Math.random() * 0.7;
        const px = cx + Math.cos(angle) * rx * dist;
        const py = cy + Math.sin(angle) * ry * dist;
        pts.push({
          tx: px, ty: py,
          x: px + (Math.random() - 0.5) * 30,
          y: py + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 0.04,
          vy: (Math.random() - 0.5) * 0.04,
          r: 0.5 + Math.random() * 0.7,
          a: 0.05 + Math.random() * 0.08,
        });
      }

      particles = pts.slice(0, 4200);
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      inOval = insideOval(mouseX, mouseY);
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      inOval = false;
    };

    const LENS_R = 76;
    const FIELD_R = 128;

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        if (inOval) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const d = Math.hypot(dx, dy);
          if (d < FIELD_R && d > 0.01) {
            const push = (1 - d / FIELD_R) * 2.4;
            p.vx += (dx / d) * push;
            p.vy += (dy / d) * push;
          }
        }
        p.vx += (p.tx - p.x) * 0.025;
        p.vy += (p.ty - p.y) * 0.025;
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = `rgba(235,232,225,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (inOval && img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, LENS_R, 0, Math.PI * 2);
        ctx.clip();
        ctx.filter = 'grayscale(100%) contrast(1.1) brightness(1.05)';
        const { cx, cy, rx, ry } = ovalRect();
        const dw = rx * 2 * 1.65;
        const dh = ry * 2 * 1.65;
        ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
        ctx.filter = 'none';
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, LENS_R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    const image = new Image();
    image.src = PORTRAIT_DATA_URI;
    image.onload = () => {
      img = image;
      resize();
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative aspect-[4/5] w-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
