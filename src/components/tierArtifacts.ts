import * as THREE from 'three';

/**
 * The catalogue of 3D solids a tier can be given.
 *
 * The shape used to be derived from the tier's position in a hardcoded
 * ladder, so a new or renamed tier had nothing to render. An admin now picks
 * one of these per tier, which is why the list is deliberately longer than
 * the ladder — the spares exist so a new rung always has something
 * distinctive available.
 *
 * `orbit` adds a turning ring around the solid; it is what makes the top of
 * a ladder look like the top without needing a sixth polyhedron.
 */
export interface TierArtifact {
  key: string;
  label: string;
  /** Rough visual weight, used only to order the picker sensibly. */
  complexity: number;
  orbit?: boolean;
  build: () => THREE.BufferGeometry;
}

export const TIER_ARTIFACTS: TierArtifact[] = [
  { key: 'tetrahedron',   label: 'Tetrahedron',      complexity: 1, build: () => new THREE.TetrahedronGeometry(1) },
  { key: 'cube',          label: 'Cube',             complexity: 2, build: () => new THREE.BoxGeometry(1.3, 1.3, 1.3) },
  { key: 'octahedron',    label: 'Octahedron',       complexity: 3, build: () => new THREE.OctahedronGeometry(1) },
  { key: 'prism',         label: 'Hex prism',        complexity: 4, build: () => new THREE.CylinderGeometry(1, 1, 1.2, 6) },
  { key: 'diamond',       label: 'Diamond',          complexity: 4, build: () => new THREE.ConeGeometry(1, 1.6, 8) },
  { key: 'dodecahedron',  label: 'Dodecahedron',     complexity: 5, build: () => new THREE.DodecahedronGeometry(1) },
  { key: 'icosahedron',   label: 'Icosahedron',      complexity: 6, build: () => new THREE.IcosahedronGeometry(1) },
  { key: 'geodesic',      label: 'Geodesic sphere',  complexity: 7, build: () => new THREE.IcosahedronGeometry(1, 1) },
  { key: 'torus',         label: 'Torus',            complexity: 5, build: () => new THREE.TorusGeometry(0.78, 0.3, 14, 40) },
  { key: 'knot',          label: 'Torus knot',       complexity: 8, build: () => new THREE.TorusKnotGeometry(0.68, 0.22, 90, 14) },
  { key: 'capsule',       label: 'Capsule',          complexity: 3, build: () => new THREE.CapsuleGeometry(0.6, 0.9, 6, 14) },
  { key: 'sphere',        label: 'Sphere',           complexity: 4, build: () => new THREE.SphereGeometry(1, 26, 18) },
  { key: 'ringed_core',   label: 'Ringed core',      complexity: 7, orbit: true, build: () => new THREE.OctahedronGeometry(0.92) },
  { key: 'orbital',       label: 'Orbital icosa',    complexity: 9, orbit: true, build: () => new THREE.IcosahedronGeometry(0.92, 1) },
  { key: 'crown',         label: 'Crown',            complexity: 10, orbit: true, build: () => new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16, 2, 3) }
];

const BY_KEY = new Map(TIER_ARTIFACTS.map((a) => [a.key, a]));

export function getArtifact(key: string | undefined): TierArtifact {
  return (key && BY_KEY.get(key)) || BY_KEY.get('octahedron')!;
}
