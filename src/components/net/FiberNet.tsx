'use client';

import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number; r: number; phase: number; speed: number };

/**
 * Ambient node-and-line mesh, canvas 2D (cheap enough to run full-page
 * behind content without competing with the Three.js hero). Nodes drift
 * slowly, link lines fade in by proximity, the whole field bends gently
 * toward the cursor, and — the piece that was missing before — nodes
 * pulse with a soft glow and the cursor gets its own brighter "spoke"
 * lines out to nearby nodes, the way a live sensor mesh reads rather
 * than a static decorative pattern. Restyled to this site's obsidian/
 * bronze palette rather than a generic neon green/cyan HUD look.
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

      // Capped rather than pure area-scaling — glow (shadowBlur) is real
      // per-node cost, so a huge viewport shouldn't multiply it unbounded.
      const count = Math.min(110, Math.round((w * h) / 22000) + density * 0);
      nodes = Array.from({ length: Math.max(count, 24) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: 0.9 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        speed: 0.012 + Math.random() * 0.02,
      }));
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.phase += n.speed;
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

      // Cursor spokes — brighter bronze lines out to whatever is close,
      // separate from the ambient mesh, so the field visibly answers
      // to the pointer rather than just drifting past it.
      if (mouseX > -1000) {
        for (const n of nodes) {
          const dx = n.x - mouseX, dy = n.y - mouseY;
          const d = Math.hypot(dx, dy);
          if (d < 170) {
            const alpha = (1 - d / 170) * 0.5;
            ctx.strokeStyle = `rgba(201,162,75,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,162,75,0.85)';
        ctx.shadowColor = '#C9A24B';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (const n of nodes) {
        const glow = Math.sin(n.phase) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,75,${0.28 + glow * 0.35})`;
        ctx.shadowColor = '#C9A24B';
        ctx.shadowBlur = glow * 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 ${className}`} />;
}
