'use client';

import { useEffect, useRef } from 'react';

/**
 * A locked-system visualizer, not a lock icon: concentric HUD rings that
 * rotate at independent speeds, a center core that pulses on an interval
 * (like a heartbeat/idle-scan), and a scanning arc that sweeps continuously.
 * Cursor proximity nudges ring rotation speed up — reads as "the system
 * notices you're here" without granting access, which is the right
 * metaphor for a private/collaborators-only project.
 */
export default function VinceOrb({ size = 120 }: { size?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const r1 = useRef<SVGGElement>(null);
  const r2 = useRef<SVGGElement>(null);
  const r3 = useRef<SVGGElement>(null);
  const scan = useRef<SVGPathElement>(null);
  const core = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let a1 = 0, a2 = 0, a3 = 0, scanAngle = 0;
    let speedMult = 1;
    let raf = 0;
    let pulseT = 0;

    const onMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const d = Math.hypot(e.clientX - cx, e.clientY - cy);
      speedMult = d < 200 ? 1 + (1 - d / 200) * 2.2 : 1;
    };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      a1 += 0.15 * speedMult;
      a2 -= 0.24 * speedMult;
      a3 += 0.09 * speedMult;
      scanAngle += 1.6 * speedMult;
      pulseT += 0.02;

      if (r1.current) r1.current.setAttribute('transform', `rotate(${a1} 60 60)`);
      if (r2.current) r2.current.setAttribute('transform', `rotate(${a2} 60 60)`);
      if (r3.current) r3.current.setAttribute('transform', `rotate(${a3} 60 60)`);
      if (scan.current) scan.current.setAttribute('transform', `rotate(${scanAngle} 60 60)`);
      if (core.current) {
        const pulse = 3.2 + Math.sin(pulseT) * 0.9;
        core.current.setAttribute('r', pulse.toFixed(2));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg ref={svgRef} width={size} height={size} viewBox="0 0 120 120" className="overflow-visible">
      <circle cx="60" cy="60" r="58" fill="none" stroke="rgba(255,255,255,0.06)" />
      <g ref={r1}>
        <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(201,162,75,0.35)" strokeWidth="0.75" strokeDasharray="2 6" />
      </g>
      <g ref={r2}>
        <circle cx="60" cy="60" r="36" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" strokeDasharray="10 4 2 4" />
      </g>
      <g ref={r3}>
        <circle cx="60" cy="60" r="24" fill="none" stroke="rgba(201,162,75,0.5)" strokeWidth="1" />
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={deg}
            x1="60"
            y1="36"
            x2="60"
            y2="30"
            stroke="rgba(201,162,75,0.7)"
            strokeWidth="1"
            transform={`rotate(${deg} 60 60)`}
          />
        ))}
      </g>
      <path ref={scan} d="M60 60 L60 12 A48 48 0 0 1 94 26 Z" fill="rgba(201,162,75,0.08)" />
      <circle ref={core} cx="60" cy="60" r="3.2" fill="#C9A24B" />
    </svg>
  );
}
