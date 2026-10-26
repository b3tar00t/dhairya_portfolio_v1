import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface NetworkFieldProps {
  /** Node count; links are drawn between nearby nodes. */
  nodes: number;
  /** CSS colour for nodes and links. */
  color: string;
  /** 0..1 page scroll progress; flies the camera through the network. */
  scrollRef: React.MutableRefObject<number>;
  /** Normalised pointer position, -1..1 on each axis. */
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  /** Max link distance; lower = sparser graph. */
  linkDistance?: number;
  /** Page background; distant nodes fade into it. */
  background: string;
  /** Stop rendering, e.g. while the tab is hidden. */
  paused?: boolean;
}

const SPREAD = { x: 26, y: 16, z: 60 };

const Network = ({ nodes, color, scrollRef, pointerRef, linkDistance = 4.2 }: NetworkFieldProps) => {
  const group = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Points>(null);
  const { camera } = useThree();

  // Static graph: positions plus pre-computed link segments.
  const { positions, links, pulses } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < nodes; i++) {
      pts.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * SPREAD.x,
          (Math.random() - 0.5) * SPREAD.y,
          -Math.random() * SPREAD.z,
        ),
      );
    }
    const positions = new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]));
    const seg: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      let linked = 0;
      for (let j = i + 1; j < pts.length && linked < 3; j++) {
        if (pts[i].distanceTo(pts[j]) < linkDistance) {
          seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
          linked++;
        }
      }
    }
    // A handful of "packets" that travel along links.
    const pulses = Array.from({ length: Math.min(24, seg.length / 6) }, (_, k) => ({
      seg: Math.floor((k / 24) * (seg.length / 6)),
      t: Math.random(),
      speed: 0.15 + Math.random() * 0.35,
    }));
    return { positions, links: new Float32Array(seg), pulses };
  }, [nodes, linkDistance]);

  const pulsePositions = useMemo(() => new Float32Array(pulses.length * 3), [pulses]);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const s = scrollRef.current;
    const p = pointerRef.current;

    // Fly forward through the graph as the page scrolls, ease toward target.
    const targetZ = 8 - s * (SPREAD.z - 12);
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, delta * 3);
    camera.position.x += (p.x * 1.6 - camera.position.x) * Math.min(1, delta * 2);
    camera.position.y += (p.y * 1.0 - camera.position.y) * Math.min(1, delta * 2);
    camera.lookAt(p.x * 0.8, p.y * 0.5, camera.position.z - 10);

    g.rotation.z = state.clock.elapsedTime * 0.01 + s * 0.4;

    // Advance packets along their links.
    pulses.forEach((pl, i) => {
      pl.t = (pl.t + delta * pl.speed) % 1;
      const o = pl.seg * 6;
      pulsePositions[i * 3] = links[o] + (links[o + 3] - links[o]) * pl.t;
      pulsePositions[i * 3 + 1] = links[o + 1] + (links[o + 4] - links[o + 1]) * pl.t;
      pulsePositions[i * 3 + 2] = links[o + 2] + (links[o + 5] - links[o + 2]) * pl.t;
    });
    if (pulse.current) pulse.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={colorObj} size={0.09} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[links, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={colorObj} transparent opacity={0.22} depthWrite={false} />
      </lineSegments>
      <points ref={pulse}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pulsePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={colorObj} size={0.2} sizeAttenuation transparent opacity={1} depthWrite={false} />
      </points>
    </group>
  );
};

/** Ambient 3D network the visitor flies through as they scroll. */
const NetworkField = (props: NetworkFieldProps & { dpr?: number }) => (
  <Canvas
    frameloop={props.paused ? 'never' : 'always'}
    dpr={props.dpr ?? [1, 1.75]}
    camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 80 }}
    gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    style={{ pointerEvents: 'none' }}
  >
    <fog attach="fog" args={[props.background, 14, 40]} />
    <Network {...props} />
  </Canvas>
);

export default NetworkField;
