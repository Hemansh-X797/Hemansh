'use client';

import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number };

/**
 * Ambient node-and-line mesh, canvas 2D (cheap enough to run full-page
 * behind content without competing with the Three.js hero). Nodes drift
 * slowly, link lines fade in by proximity, and the whole field bends
 * gently toward the cursor — reads as "the site is alive" without being
 * the neon-green tech-demo look.
 */
export default function FiberNet({ density = 60, className = '' }: { density?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const ctx = ctx2d;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    let mouseX = -9999, mouseY = -9999;
    let raf = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width ?? window.innerWidth;
      h = rect?.height ?? window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((w * h) / 22000) + density * 0;
      nodes = Array.from({ length: Math.max(count, 24) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      }));
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        // gentle drift toward center-bias + subtle cursor attraction
        n.x += n.vx;
        n.y += n.vy;
        if (mouseX > -1000) {
          const dx = mouseX - n.x;
          const dy = mouseY - n.y;
          const d = Math.hypot(dx, dy);
          if (d < 160 && d > 0.01) {
            n.x += (dx / d) * 0.12;
            n.y += (dy / d) * 0.12;
          }
        }
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 130) * 0.08})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = 'rgba(201,162,75,0.4)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 ${className}`} />;
}
