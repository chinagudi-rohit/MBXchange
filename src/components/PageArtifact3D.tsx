import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Slow-turning wireframe accent for a page header.
 *
 * Generalised from the prototype's Hero3DCanvas so that every view can carry
 * one without a bespoke component each: the lifecycle work — theme colours,
 * reduced motion, pausing off-screen, disposing geometries — is shared, and a
 * variant only supplies its shapes and how they move.
 *
 * The variant is chosen to say something about the page it sits on rather than
 * being decoration picked at random:
 *
 *   lattice  a single structure                 (Home)
 *   orbit    things circulating to be matched   (Opportunities)
 *   network  connected people                   (People & Skills)
 *   flow     items moving down a pipeline       (My Requests)
 *   ledger   weights stacked for a decision     (Approvals)
 *   scatter  loose odds and ends                (Beyond Work)
 *   grid     regular system structure           (Admin Console)
 *
 * These are always decorative: aria-hidden, no pointer handling, and they sit
 * behind live text, so they stay faint on purpose.
 */

export type ArtifactVariant =
  | 'lattice' | 'orbit' | 'network' | 'flow' | 'ledger' | 'scatter' | 'grid';

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

interface Built {
  /** Called once per frame with elapsed seconds. */
  tick: (t: number) => void;
  /** Materials whose colour follows the theme. */
  tinted: Array<THREE.Material & { color: THREE.Color }>;
}

