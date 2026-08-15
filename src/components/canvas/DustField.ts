'use client';

import * as THREE from 'three';

/**
 * Dust Field — the portrait rendered as a real GPU particle system rather
 * than flat Canvas2D dots. This is the "much better" iteration: every
 * particle is a soft additive-glow sprite drawn in a fragment shader (no
 * texture needed — the falloff is pure math, so it stays crisp at any
 * pixel density), sizes attenuate with true perspective depth, and the
 * camera parallaxes a few degrees with the cursor the way high-end
 * WebGL portfolio pieces do. Sampling is edge-aware (a cheap Sobel pass
 * on the luminance grid) so particles concentrate along the contours
 * that actually read as a face — jaw, brow, nose bridge — not just in
 * uniformly dark regions, which is what made the old version look like
 * fog with a face suggested inside it rather than a face made of dust.
 *
 * Architecture mirrors FractureRing.ts in this codebase: a plain
 * init function returning a handle with resize/dispose, driven by a thin
 * 'use client' React wrapper. No React Three Fiber — this repo doesn't
 * depend on it, and a second Three.js render pattern would be more to
 * maintain for no benefit over the imperative style already established.
 */

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  varying float vAlpha;
  varying vec3 vColor;
  uniform float uPixelRatio;
  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (360.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(vColor, core * vAlpha);
  }
