import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TargetProps {
  color: string;
  accent: string;
  /** Increments on each click; every change triggers a shatter and re-form. */
  breaches: number;
  /** Lower detail on phones. */
  detail: 1 | 2;
  dragRef: React.MutableRefObject<{ dx: number; dy: number; dragging: boolean }>;
}

const SHATTER_MS = 1600;

/**
 * An icosahedral "target": a solid core made of triangular shards inside a
 * wireframe shell. Dragging spins it with inertia; a click blows the shards
 * outward and they re-assemble.
 */
const Shards = ({ color, accent, breaches, detail, dragRef }: TargetProps) => {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const velocity = useRef({ x: 0.003, y: 0.006 });
  const shatterAt = useRef(0);
  const lastBreaches = useRef(breaches);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // One shard per face of the icosahedron: centre, normal, and a random spin axis.
  const { shards, shardGeometry } = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(1.35, detail).toNonIndexed();
    const pos = base.attributes.position;
    const list: { center: THREE.Vector3; normal: THREE.Vector3; axis: THREE.Vector3; drift: number }[] = [];
    for (let i = 0; i < pos.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(pos, i);
      const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
      const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
      const center = a.clone().add(b).add(c).divideScalar(3);
      list.push({
        center,
        normal: center.clone().normalize(),
        axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        drift: 1.6 + Math.random() * 2.4,
      });
    }
    // A small flat triangle, reused by every instance.
    const edge = (1.35 / (detail === 1 ? 2.2 : 3.6));
    const tri = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, edge * 0.58, 0),
      new THREE.Vector3(-edge * 0.5, -edge * 0.29, 0),
      new THREE.Vector3(edge * 0.5, -edge * 0.29, 0),
    ]);
    tri.computeVertexNormals();
    return { shards: list, shardGeometry: tri };
  }, [detail]);

  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const g = group.current;
    const m = mesh.current;
    if (!g || !m) return;

    if (breaches !== lastBreaches.current) {
      lastBreaches.current = breaches;
      shatterAt.current = state.clock.elapsedTime * 1000;
    }

    // Drag adds angular velocity; friction brings it back to an idle spin.
    const d = dragRef.current;
    if (d.dragging) {
      velocity.current.y = d.dx * 0.01;
      velocity.current.x = d.dy * 0.01;
      d.dx = 0;
      d.dy = 0;
    } else {
      velocity.current.x += (0.003 - velocity.current.x) * Math.min(1, delta * 1.2);
      velocity.current.y += (0.006 - velocity.current.y) * Math.min(1, delta * 1.2);
    }
    g.rotation.x += velocity.current.x;
    g.rotation.y += velocity.current.y;

    // Shatter curve: fast out (ease-out), slower back (ease-in-out).
    const since = state.clock.elapsedTime * 1000 - shatterAt.current;
    let k = 0;
    if (shatterAt.current && since < SHATTER_MS) {
      const t = since / SHATTER_MS;
      k = t < 0.3 ? 1 - Math.pow(1 - t / 0.3, 3) : 1 - (1 - Math.cos(((t - 0.3) / 0.7) * Math.PI)) / 2;
    }

    shards.forEach((s, i) => {
      dummy.position.copy(s.center).addScaledVector(s.normal, k * s.drift);
      look.copy(dummy.position).add(s.normal);
      dummy.lookAt(look);
      dummy.rotateOnAxis(s.axis, k * Math.PI * 1.5);
      dummy.scale.setScalar(1 - k * 0.25);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[shardGeometry, undefined, shards.length]}>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} flatShading metalness={0.3} roughness={0.45} />
      </instancedMesh>
      <mesh scale={1.75}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

const Target = (props: TargetProps) => (
  <Canvas
    dpr={[1, 1.75]}
    camera={{ position: [0, 0, 6], fov: 45 }}
    gl={{ antialias: true, alpha: true }}
  >
    <ambientLight intensity={0.6} />
    <directionalLight position={[4, 5, 6]} intensity={1.6} />
    <directionalLight position={[-5, -3, -2]} intensity={0.5} color={props.accent} />
    <Shards {...props} />
  </Canvas>
);

export default Target;
