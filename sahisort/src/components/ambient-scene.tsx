import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const LEAF_COLORS = ["#4D8B55", "#A8D5A2", "#7FB77E", "#C9E3A0", "#F3C6A5"];

function makeLeafGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(0.42, -0.25, 0.38, 0.3, 0, 0.55);
  s.bezierCurveTo(-0.38, 0.3, -0.42, -0.25, 0, -0.5);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 10,
  });
  // gentle curl
  const p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, p.getZ(i) + x * x * 0.6);
  }
  g.computeVertexNormals();
  g.center();
  return g;
}

type Leaf = {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  spin: THREE.Vector3;
  speed: number;
  sway: number;
  phase: number;
  scale: number;
  color: string;
};

function Leaves({ count }: { count: number }) {
  const geo = useMemo(makeLeafGeometry, []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const { viewport } = useThree();
  const leaves = useMemo<Leaf[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 12,
          -Math.random() * 6 + 1,
        ),
        rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
        spin: new THREE.Vector3(
          Math.random() * 0.6 + 0.2,
          Math.random() * 0.8 + 0.2,
          Math.random() * 0.4,
        ),
        speed: Math.random() * 0.35 + 0.2,
        sway: Math.random() * 0.8 + 0.3,
        phase: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.35 + 0.35,
        color: LEAF_COLORS[i % LEAF_COLORS.length] ?? "#4D8B55",
      })),
    [count],
  );
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const t = state.clock.elapsedTime;
    const halfH = viewport.height / 2 + 1.5;
    const halfW = viewport.width / 2 + 1.5;
    leaves.forEach((l, i) => {
      const m = refs.current[i];
      if (!m) return;
      l.pos.y -= l.speed * dt;
      l.pos.x += Math.sin(t * l.sway + l.phase) * 0.006 + 0.08 * dt;
      if (l.pos.y < -halfH) {
        l.pos.y = halfH;
        l.pos.x = (Math.random() - 0.5) * viewport.width;
      }
      if (l.pos.x > halfW) l.pos.x = -halfW;
      l.rot.x += l.spin.x * dt;
      l.rot.y += l.spin.y * dt;
      l.rot.z += l.spin.z * dt;
      const depth = 1 + l.pos.z * 0.15;
      m.position.set(
        l.pos.x + pointer.current.x * 0.4 * depth,
        l.pos.y - pointer.current.y * 0.3 * depth,
        l.pos.z,
      );
      m.rotation.copy(l.rot);
    });
  });

  return (
    <>
      {leaves.map((l, i) => (
        <mesh
          key={i}
          ref={(r) => {
            refs.current[i] = r;
          }}
          geometry={geo}
          scale={l.scale}
        >
          <meshStandardMaterial
            color={l.color}
            roughness={0.55}
            side={THREE.DoubleSide}
            transparent
            opacity={0.55}
          />
        </mesh>
      ))}
    </>
  );
}

function makeEarthTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#BFDCCB";
  ctx.fillRect(0, 0, 512, 256);
  // soft procedural continents
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 512,
      y = 40 + Math.random() * 176,
      r = 8 + Math.random() * 34;
    ctx.fillStyle = i % 5 === 0 ? "#E5F2B8" : i % 3 === 0 ? "#7FB77E" : "#4D8B55";
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.4, r, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function Earth({ mobile }: { mobile: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(makeEarthTexture, []);
  useFrame((s, raw) => {
    if (!ref.current) return;
    ref.current.rotation.y += Math.min(raw, 0.05) * 0.08;
    const scroll = typeof window !== "undefined" ? window.scrollY : 0;
    ref.current.position.y =
      (mobile ? -2.2 : -1.2) + Math.sin(s.clock.elapsedTime * 0.3) * 0.1 + scroll * 0.0015;
  });
  return (
    <group ref={ref} position={[mobile ? 1.2 : 4.2, -1.2, -6]} rotation={[0.35, 0, 0.2]}>
      <mesh>
        <sphereGeometry args={[mobile ? 2.4 : 3.2, 48, 48]} />
        <meshStandardMaterial map={tex} roughness={0.9} transparent opacity={0.55} />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[mobile ? 2.4 : 3.2, 32, 32]} />
        <meshBasicMaterial color="#E5F2B8" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[(mobile ? 2.4 : 3.2) * 1.35, 0.015, 8, 120]} />
        <meshBasicMaterial color="#4D8B55" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function AmbientScene() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={[1, mobile ? 1.5 : 2]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        frameloop={reduced ? "demand" : "always"}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 6, 5]} intensity={1.4} color="#FFF6E5" />
        <directionalLight position={[-6, -2, 2]} intensity={0.4} color="#A8D5A2" />
        <Earth mobile={mobile} />
        <Leaves count={mobile ? 10 : 22} />
      </Canvas>
    </div>
  );
}
