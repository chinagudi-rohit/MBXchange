import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Rotating constellation of the organisation's capabilities.
 *
 * Ported from the upstream prototype's SkillGlobe3D, with three changes that
 * mattered for this build:
 *
 * 1. It renders the real capability heatmap rather than a hardcoded skill list,
 *    so node size and colour mean something — a node is larger the more the org
 *    is asking for that skill, and it is tinted by whether supply is keeping up.
 * 2. Colour comes from the app's own CSS custom properties, read at mount and
 *    again whenever the theme changes, instead of the prototype's fixed
 *    indigo/purple palette.
 * 3. It refuses to animate for `prefers-reduced-motion`, and degrades to a
 *    plain list when WebGL is unavailable, so it is never the reason a page
 *    fails to render.
 */

export interface HeatmapSkill {
  skill: string;
  demandScore: number;
  supplyScore: number;
  requestsCount: number;
  expertsCount: number;
  status: string;
}

/** A skill is "short" when demand meaningfully outruns available experts. */
function isGap(s: HeatmapSkill): boolean {
  return s.demandScore - s.supplyScore >= 25;
}

function cssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export function SkillGlobe3D({
  skills,
  className = '',
  onSelectSkill
}: {
  skills: HeatmapSkill[];
  className?: string;
  onSelectSkill?: (skill: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<HeatmapSkill | null>(null);
  const [webgl] = useState(supportsWebGL);
  const [reduced, setReduced] = useState(false);

  // The twelve most-requested capabilities keep the constellation readable;
  // beyond that the nodes crowd each other and nothing is legible.
  const nodes = useMemo(
    () => [...skills].sort((a, b) => b.demandScore - a.demandScore).slice(0, 12),
    [skills]
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!active && nodes.length) setActive(nodes[0]);
  }, [nodes, active]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webgl || !nodes.length) return;

    // Theme-derived palette. Re-read on theme change so the globe follows the
    // rest of the UI instead of staying stuck in whichever mode it mounted in.
    const readPalette = () => ({
      accent: new THREE.Color(cssVar('--primary', '#1565c0')),
      ink: new THREE.Color(cssVar('--ink-3', '#8a8a85')),
      line: new THREE.Color(cssVar('--line', '#e3e0d8'))
    });
    let palette = readPalette();

    const scene = new THREE.Scene();
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5.4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Everything created below is tracked so it can be released on unmount —
    // renderer.dispose() alone leaves geometries and materials on the GPU.
    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(x: T): T => {
      disposables.push(x);
      return x;
    };

    // Core: a wireframe shell so the interior reads as structure, not a blob.
    const coreGeom = track(new THREE.IcosahedronGeometry(0.85, 1));
    const coreMat = track(new THREE.MeshBasicMaterial({
      color: palette.line, wireframe: true, transparent: true, opacity: 0.45
    }));
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    group.add(coreMesh);

    // Nodes on a Fibonacci sphere — even spacing without clumping at the poles.
    const golden = Math.PI * (3 - Math.sqrt(5));
    const positions: THREE.Vector3[] = [];
    const nodeMeshes: THREE.Mesh[] = [];
    const R = 2.05;

    nodes.forEach((s, i) => {
      const y = nodes.length === 1 ? 0 : 1 - (i / (nodes.length - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const pos = new THREE.Vector3(Math.cos(theta) * ring * R, y * R, Math.sin(theta) * ring * R);
      positions.push(pos);

      // Size carries demand; colour carries whether supply is keeping up.
      const size = 0.07 + (s.demandScore / 100) * 0.09;
      const geom = track(new THREE.SphereGeometry(size, 18, 18));
      const mat = track(new THREE.MeshStandardMaterial({
        color: isGap(s) ? palette.accent : palette.ink,
        emissive: isGap(s) ? palette.accent : palette.ink,
        emissiveIntensity: isGap(s) ? 0.55 : 0.15,
        roughness: 0.35,
        metalness: 0.55
      }));
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mesh.userData.index = i;
      group.add(mesh);
      nodeMeshes.push(mesh);
    });

    // Arcs between neighbours, drawn once into a single geometry.
    const linePts: THREE.Vector3[] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (positions[i].distanceTo(positions[j]) < 2.4) linePts.push(positions[i], positions[j]);
      }
    }
    const lineGeom = track(new THREE.BufferGeometry().setFromPoints(linePts));
    const lineMat = track(new THREE.LineBasicMaterial({
      color: palette.line, transparent: true, opacity: 0.5
    }));
    group.add(new THREE.LineSegments(lineGeom, lineMat));

    // A single equatorial ring, tilted, to give the rotation something to read against.
    const ringGeom = track(new THREE.RingGeometry(2.32, 2.35, 96));
    const ringMat = track(new THREE.MeshBasicMaterial({
      color: palette.accent, side: THREE.DoubleSide, transparent: true, opacity: 0.28
    }));
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    group.add(ring);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.PointLight(palette.accent.getHex(), 2.2, 20);
    key.position.set(4, 4, 5);
    scene.add(key);

    // Pointer: drag to rotate, click a node to select it.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dragging = false;
    let moved = 0;
    let last = { x: 0, y: 0 };

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      last = { x: e.clientX, y: e.clientY };
      container.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      group.rotation.y += dx * 0.006;
      group.rotation.x = Math.max(-1.2, Math.min(1.2, group.rotation.x + dy * 0.006));
      last = { x: e.clientX, y: e.clientY };
    };
    const up = (e: PointerEvent) => {
      // A press that never really moved is a click on whatever is under it.
      if (dragging && moved < 5) {
        const r = container.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(nodeMeshes)[0];
        if (hit) {
          const s = nodes[(hit.object as THREE.Mesh).userData.index as number];
          setActive(s);
          onSelectSkill?.(s.skill);
        }
      }
      dragging = false;
      if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
    };

    container.addEventListener('pointerdown', down);
    container.addEventListener('pointermove', move);
    container.addEventListener('pointerup', up);
    container.addEventListener('pointercancel', up);

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    ro.observe(container);

    // Follow the app's light/dark switch.
    const themeObserver = new MutationObserver(() => {
      palette = readPalette();
      coreMat.color = palette.line;
      lineMat.color = palette.line;
      ringMat.color = palette.accent;
      key.color = palette.accent;
      nodeMeshes.forEach((m, i) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        const c = isGap(nodes[i]) ? palette.accent : palette.ink;
        mat.color = c;
        mat.emissive = c;
      });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!dragging && !reduced) {
        group.rotation.y += 0.0032;
        coreMesh.rotation.y -= 0.005;
      }
      renderer.render(scene, camera);
    };

    if (reduced) {
      // Still show the constellation, just hold it still.
      group.rotation.y = 0.6;
      renderer.render(scene, camera);
    } else {
      render();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      container.removeEventListener('pointerdown', down);
      container.removeEventListener('pointermove', move);
      container.removeEventListener('pointerup', up);
      container.removeEventListener('pointercancel', up);
      ro.disconnect();
      themeObserver.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [nodes, webgl, reduced, onSelectSkill]);

  if (!nodes.length) return null;

  return (
    <div className={`panel rounded-2xl shadow-card p-5 sm:p-6 ${className}`}>
      {/* Two columns from lg up: the capability list reads on the left, the
          globe visualises the same rows on the right. Stacks on narrow screens
          where a half-width globe would be too small to aim at. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 items-center">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">Capability constellation</h3>
              <p className="text-xs text-ink-2 mt-0.5">
                {webgl
                  ? 'Drag to rotate · pick a capability to inspect it'
                  : 'Top capabilities by demand'}
              </p>
            </div>
            <span className="shrink-0 flex items-center gap-1.5 text-xs text-ink-3">
              <span className="w-2 h-2 rounded-full bg-primary" /> short on experts
            </span>
          </div>

          {/* Every capability, not just the six that used to fit under the globe. */}
          <ul className="mt-4 space-y-0.5 max-h-64 overflow-y-auto -mx-1.5 pr-1">
            {nodes.map((s) => {
              const on = active?.skill === s.skill;
              return (
                <li key={s.skill}>
                  <button
                    onClick={() => { setActive(s); onSelectSkill?.(s.skill); }}
                    aria-current={on ? 'true' : undefined}
                    className={`w-full flex items-center gap-2.5 text-left px-1.5 py-2 rounded-lg transition-colors ${
                      on ? 'bg-primary-soft' : 'hover:bg-surface-2'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isGap(s) ? 'bg-primary' : 'bg-ink-3'}`} />
                    <span className={`text-sm truncate flex-1 ${on ? 'text-ink font-semibold' : 'text-ink-2'}`}>
                      {s.skill}
                    </span>
                    <span className="text-xs text-ink-3 shrink-0 tabular-nums">
                      {s.requestsCount}/{s.expertsCount}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {active && (
            <div className="mt-4 pt-3.5 border-t border-line">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-ink truncate">{active.skill}</p>
                <p className={`text-xs font-semibold shrink-0 ${isGap(active) ? 'text-primary-text' : 'text-ink-2'}`}>
                  {isGap(active) ? 'Short on experts' : 'Balanced'}
                </p>
              </div>
              <p className="text-xs text-ink-2 mt-1">
                {active.requestsCount} requests across the org · {active.expertsCount} available experts
              </p>
            </div>
          )}
        </div>

        {webgl ? (
          <div
            ref={containerRef}
            className="w-full h-64 lg:h-80 cursor-grab active:cursor-grabbing touch-none"
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  );
}
