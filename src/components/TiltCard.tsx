import React, { useRef, useState, useEffect, type ReactNode } from 'react';

/**
 * Cursor-tracked tilt for grid cards.
 *
 * Ported from the upstream prototype's Tilt3DCard, with the tilt softened for
 * our lighter surfaces and two guards it lacked: the effect is skipped entirely
 * for `prefers-reduced-motion`, and on touch devices — where there is no hover
 * state and the transform just fights scrolling.
 *
 * There is deliberately no cursor-tracked glare. A radial highlight under
 * the pointer washed out whatever text sat beneath it, so the part of the
 * card you were looking at was the least legible part of it.
 *
 * The z-index lift is what actually separates a hovered card from its
 * neighbours in a dense grid; without it the raised card is overlapped by the
 * ones after it in DOM order.
 *
 * That lift only has to beat sibling cards (which rest at z-index 1), so it
 * stays deliberately low. It previously used 20 — the same layer as
 * `.sticky-bar` — and on a tie the later DOM element wins, so a hovered card
 * scrolled up under the sticky filter bar painted straight over it. See the
 * layer scale documented above `.sticky-bar` in index.css.
 */
const RESTING_Z = 1;
const LIFTED_Z = 5;
export function TiltCard({
  children,
  className = '',
  maxTilt = 4,
  scale = 1.015,
  onClick
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setEnabled(!reduced && fine);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    setTilt({
      x: -((y - r.height / 2) / (r.height / 2)) * maxTilt,
      y: ((x - r.width / 2) / (r.width / 2)) * maxTilt
    });
  };

  const reset = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const lifted = enabled && hovered;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={reset}
      className={`relative h-full ${lifted ? 'tilt-active' : ''} ${className}`}
      style={{
        zIndex: lifted ? LIFTED_Z : RESTING_Z,
        transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        transform: lifted
          ? `perspective(1200px) translateY(-6px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${scale})`
          : 'perspective(1200px) translateY(0) rotateX(0deg) rotateY(0deg) scale(1)',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="h-full">{children}</div>
    </div>
  );
}