function build(
  variant: ArtifactVariant,
  group: THREE.Group,
  accent: THREE.Color,
  track: <T extends { dispose: () => void }>(x: T) => T
): Built {
  const tinted: Array<THREE.Material & { color: THREE.Color }> = [];
  const wire = (opacity: number) => {
    const m = track(new THREE.MeshBasicMaterial({
      color: accent, wireframe: true, transparent: true, opacity
    }));
    tinted.push(m);
    return m;
  };
  const solid = (opacity: number) => {
    const m = track(new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity }));
    tinted.push(m);
    return m;
  };
  const lineMat = (opacity: number) => {
    const m = track(new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity }));
    tinted.push(m);
    return m;
  };
  const pointMat = (size: number, opacity: number) => {
    const m = track(new THREE.PointsMaterial({ color: accent, size, transparent: true, opacity }));
    tinted.push(m);
    return m;
  };

  switch (variant) {
    /* A single structure, turning. */
    case 'lattice': {
      const shell = new THREE.Mesh(track(new THREE.IcosahedronGeometry(1.8, 1)), wire(0.4));
      group.add(shell);
      const ring = new THREE.Mesh(track(new THREE.TorusGeometry(2.5, 0.012, 12, 96)), solid(0.35));
      ring.rotation.x = Math.PI / 3;
      group.add(ring);
      const pts = new Float32Array(48 * 3);
      for (let i = 0; i < 48; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(Math.random() * 2 - 1);
        const r = 2.4 + Math.random() * 1.4;
        pts.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3);
      }
      const g = track(new THREE.BufferGeometry());
      g.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      group.add(new THREE.Points(g, pointMat(0.045, 0.5)));
      return { tinted, tick: (t) => { group.rotation.y = t * 0.14; group.rotation.x = Math.sin(t * 0.12) * 0.18; } };
    }

    /* Nodes travelling around tilted rings — things in circulation. */
    case 'orbit': {
      const rings: THREE.Mesh[] = [];
      [1.5, 2.1, 2.7].forEach((r, i) => {
        const m = new THREE.Mesh(track(new THREE.TorusGeometry(r, 0.01, 10, 96)), solid(0.34 - i * 0.06));
        m.rotation.x = Math.PI / 2.6 + i * 0.28;
        m.rotation.z = i * 0.5;
        group.add(m);
        rings.push(m);
      });
      const movers: THREE.Mesh[] = [];
      const moverGeom = track(new THREE.SphereGeometry(0.075, 12, 12));
      const moverMat = solid(0.85);
      [1.5, 2.1, 2.7].forEach(() => {
        const s = new THREE.Mesh(moverGeom, moverMat);
        group.add(s);
        movers.push(s);
      });
      return {
        tinted,
        tick: (t) => {
          group.rotation.y = t * 0.1;
          movers.forEach((s, i) => {
            const r = [1.5, 2.1, 2.7][i];
            const a = t * (0.55 - i * 0.13) + i * 2.1;
            s.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.42, Math.sin(a) * r * 0.7);
          });
        }
      };
    }

    /* A cluster of nodes with the links between them. */
    case 'network': {
      const N = 14;
      const pos: THREE.Vector3[] = [];
      const golden = Math.PI * (3 - Math.sqrt(5));
      const nodeGeom = track(new THREE.SphereGeometry(0.08, 12, 12));
      const nodeMat = solid(0.8);
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const ring = Math.sqrt(Math.max(0, 1 - y * y));
        const th = golden * i;
        const p = new THREE.Vector3(Math.cos(th) * ring * 2, y * 2, Math.sin(th) * ring * 2);
        pos.push(p);
        const m = new THREE.Mesh(nodeGeom, nodeMat);
        m.position.copy(p);
        group.add(m);
      }
      const seg: THREE.Vector3[] = [];
      for (let i = 0; i < N; i++)
        for (let j = i + 1; j < N; j++)
          if (pos[i].distanceTo(pos[j]) < 2.1) seg.push(pos[i], pos[j]);
      const g = track(new THREE.BufferGeometry().setFromPoints(seg));
      group.add(new THREE.LineSegments(g, lineMat(0.3)));
      return { tinted, tick: (t) => { group.rotation.y = t * 0.13; group.rotation.x = Math.sin(t * 0.1) * 0.2; } };
    }

    /* A helix with items descending it — a queue being worked through. */
    case 'flow': {
      const TURNS = 3, SEG = 120;
      const curve: THREE.Vector3[] = [];
      for (let i = 0; i <= SEG; i++) {
        const a = (i / SEG) * Math.PI * 2 * TURNS;
        curve.push(new THREE.Vector3(Math.cos(a) * 1.5, 2.2 - (i / SEG) * 4.4, Math.sin(a) * 1.5));
      }
      const g = track(new THREE.BufferGeometry().setFromPoints(curve));
      group.add(new THREE.Line(g, lineMat(0.4)));
      const beads: THREE.Mesh[] = [];
      const beadGeom = track(new THREE.SphereGeometry(0.085, 12, 12));
      const beadMat = solid(0.85);
      for (let i = 0; i < 4; i++) {
        const m = new THREE.Mesh(beadGeom, beadMat);
        group.add(m);
        beads.push(m);
      }
      return {
        tinted,
        tick: (t) => {
          group.rotation.y = t * 0.08;
          beads.forEach((b, i) => {
            const p = ((t * 0.14 + i / beads.length) % 1);
            const a = p * Math.PI * 2 * TURNS;
            b.position.set(Math.cos(a) * 1.5, 2.2 - p * 4.4, Math.sin(a) * 1.5);
          });
        }
      };
    }

    /* Stacked plates that rise and settle — weighing something up. */
    case 'ledger': {
      const plates: THREE.Mesh[] = [];
      const plateGeom = track(new THREE.BoxGeometry(2.6, 0.05, 1.5));
      for (let i = 0; i < 5; i++) {
        const m = new THREE.Mesh(plateGeom, wire(0.42 - i * 0.05));
        m.position.y = -1.1 + i * 0.55;
        group.add(m);
        plates.push(m);
      }
      return {
        tinted,
        tick: (t) => {
          group.rotation.y = t * 0.11;
          plates.forEach((p, i) => {
            p.position.y = -1.1 + i * 0.55 + Math.sin(t * 0.7 + i * 0.6) * 0.06;
            p.rotation.y = Math.sin(t * 0.35 + i * 0.4) * 0.14;
          });
        }
      };
    }

    /* Assorted small solids drifting — a pile of unrelated things. */
    case 'scatter': {
      const geoms = [
        track(new THREE.BoxGeometry(0.45, 0.45, 0.45)),
        track(new THREE.TetrahedronGeometry(0.32)),
        track(new THREE.OctahedronGeometry(0.3)),
        track(new THREE.TorusGeometry(0.26, 0.07, 8, 24))
      ];
      const mat = wire(0.5);
      const items: Array<{ mesh: THREE.Mesh; seed: number; base: THREE.Vector3 }> = [];
      for (let i = 0; i < 9; i++) {
        const m = new THREE.Mesh(geoms[i % geoms.length], mat);
        const th = (i / 9) * Math.PI * 2;
        const base = new THREE.Vector3(Math.cos(th) * 1.9, (i % 3) * 0.85 - 0.85, Math.sin(th) * 1.9);
        m.position.copy(base);
        group.add(m);
        items.push({ mesh: m, seed: i * 1.7, base });
      }
      return {
        tinted,
        tick: (t) => {
          group.rotation.y = t * 0.1;
          items.forEach(({ mesh, seed, base }) => {
            mesh.rotation.x = t * 0.4 + seed;
            mesh.rotation.y = t * 0.32 + seed;
            mesh.position.y = base.y + Math.sin(t * 0.6 + seed) * 0.16;
          });
        }
      };
    }

    /* A regular lattice of cells — infrastructure. */
    default: {
      const cell = track(new THREE.BoxGeometry(0.62, 0.62, 0.62));
      const mat = wire(0.4);
      for (let x = -1; x <= 1; x++)
        for (let y = -1; y <= 1; y++)
          for (let z = -1; z <= 1; z++) {
            if (Math.abs(x) + Math.abs(y) + Math.abs(z) > 2) continue;
            const m = new THREE.Mesh(cell, mat);
            m.position.set(x * 0.92, y * 0.92, z * 0.92);
            group.add(m);
          }
      return { tinted, tick: (t) => { group.rotation.y = t * 0.12; group.rotation.x = Math.sin(t * 0.09) * 0.22; } };
    }
  }
}

export function PageArtifact3D({
  variant = 'lattice',
  className = ''
}: {
  variant?: ArtifactVariant;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webgl] = useState(supportsWebGL);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webgl) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const readAccent = () => new THREE.Color(cssVar('--primary', '#b55635'));
    let accent = readAccent();

    const scene = new THREE.Scene();
    const w0 = container.clientWidth || 320;
    const h0 = container.clientHeight || 200;
    const camera = new THREE.PerspectiveCamera(45, w0 / h0, 0.1, 100);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w0, h0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(x: T): T => {
      disposables.push(x);
      return x;
    };

    const group = new THREE.Group();
    scene.add(group);
    const built = build(variant, group, accent, track);

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

    const themeObserver = new MutationObserver(() => {
      accent = readAccent();
      built.tinted.forEach((m) => { m.color = accent; });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(container);

    const start = performance.now();
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      built.tick((performance.now() - start) / 1000);
      renderer.render(scene, camera);
    };

    if (reduced) {
      built.tick(3);
      renderer.render(scene, camera);
    } else {
      render();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [webgl, variant]);

  if (!webgl) return null;

  return <div ref={containerRef} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
