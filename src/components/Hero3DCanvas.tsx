import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Slow-turning wireframe object used as a decorative accent behind page
 * headers.
 *
 * Ported from the upstream prototype's Hero3DCanvas and pulled well back to
 * suit this build: the prototype's opaque indigo crystal, twin glowing torus
 * rings and additive-blended particle cloud read as a product demo. Here it is
 * a wireframe in the app's own accent at low opacity, sitting behind live text,
 * so it has to stay quiet enough not to compete with it.
 *
 * Purely decorative — `aria-hidden`, no pointer handling, and it does not move
 * at all under `prefers-reduced-motion`.
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

export function Hero3DCanvas({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webgl] = useState(supportsWebGL);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webgl) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const readAccent = () => new THREE.Color(cssVar('--primary', '#b55635'));
    let accent = readAccent();

    const scene = new THREE.Scene();
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 200;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(x: T): T => {
      disposables.push(x);
      return x;
    };

    // Wireframe shell — no solid fill, so header text stays readable over it.
    const shellGeom = track(new THREE.IcosahedronGeometry(1.8, 1));
    const shellMat = track(new THREE.MeshBasicMaterial({
      color: accent, wireframe: true, transparent: true, opacity: 0.4
    }));
    const shell = new THREE.Mesh(shellGeom, shellMat);
    group.add(shell);

    // A single tilted ring rather than the prototype's two.
    const ringGeom = track(new THREE.TorusGeometry(2.5, 0.012, 12, 96));
    const ringMat = track(new THREE.MeshBasicMaterial({
      color: accent, transparent: true, opacity: 0.35
    }));
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 3;
    group.add(ring);

    // Sparse point cloud for depth.
    const COUNT = 48;
    const pts = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.4 + Math.random() * 1.4;
      pts[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pts[i * 3 + 2] = r * Math.cos(phi);
    }
    const cloudGeom = track(new THREE.BufferGeometry());
    cloudGeom.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const cloudMat = track(new THREE.PointsMaterial({
      color: accent, size: 0.045, transparent: true, opacity: 0.5
    }));
    group.add(new THREE.Points(cloudGeom, cloudMat));

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
      shellMat.color = accent;
      ringMat.color = accent;
      cloudMat.color = accent;
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    // Pause when scrolled out of view — this sits on the landing screen and
    // there is no reason to keep a GPU loop warm for pixels nobody can see.
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(container);

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      group.rotation.y += 0.0022;
      group.rotation.x = Math.sin(Date.now() * 0.00012) * 0.18;
      renderer.render(scene, camera);
    };

    if (reduced) {
      group.rotation.set(0.15, 0.6, 0);
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
  }, [webgl]);

  if (!webgl) return null;

  return <div ref={containerRef} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
