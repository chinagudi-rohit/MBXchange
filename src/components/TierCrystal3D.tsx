import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * The contribution tier, rendered as a turning solid.
 *
 * The shape is the point: each rung of the ladder gets a more complex
 * polyhedron, and Principal adds an orbiting ring, so the badge reads as
 * earned progress rather than decoration. It replaces a static glyph in the
 * tier card and shows the same tier the text beside it names.
 */

const TIER_ORDER = ['Contributor', 'Collaborator', 'Connector', 'Catalyst', 'Principal'];

function geometryForTier(index: number): THREE.BufferGeometry {
  switch (index) {
    case 0: return new THREE.TetrahedronGeometry(1);
    case 1: return new THREE.OctahedronGeometry(1);
    case 2: return new THREE.DodecahedronGeometry(1);
    case 3: return new THREE.IcosahedronGeometry(1);
    default: return new THREE.IcosahedronGeometry(1, 1);
  }
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

export function TierCrystal3D({
  tier,
  className = '',
  fallback = null
}: {
  tier: string;
  className?: string;
  /** Shown instead of the canvas where WebGL is unavailable. */
  fallback?: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webgl] = useState(supportsWebGL);
  const tierIndex = Math.max(0, TIER_ORDER.indexOf(tier));

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webgl) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const readAccent = () => new THREE.Color(cssVar('--primary', '#1565c0'));
    let accent = readAccent();

    const scene = new THREE.Scene();
    const size = container.clientWidth || 56;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(x: T): T => {
      disposables.push(x);
      return x;
    };

    const group = new THREE.Group();
    scene.add(group);

    const geom = track(geometryForTier(tierIndex));
    const solid = track(new THREE.MeshStandardMaterial({
      color: accent, roughness: 0.35, metalness: 0.6,
      emissive: accent, emissiveIntensity: 0.18
    }));
    const mesh = new THREE.Mesh(geom, solid);
    mesh.scale.setScalar(0.82);
    group.add(mesh);

    // Wireframe overlay so the facets stay legible at badge size.
    const wireMat = track(new THREE.MeshBasicMaterial({
      color: 0xffffff, wireframe: true, transparent: true, opacity: 0.22
    }));
    const wire = new THREE.Mesh(geom, wireMat);
    wire.scale.setScalar(0.83);
    group.add(wire);

    // Principal is the top of the ladder — it gets an orbit nothing else has.
    let ring: THREE.Mesh | null = null;
    if (tierIndex >= TIER_ORDER.length - 1) {
      const ringGeom = track(new THREE.TorusGeometry(1.25, 0.03, 10, 64));
      const ringMat = track(new THREE.MeshBasicMaterial({
        color: accent, transparent: true, opacity: 0.75
      }));
      ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2.4;
      group.add(ring);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 3, 4);
    scene.add(key);

    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w > 0) renderer.setSize(w, w);
    });
    ro.observe(container);

    const themeObserver = new MutationObserver(() => {
      accent = readAccent();
      solid.color = accent;
      solid.emissive = accent;
      if (ring) (ring.material as THREE.MeshBasicMaterial).color = accent;
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(container);

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      group.rotation.y += 0.008;
      group.rotation.x = Math.sin(Date.now() * 0.0004) * 0.25;
      if (ring) ring.rotation.z += 0.004;
      renderer.render(scene, camera);
    };

    if (reduced) {
      group.rotation.set(0.3, 0.6, 0);
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
  }, [webgl, tierIndex]);

  if (!webgl) return <>{fallback}</>;

  return <div ref={containerRef} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
