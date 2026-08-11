import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Environment, MeshDistortMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type SceneProps = {
  scroll: number; // 0..1
  mouse: { x: number; y: number }; // -1..1
};

/* ---------- Hero Core ---------- */
function HeroCore({ scroll, mouse }: SceneProps) {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const wire = useRef<THREE.Mesh>(null!);
  const ringA = useRef<THREE.Mesh>(null!);
  const ringB = useRef<THREE.Mesh>(null!);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    // Camera dolly based on scroll
    const targetZ = THREE.MathUtils.lerp(6.5, -14, scroll);
    const targetY = THREE.MathUtils.lerp(0, -2, scroll);
    const targetX = THREE.MathUtils.lerp(0, Math.sin(scroll * Math.PI * 2) * 2.5, scroll);
    state.camera.position.x += (targetX + mouse.x * 0.4 - state.camera.position.x) * 0.08;
    state.camera.position.y += (targetY + mouse.y * 0.3 - state.camera.position.y) * 0.08;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.06;
    state.camera.lookAt(0, 0, -8);

    if (group.current) {
      // Object drifts up slightly as we go deeper
      group.current.position.y = THREE.MathUtils.lerp(0, 1, scroll);
      group.current.rotation.y += dt * 0.25;
      group.current.rotation.x = mouse.y * 0.2;
      group.current.rotation.z = mouse.x * 0.1;
    }

    if (core.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.04;
      core.current.scale.setScalar(s);
      core.current.rotation.y += dt * 0.6;
      core.current.rotation.x += dt * 0.3;
    }
    if (wire.current) {
      wire.current.rotation.y -= dt * 0.4;
      wire.current.rotation.z += dt * 0.2;
      const ws = 1.35 + Math.sin(t * 0.8) * 0.05;
      wire.current.scale.setScalar(ws);
    }
    if (ringA.current) {
      ringA.current.rotation.x = t * 0.5;
      ringA.current.rotation.y = t * 0.3;
    }
    if (ringB.current) {
      ringB.current.rotation.x = -t * 0.4;
      ringB.current.rotation.z = t * 0.35;
    }
  });

  return (
    <group ref={group}>
      {/* Core sphere with distortion */}
      <mesh ref={core}>
        <icosahedronGeometry args={[1.2, 4]} />
        <MeshDistortMaterial
          color="#00f0ff"
          emissive="#003855"
          emissiveIntensity={0.9}
          distort={0.35}
          speed={1.6}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Outer wireframe shell */}
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial color="#8a5bff" wireframe transparent opacity={0.55} />
      </mesh>

      {/* Rings */}
      <mesh ref={ringA}>
        <torusGeometry args={[2.2, 0.02, 16, 128]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.9} />
      </mesh>
      <mesh ref={ringB}>
        <torusGeometry args={[2.8, 0.015, 16, 128]} />
        <meshBasicMaterial color="#ff2bd6" transparent opacity={0.7} />
      </mesh>

      {/* Satellite orbs representing domains */}
      <DomainOrbit radius={3.6} speed={0.4} offset={0} color="#00f0ff" label="AI" />
      <DomainOrbit radius={4.2} speed={-0.3} offset={1.2} color="#ff2bd6" label="SPACE" />
      <DomainOrbit radius={3.9} speed={0.5} offset={2.4} color="#b8ff4a" label="CODE" />
      <DomainOrbit radius={4.5} speed={-0.45} offset={3.8} color="#8a5bff" label="ROBO" />
      <DomainOrbit radius={4.0} speed={0.35} offset={5.0} color="#ffaa00" label="GAME" />
      <DomainOrbit radius={4.7} speed={-0.28} offset={6.4} color="#00f0ff" label="START" />
    </group>
  );
}

function DomainOrbit({
  radius,
  speed,
  offset,
  color,
}: {
  radius: number;
  speed: number;
  offset: number;
  color: string;
  label?: string;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius * 0.6;
    ref.current.position.y = Math.sin(t * 1.3 + offset) * 0.8;
    ref.current.rotation.y += 0.02;
    ref.current.rotation.x += 0.01;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.18, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        roughness={0.2}
        metalness={0.6}
      />
    </mesh>
  );
}

/* ---------- Particle field ---------- */
function Particles({ scroll }: { scroll: number }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 1200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 12 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  useFrame((state, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.02;
      ref.current.rotation.x = scroll * 0.3;
    }
    // pulse star opacity
    const mat = ref.current?.material as THREE.PointsMaterial;
    if (mat) {
      mat.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#88c5ff"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

/* ---------- Deep tunnel (later scroll) ---------- */
function Tunnel({ scroll }: { scroll: number }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.08;
      ref.current.position.z = -6 - scroll * 12;
      const s = 0.5 + scroll * 2.2;
      ref.current.scale.setScalar(s);
    }
  });
  const rings = Array.from({ length: 14 });
  return (
    <group ref={ref}>
      {rings.map((_, i) => (
        <mesh key={i} position={[0, 0, -i * 0.9]}>
          <torusGeometry args={[1.8 + i * 0.05, 0.012, 8, 80]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#00f0ff" : "#ff2bd6"}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Floating panels / hologram ---------- */
function HoloPanels({ scroll }: { scroll: number }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.05;
      group.current.position.z = -4 - scroll * 10;
    }
  });
  const panels = Array.from({ length: 8 });
  return (
    <group ref={group}>
      {panels.map((_, i) => {
        const angle = (i / panels.length) * Math.PI * 2;
        const r = 6;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, Math.sin(angle) * r * 0.5, Math.sin(angle) * r]}
            rotation={[0, -angle, 0]}
          >
            <planeGeometry args={[1.4, 0.9]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? "#00f0ff" : "#8a5bff"}
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ---------- Scene root ---------- */
export default function Scene({ scroll, mouse }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05060d"]} />
      <fog attach="fog" args={["#05060d", 10, 45]} />

      <ambientLight intensity={0.25} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#00f0ff" />
      <pointLight position={[-5, -3, -5]} intensity={1} color="#ff2bd6" />
      <pointLight position={[0, 0, -10]} intensity={0.8} color="#8a5bff" />

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <HeroCore scroll={scroll} mouse={mouse} />
      </Float>

      <Particles scroll={scroll} />
      <Sparkles count={80} scale={18} size={1.2} speed={0.3} color="#00f0ff" />
      <Tunnel scroll={scroll} />
      <HoloPanels scroll={scroll} />

      <Environment preset="night" />
    </Canvas>
  );
}

/* Hook to keep scene synced to scroll without remounting Canvas */
export function useScrollSync(setScroll: (v: number) => void) {
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const v = max > 0 ? h.scrollTop / max : 0;
      setScroll(Math.min(1, Math.max(0, v)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [setScroll]);
}

export function useMouse(setMouse: (v: { x: number; y: number }) => void) {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [setMouse]);
}


