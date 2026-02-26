"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, OrbitControls, Sparkles } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { Color } from "three";
import { cn } from "@/lib/utils";

interface BolivianitaCrystalProps {
  className?: string;
  activityLevel?: number;
  interactive?: boolean;
}

function CrystalCore({ activityLevel = 0 }: { activityLevel?: number }) {
  const crystalRef = useRef<Mesh>(null);
  const raysRef = useRef<Group>(null);
  const pulse = 1 + Math.min(activityLevel, 10) * 0.04;

  const rayRotations = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        rotation: [
          (Math.PI * 2 * index) / 16,
          (Math.PI * 2 * ((index + 5) % 16)) / 16,
          0,
        ] as [number, number, number],
        scale: 0.7 + (index % 5) * 0.18,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * 0.16;
      crystalRef.current.rotation.x = Math.sin(t * 0.14) * 0.16;
      crystalRef.current.scale.setScalar(0.95 + Math.sin(t * 0.7) * 0.03 * pulse);
    }
    if (raysRef.current) {
      raysRef.current.rotation.y = -t * 0.04;
      raysRef.current.rotation.z = Math.sin(t * 0.09) * 0.16;
    }
  });

  return (
    <group>
      <group ref={raysRef}>
        {rayRotations.map((ray, index) => (
          <mesh
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            rotation={ray.rotation}
            scale={[0.06, ray.scale, 0.06]}
            position={[0, 0, 0]}
          >
            <cylinderGeometry args={[0.02, 0.2, 2.3, 8, 1, true]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? new Color("#D4AF37") : new Color("#9D6BFF")}
              transparent
              opacity={0.2 + activityLevel * 0.015}
            />
          </mesh>
        ))}
      </group>

      <Float speed={0.35} rotationIntensity={0.45} floatIntensity={0.55}>
        <mesh ref={crystalRef}>
          <icosahedronGeometry args={[1.1, 1]} />
          <MeshTransmissionMaterial
            color="#7A4BC7"
            roughness={0.08}
            thickness={0.95}
            chromaticAberration={0.05}
            anisotropy={0.4}
            transmission={1}
            distortion={0.2}
            distortionScale={0.15}
            temporalDistortion={0.18}
            clearcoat={1}
            clearcoatRoughness={0}
            attenuationDistance={2}
            attenuationColor="#D4AF37"
            emissive="#D4AF37"
            emissiveIntensity={0.45 + activityLevel * 0.04}
          />
        </mesh>
      </Float>

      <Sparkles
        count={70}
        size={3}
        speed={0.17}
        color="#D4AF37"
        opacity={0.35}
        scale={[8, 8, 8]}
      />
      <ambientLight intensity={0.65} color="#4B2D6E" />
      <pointLight position={[2.5, 2, 2]} intensity={2.2} color="#D4AF37" />
      <pointLight position={[-2.4, -1, -2]} intensity={1.3} color="#6C3DB5" />
    </group>
  );
}

export function BolivianitaCrystal({
  className,
  activityLevel = 0,
  interactive = false,
}: BolivianitaCrystalProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      <Canvas camera={{ position: [0, 0, 4.2], fov: 50 }}>
        <CrystalCore activityLevel={activityLevel} />
        {interactive ? (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.4}
            maxPolarAngle={Math.PI / 1.7}
          />
        ) : null}
      </Canvas>
    </div>
  );
}

