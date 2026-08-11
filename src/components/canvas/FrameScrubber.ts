'use client';

import { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 144;
const FRAME_PATH = (i: number) => `/sequence/frame_${String(i).padStart(4, '0')}.jpg`;

export type ScrubberHandle = {
  kill: () => void;
};

/**
 * Preloads all 144 frames with new Image() + onload counter (no "white flash"),
 * reports progress for the PreloadGate, then pins the section and scrubs the
 * canvas draw call off an object tweened by ScrollTrigger — so playback is
 * driven by rAF-synced canvas redraws, never by React state per frame.
 */
export function initFrameScrubber(
  canvasRef: RefObject<HTMLCanvasElement>,
  pinRef: RefObject<HTMLDivElement>,
  onProgress: (p: number) => void,
  onLoaded: () => void,
  onComplete: () => void
): ScrubberHandle {
  const images: HTMLImageElement[] = [];
  let loaded = 0;
  let st: ScrollTrigger | null = null;

  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');

  const draw = (index: number) => {
    if (!canvas || !ctx) return;
    const img = images[index];
    if (!img || !img.complete) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // cover-fit draw
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = FRAME_PATH(i);
    img.onload = () => {
      loaded++;
      onProgress(loaded / FRAME_COUNT);
      if (i === 1) draw(0);
      if (loaded === FRAME_COUNT) {
        onLoaded();
        setup();
      }
    };
    img.onerror = () => {
      loaded++; // don't hang the loader on a missing/misnamed frame
      onProgress(loaded / FRAME_COUNT);
      if (loaded === FRAME_COUNT) {
        onLoaded();
        setup();
      }
    };
    images.push(img);
  }

  function setup() {
    if (!pinRef.current) return;
    const frameState = { i: 0 };

    st = ScrollTrigger.create({
      trigger: pinRef.current,
      start: 'top top',
      end: '+=3000',
      pin: true,
      scrub: 0.4,
      onUpdate: (self) => {
        const idx = Math.min(FRAME_COUNT - 1, Math.floor(self.progress * (FRAME_COUNT - 1)));
        frameState.i = idx;
        draw(idx);
      },
      onLeave: () => onComplete(),
      onLeaveBack: () => {
        draw(0);
      },
    });

    const onResize = () => draw(frameState.i);
    window.addEventListener('resize', onResize);
    (st as any)._onResize = onResize;
  }

  return {
    kill: () => {
      if (st) {
        window.removeEventListener('resize', (st as any)._onResize);
        st.kill();
      }
    },
  };
}