`;

type Particle = {
  tx: number; ty: number; tz: number; // target (resting) position — the face
  sx: number; sy: number; sz: number; // spawn position — where it assembles from
  x: number; y: number; z: number;    // current
  vx: number; vy: number; vz: number;
  size: number;
  alpha: number;
  color: [number, number, number];
};

export type DustFieldHandle = {
  // px/py in canvas pixel space (origin top-left, y-down) — same
  // convention pointermove gives you relative to the canvas's own
  // bounding rect. Pass null/null when the pointer leaves the field.
  setPointer: (px: number | null, py: number | null) => void;
  setAssembled: (on: boolean) => void; // triggers the spring-in / spring-out entrance
  resize: () => void;
  dispose: () => void;
};

export function initDustField(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  ovalFrac = { rx: 0.3, ry: 0.36, cy: 0.44 },
): DustFieldHandle {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  let w = canvas.clientWidth || 1;
  let h = canvas.clientHeight || 1;

  // Perspective camera calibrated so the z=0 plane exactly fills the
  // container in pixel units — lets particle targets be authored in the
  // same coordinate space as the old Canvas2D version while still getting
  // real perspective size falloff and parallax depth for free.
  const fov = 42;
  const dist = h / (2 * Math.tan((fov * Math.PI) / 360));
  const camera = new THREE.PerspectiveCamera(fov, w / h, 1, dist * 6);
  camera.position.z = dist;

  const geometry = new THREE.BufferGeometry();
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let particles: Particle[] = [];
  let posAttr: THREE.BufferAttribute;
  let sizeAttr: THREE.BufferAttribute;
  let alphaAttr: THREE.BufferAttribute;
  let colorAttr: THREE.BufferAttribute;

  let pointerX = 0, pointerY = 0; // canvas pixel space, origin top-left
  let hovering = false;
  let assembled = false;
  let camTargetX = 0, camTargetY = 0;
  let raf = 0;

  const ovalRect = () => ({
    cx: w / 2,
    cy: h * ovalFrac.cy,
    rx: w * ovalFrac.rx,
    ry: h * ovalFrac.ry,
  });

  const insideOval = (px: number, py: number) => {
    const { cx, cy, rx, ry } = ovalRect();
    const dx = (px - cx) / rx;
    const dy = (py - cy) / ry;
    return dx * dx + dy * dy <= 1;
  };

  // px/py in canvas pixel space (y-down, origin top-left) -> Three.js
  // world space (y-up, origin center) on the z=0 plane.
  const toWorld = (px: number, py: number, z: number): [number, number, number] => [
    px - w / 2,
    h / 2 - py,
    z,
  ];

  function buildParticles() {
    const sampleW = 170;
    const sampleH = Math.max(1, Math.round((sampleW * img.height) / img.width));
    const off = document.createElement('canvas');
    off.width = sampleW;
    off.height = sampleH;
    const octx = off.getContext('2d');
    if (!octx) return;
    octx.drawImage(img, 0, 0, sampleW, sampleH);
    const data = octx.getImageData(0, 0, sampleW, sampleH).data;

    // Luminance grid, then a cheap Sobel pass so particles concentrate on
    // the edges that make a face legible (contours), not just dark blobs.
    const lum = new Float32Array(sampleW * sampleH);
    for (let i = 0; i < sampleW * sampleH; i++) {
      const j = i * 4;
      lum[i] = (data[j] * 0.3 + data[j + 1] * 0.59 + data[j + 2] * 0.11) / 255;
    }
    const at = (x: number, y: number) => lum[Math.min(sampleH - 1, Math.max(0, y)) * sampleW + Math.min(sampleW - 1, Math.max(0, x))];
    const edge = new Float32Array(sampleW * sampleH);
    let maxEdge = 0.0001;
    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
        const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
        const m = Math.sqrt(gx * gx + gy * gy);
        edge[y * sampleW + x] = m;
        if (m > maxEdge) maxEdge = m;
      }
    }

    const { cx, cy, rx, ry } = ovalRect();
    const pts: Particle[] = [];
    const spiralSeed = Math.random() * Math.PI * 2;

    for (let sy = 0; sy < sampleH; sy++) {
      for (let sx = 0; sx < sampleW; sx++) {
        const i = sy * sampleW + sx;
        const px = cx - rx + (sx / sampleW) * rx * 2;
        const py = cy - ry + (sy / sampleH) * ry * 2;
        if (!insideOval(px, py)) continue;

        const l = lum[i];
        const e = edge[i] / maxEdge;
        const density = Math.pow(1 - l, 1.35) * 0.75 + Math.pow(e, 0.8) * 0.55;
        if (Math.random() > 0.05 + density * 0.9) continue;

        // Depth: highlights sit fractionally forward, shadows recede —
        // a subtle sculptural pop that a flat 2D canvas can't give.
        const tz = (l - 0.5) * 26;

        // Spawn position: a wide spiral around the face, so the
        // assemble-in animation reads as dust gathering into shape
        // rather than a generic fade.
        const ang = spiralSeed + (sx / sampleW) * 14 + (sy / sampleH) * 3;
        const rad = rx * (2.4 + Math.random() * 2.2);
        const spawnX = cx + Math.cos(ang) * rad;
        const spawnY = cy + Math.sin(ang) * rad * (ry / rx);
        const spawnZ = (Math.random() - 0.5) * 220;

        const warm = 0.5 + e * 0.5; // edges skew slightly warmer/brighter
        pts.push({
          tx: px, ty: py, tz,
          sx: spawnX, sy: spawnY, sz: spawnZ,
          x: spawnX, y: spawnY, z: spawnZ,
          vx: 0, vy: 0, vz: 0,
          size: 2.1 + Math.random() * 2.0 + e * 1.6,
          alpha: 0.4 + density * 0.5,
          color: [0.92 * warm, 0.9 * warm, 0.86 * warm],
        });
      }
    }

    // Sparse ambient dust drifting outside the oval — depth cue, no
    // target position, just slow wander.
    const ambientCount = Math.round(pts.length * 0.12);
    for (let i = 0; i < ambientCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist2 = 1.05 + Math.random() * 0.9;
      const px = cx + Math.cos(ang) * rx * dist2;
      const py = cy + Math.sin(ang) * ry * dist2;
      pts.push({
        tx: px, ty: py, tz: (Math.random() - 0.5) * 40,
        sx: px, sy: py, sz: (Math.random() - 0.5) * 40,
        x: px, y: py, z: (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 0.05, vy: (Math.random() - 0.5) * 0.05, vz: 0,
        size: 1.1 + Math.random() * 1.1,
        alpha: 0.05 + Math.random() * 0.08,
        color: [0.85, 0.85, 0.85],
      });
    }

    particles = pts.slice(0, 9000);

    const n = particles.length;
    const positions = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const alphas = new Float32Array(n);
    const colors = new Float32Array(n * 3);
    particles.forEach((p, i) => {
      const [x, y, z] = toWorld(p.x, p.y, p.z);
      positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
      sizes[i] = p.size;
      alphas[i] = 0; // fades in on assemble
      colors[i * 3] = p.color[0]; colors[i * 3 + 1] = p.color[1]; colors[i * 3 + 2] = p.color[2];
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    sizeAttr = geometry.getAttribute('aSize') as THREE.BufferAttribute;
    alphaAttr = geometry.getAttribute('aAlpha') as THREE.BufferAttribute;
    colorAttr = geometry.getAttribute('aColor') as THREE.BufferAttribute;
  }

  const FIELD_R = 130;

  function tick() {
    // Camera parallax — a few pixels of drift toward the cursor, always
    // easing, never snapping. Normalized to roughly -0.5..0.5 across the field.
    const normX = hovering ? pointerX / w - 0.5 : 0;
    const normY = hovering ? pointerY / h - 0.5 : 0;
    camTargetX += (normX * (w * 0.035) - camTargetX) * 0.05;
    camTargetY += (-normY * (h * 0.035) - camTargetY) * 0.05;
    camera.position.x = camTargetX;
    camera.position.y = camTargetY;
    camera.lookAt(0, 0, 0);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const targetX = assembled ? p.tx : p.sx;
      const targetY = assembled ? p.ty : p.sy;
      const targetZ = assembled ? p.tz : p.sz;

      if (assembled && hovering) {
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;
        const d = Math.hypot(dx, dy);
        if (d < FIELD_R && d > 0.01) {
          const push = (1 - d / FIELD_R) * 2.6;
          p.vx += (dx / d) * push;
          p.vy += (dy / d) * push;
        }
      }

      const spring = assembled ? 0.02 : 0.012;
      p.vx += (targetX - p.x) * spring;
      p.vy += (targetY - p.y) * spring;
      p.vz += (targetZ - p.z) * spring;
      const damp = 0.86;
      p.vx *= damp; p.vy *= damp; p.vz *= damp;
      p.x += p.vx; p.y += p.vy; p.z += p.vz;

      const [wx, wy, wz] = toWorld(p.x, p.y, p.z);
      posAttr.setXYZ(i, wx, wy, wz);

      const targetAlpha = assembled ? p.alpha : p.alpha * 0.25;
      const cur = alphaAttr.getX(i);
      alphaAttr.setX(i, cur + (targetAlpha - cur) * 0.04);
    }
    posAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  function resize() {
    w = canvas.clientWidth || 1;
    h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    const d = h / (2 * Math.tan((fov * Math.PI) / 360));
    camera.position.z = d;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    buildParticles();
  }

  resize();
  raf = requestAnimationFrame(tick);

  return {
    setPointer(nx, ny) {
      if (nx === null || ny === null) {
        hovering = false;
        return;
      }
      hovering = true;
      pointerX = nx;
      pointerY = ny;
    },
    setAssembled(on) {
      assembled = on;
    },
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
