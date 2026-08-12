'use client';

import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Obsidian Voronoi Fracture Ring.
 * Restyled from a torus-fracture reference: swapped the fiery emissive
 * wireframe + external skin textures for a matte black obsidian PBR
 * material with a thin bronze crack-line (matches --accent), removed the
 * dev GUI, and swapped the scroll-driven rotation for cursor-reactive
 * idle rotation, since this activates AFTER the scroll sequence ends.
 */

const TORUS_R = 2;
const TORUS_r = 0.42;
const FRAG_SCALE = 34; // fewer, larger obsidian shards reads more "luxury monolith" than fine gravel

function hash2(px: number, py: number): [number, number] {
  const a = Math.sin(px * 127.1 + py * 311.7) * 43758.5453;
  const b = Math.sin(px * 269.5 + py * 183.3) * 43758.5453;
  return [a - Math.floor(a), b - Math.floor(b)];
}

function cellSeed(u: number, v: number): [number, number] {
  const n = [Math.floor(u * FRAG_SCALE), Math.floor(v * FRAG_SCALE)];
  const f = [u * FRAG_SCALE - n[0], v * FRAG_SCALE - n[1]];
  let md = Infinity;
  let best: [number, number] = [n[0], n[1]];
  for (let j = -2; j <= 2; j++) {
    for (let i = -2; i <= 2; i++) {
      const o = hash2(n[0] + i, n[1] + j);
      const r = [i + o[0] - f[0], j + o[1] - f[1]];
      const d = r[0] * r[0] + r[1] * r[1];
      if (d < md) {
        md = d;
        best = [(n[0] + i + o[0]) / FRAG_SCALE, (n[1] + j + o[1]) / FRAG_SCALE];
      }
    }
  }
  return best;
}

export type FractureRingHandle = {
  setActive: (active: boolean) => void;
  setMouse: (nx: number, ny: number) => void; // normalized -1..1, camera parallax
  setPointer: (clientX: number, clientY: number) => void; // raw pixel, for raycast hover
  dispose: () => void;
  resize: () => void;
};

