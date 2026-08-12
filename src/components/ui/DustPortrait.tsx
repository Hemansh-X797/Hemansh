'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  tx: number; ty: number;
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  a: number;
};

/**
 * The real portrait, decomposed into dust. On load: the source photo is
 * sampled off-screen; darker pixels (features, shadow) become denser
 * particle targets inside an oval, sparser particles scatter and drift
 * beyond the oval edge. On hover, inside the oval only: a force field
 * pushes particles away from the cursor, and a circular lens reveals the
 * real black-and-white photo underneath.
 */
export default function DustPortrait({
  src = '/portrait/hemansh-portrait.jpg',
  className = '',
}: {
  src?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let mouseX = -9999, mouseY = -9999;
    let inOval = false;
    let raf = 0;
    let img: HTMLImageElement | null = null;

    const ovalRect = () => ({ cx: w / 2, cy: h / 2, rx: w * 0.34, ry: h * 0.42 });

    const insideOval = (x: number, y: number) => {
      const { cx, cy, rx, ry } = ovalRect();
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      return dx * dx + dy * dy <= 1;
    };

    function buildParticles() {
      if (!img) return;
      const sampleW = 90;
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
          const density = 1 - lum;
          if (Math.random() > 0.15 + density * 0.55) continue;
          pts.push({
            tx: px + (Math.random() - 0.5) * 2,
            ty: py + (Math.random() - 0.5) * 2,
            x: px + (Math.random() - 0.5) * 60,
            y: py + (Math.random() - 0.5) * 60,
            vx: 0, vy: 0,
            r: 0.6 + Math.random() * 1.1,
            a: 0.35 + density * 0.55,
          });
        }
      }

      const ambientCount = Math.round(pts.length * 0.18);
      for (let i = 0; i < ambientCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 1 + Math.random() * 0.9;
        const px = cx + Math.cos(angle) * rx * dist;
        const py = cy + Math.sin(angle) * ry * dist;
        pts.push({
          tx: px, ty: py,
          x: px + (Math.random() - 0.5) * 40,
          y: py + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          r: 0.5 + Math.random() * 0.8,
          a: 0.06 + Math.random() * 0.1,
        });
      }

      particles = pts.slice(0, 3200);
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

    const LENS_R = 78;
    const FIELD_R = 130;

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        if (inOval) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const d = Math.hypot(dx, dy);
          if (d < FIELD_R && d > 0.01) {
            const push = (1 - d / FIELD_R) * 2.2;
            p.vx += (dx / d) * push;
            p.vy += (dy / d) * push;
          }
        }
        p.vx += (p.tx - p.x) * 0.02;
        p.vy += (p.ty - p.y) * 0.02;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = `rgba(230,225,215,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (inOval && img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, LENS_R, 0, Math.PI * 2);
        ctx.clip();
        ctx.filter = 'grayscale(100%) contrast(1.05)';
        const { cx, cy, rx, ry } = ovalRect();
        const dw = rx * 2 * 1.9;
        const dh = ry * 2 * 1.9;
        ctx.drawImage(img, cx - dw / 2, cy - dh / 2 - dh * 0.04, dw, dh);
        ctx.filter = 'none';
        ctx.strokeStyle = 'rgba(201,162,75,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, LENS_R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    const image = new Image();
    image.src = src;
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
  }, [src]);

  return (
    <div ref={wrapRef} className={`relative aspect-[4/5] w-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
