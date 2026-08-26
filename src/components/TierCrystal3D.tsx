import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { getArtifact } from './tierArtifacts';

/**
 * The contribution tier, rendered as a turning solid.
 *
 * Which solid is now a property of the tier itself, chosen by an admin from
 * the artifact catalogue — the shape used to be derived from a position in a
 * hardcoded ladder, so a renamed or newly added tier had nothing to draw.
 */

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
  artifact,
  className = '',
  fallback = null
}: {
  /** Artifact key from the catalogue; falls back to a plain octahedron. */
  artifact?: string;
  className?: string;
  /** Shown instead of the canvas where WebGL is unavailable. */
  fallback?: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webgl] = useState(supportsWebGL);
  const artifactKey = artifact || 'octahedron';

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

    const spec = getArtifact(artifactKey);
    const geom = track(spec.build());
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

    // Some artifacts carry an orbiting ring — the cheapest way to make the
    // top of a ladder look like the top.
    let ring: THREE.Mesh | null = null;
    if (spec.orbit) {
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
  }, [webgl, artifactKey]);

  if (!webgl) return <>{fallback}</>;

  return <div ref={containerRef} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