export function initFractureRing(canvas: HTMLCanvasElement): FractureRingHandle {
  const scene = new THREE.Scene();
  scene.background = null; // transparent — sits over --bg

  const group = new THREE.Group();
  scene.add(group);

  const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / Math.max(canvas.clientHeight, 1), 0.1, 100);
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xd9c9a3, 2.2); // warm bronze key light on black obsidian
  key.position.set(3, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x3a4a66, 0.6); // cool steel fill
  fill.position.set(-4, -2, -3);
  scene.add(fill);
  const rim = new THREE.PointLight(0xc9a24b, 1.4, 12);
  rim.position.set(0, 0, 3);
  scene.add(rim);

  // Obsidian shard material: near-black, high "wetness" via low roughness + clearcoat-like sheen.
  // emissive is animated per-fragment on hover-lift, so cracked-open shards glow white from within.
  const obsidianMat = new THREE.MeshPhysicalMaterial({
    color: 0x050505,
    roughness: 0.32,
    metalness: 0.15,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    reflectivity: 0.5,
    emissive: 0x000000,
    emissiveIntensity: 0,
    side: THREE.DoubleSide,
  });

  // Bronze crack-line wireframe torus underlay
  function addBarycentric(geo: THREE.BufferGeometry) {
    const g = geo.toNonIndexed();
    const count = g.attributes.position.count;
    const bary = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 3) {
      bary.set([1, 0, 0], i * 3);
      bary.set([0, 1, 0], (i + 1) * 3);
      bary.set([0, 0, 1], (i + 2) * 3);
    }
    g.setAttribute('barycentric', new THREE.BufferAttribute(bary, 3));
    return g;
  }

  const crackMat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute vec3 barycentric;
      varying vec3 vBary;
      void main() {
        vBary = barycentric;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vBary;
      float wireMask(vec3 b, float t) {
        vec3 d = fwidth(b);
        vec3 a = smoothstep(vec3(0.0), d * t, b);
        return 1.0 - min(a.x, min(a.y, a.z));
      }
      void main() {
        float wf = wireMask(vBary, 1.4);
        vec3 base = vec3(0.01, 0.01, 0.01);
        vec3 crack = vec3(0.79, 0.635, 0.294); // --accent bronze
        vec3 col = mix(base, crack, wf * 0.85);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.DoubleSide,
  });
  (crackMat as unknown as { extensions: { derivatives: boolean } }).extensions = { derivatives: true };
  group.add(new THREE.Mesh(addBarycentric(new THREE.TorusGeometry(TORUS_R, TORUS_r, 64, 64)), crackMat));

  // Fracture the torus surface into voronoi shards, each independently animatable
  type Frag = {
    mesh: THREE.Mesh;
    mat: THREE.MeshPhysicalMaterial;
    cellCenter: THREE.Vector3;
    cellNormal: THREE.Vector3;
    rotAxis: THREE.Vector3;
    maxAngle: number;
    lift: number;
  };
  const fragments: Frag[] = [];

  {
    const baseGeo = new THREE.TorusGeometry(TORUS_R, TORUS_r, 90, 90).toNonIndexed();
    const pos = baseGeo.attributes.position.array as Float32Array;
    const nrm = baseGeo.attributes.normal.array as Float32Array;
    const uvArr = baseGeo.attributes.uv.array as Float32Array;
    const tris = pos.length / 9;

    const cellMap = new Map<string, { s: [number, number]; t: number[] }>();
    for (let t = 0; t < tris; t++) {
      const uc = (uvArr[t * 6] + uvArr[t * 6 + 2] + uvArr[t * 6 + 4]) / 3;
      const vc = (uvArr[t * 6 + 1] + uvArr[t * 6 + 3] + uvArr[t * 6 + 5]) / 3;
      const s = cellSeed(uc, vc);
      const k = `${s[0].toFixed(9)}_${s[1].toFixed(9)}`;
      if (!cellMap.has(k)) cellMap.set(k, { s, t: [] });
      cellMap.get(k)!.t.push(t);
    }

    const TWO_PI = Math.PI * 2;
    for (const { s: seed, t: triList } of cellMap.values()) {
      if (!triList.length) continue;
      const vc = triList.length * 3;
      const pArr = new Float32Array(vc * 3);
      const nArr = new Float32Array(vc * 3);
      let vi = 0;
      for (const tri of triList) {
        for (let v = 0; v < 3; v++) {
          const sv = tri * 3 + v;
          pArr.set([pos[sv * 3], pos[sv * 3 + 1], pos[sv * 3 + 2]], vi * 3);
          nArr.set([nrm[sv * 3], nrm[sv * 3 + 1], nrm[sv * 3 + 2]], vi * 3);
          vi++;
        }
      }

      const phi = seed[0] * TWO_PI;
      const theta = seed[1] * TWO_PI;
      const cx = (TORUS_R + TORUS_r * Math.cos(theta)) * Math.cos(phi);
      const cy = (TORUS_R + TORUS_r * Math.cos(theta)) * Math.sin(phi);
      const cz = TORUS_r * Math.sin(theta);
      const cellCenter = new THREE.Vector3(cx, cy, cz);
      const majorPt = new THREE.Vector3(TORUS_R * Math.cos(phi), TORUS_R * Math.sin(phi), 0);
      const cellNormal = cellCenter.clone().sub(majorPt).normalize();

      const SHRINK = 0.94; // slightly more shard separation than reference — reads more "fractured monolith"
      for (let i = 0; i < pArr.length; i += 3) {
        pArr[i] = (pArr[i] - cx) * SHRINK;
        pArr[i + 1] = (pArr[i + 1] - cy) * SHRINK;
        pArr[i + 2] = (pArr[i + 2] - cz) * SHRINK;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nArr, 3));

      const rnd = hash2(seed[0] * 137.53, seed[1] * 137.53);
      const up = Math.abs(cellNormal.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
      const tang = new THREE.Vector3().crossVectors(cellNormal, up).normalize();
      const bitang = new THREE.Vector3().crossVectors(cellNormal, tang);
      const aa = rnd[0] * TWO_PI;
      const rotAxis = tang.clone().multiplyScalar(Math.cos(aa)).addScaledVector(bitang, Math.sin(aa)).normalize();

      const mesh = new THREE.Mesh(geo, obsidianMat.clone());
      mesh.position.copy(cellCenter).addScaledVector(cellNormal, 0.018);
      group.add(mesh);
      fragments.push({
        mesh,
        mat: mesh.material as THREE.MeshPhysicalMaterial,
        cellCenter,
        cellNormal,
        rotAxis,
        maxAngle: 0.5 + rnd[1] * 0.7,
        lift: 0,
      });
    }
    baseGeo.dispose();
  }

  gsap.set(group.rotation, { x: 0.15, y: 0, z: 0 });

  const idle = gsap.to(group.rotation, { y: `+=${Math.PI * 2}`, duration: 28, ease: 'none', repeat: -1 });

  // Invisible raycast surface (matches the torus envelope) — lets real mouse position
  // hit-test against the ring so fragments crack open near the actual cursor point,
  // not just a generic camera-relative tilt.
  const raycastMesh = new THREE.Mesh(
    new THREE.TorusGeometry(TORUS_R, TORUS_r * 1.15, 24, 48),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  group.add(raycastMesh);
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(-10, -10);
  const hoverPoint = new THREE.Vector3();
  let hoverActive = 0; // eased 0..1

  // A light that migrates to the live hover point and flares — this is the
  // "breaks apart and gives white light" moment, driven by real geometry,
  // not a canned CSS glow.
  const hoverLight = new THREE.PointLight(0xffffff, 0, 3.2);
  scene.add(hoverLight);

  let active = false;
  let mx = 0;
  let my = 0;
  let raf = 0;
  let clientX = -9999;
  let clientY = -9999;
  let rectLeft = 0;
  let rectTop = 0;

  function loop() {
    // mouse-reactive tilt, layered on top of the continuous idle spin
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, 0.15 + my * 0.25, 0.04);
    const targetZ = mx * 0.15;
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetZ, 0.04);

    // raycast real cursor against the ring surface
    ndc.set(
      ((clientX - rectLeft) / canvas.clientWidth) * 2 - 1,
      -((clientY - rectTop) / canvas.clientHeight) * 2 + 1
    );
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(raycastMesh);
    if (hits.length) {
      raycastMesh.worldToLocal(hoverPoint.copy(hits[0].point));
      hoverActive = THREE.MathUtils.lerp(hoverActive, 1, 0.15);
    } else {
      hoverActive = THREE.MathUtils.lerp(hoverActive, 0, 0.08);
    }

    for (const f of fragments) {
      const dist = hoverActive > 0.01 ? f.cellCenter.distanceTo(hoverPoint) : Infinity;
      const proximity = THREE.MathUtils.clamp(1 - dist / 0.85, 0, 1);
      const target = proximity * hoverActive;
      f.lift = THREE.MathUtils.lerp(f.lift, target, target > f.lift ? 0.18 : 0.06);
      f.mesh.position.copy(f.cellCenter).addScaledVector(f.cellNormal, 0.018 + f.lift * 0.34);
      f.mesh.quaternion.setFromAxisAngle(f.rotAxis, f.lift * f.maxAngle);
      f.mat.emissive.setRGB(f.lift, f.lift, f.lift);
      f.mat.emissiveIntensity = f.lift * 1.6;
    }

    if (hoverActive > 0.01) {
      hoverLight.position.copy(hoverPoint).applyMatrix4(group.matrixWorld);
      hoverLight.intensity = hoverActive * 3.4;
    } else {
      hoverLight.intensity = 0;
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  return {
    setActive: (v: boolean) => {
      active = v;
      if (v) idle.play();
      else idle.pause();
    },
    setMouse: (nx: number, ny: number) => {
      mx = nx;
      my = ny;
    },
    setPointer: (px: number, py: number) => {
      const rect = canvas.getBoundingClientRect();
      rectLeft = rect.left;
      rectTop = rect.top;
      clientX = px;
      clientY = py;
    },
    resize: () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      idle.kill();
      fragments.forEach((f) => {
        f.mesh.geometry.dispose();
        f.mat.dispose();
      });
      obsidianMat.dispose();
      crackMat.dispose();
      renderer.dispose();
    },
  };
}
