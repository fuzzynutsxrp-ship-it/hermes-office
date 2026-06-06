"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Ethereal cloud particle system - dark with subtle glow
export function CloudParticles({
  count = 50,
  spread = 8,
  heightRange = [0.1, 0.5],
}: {
  count?: number;
  spread?: number;
  heightRange?: [number, number];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]),
        (Math.random() - 0.5) * spread,
      ),
      speed: 0.2 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.04,
    }));
  }, [count, spread, heightRange]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    particles.forEach((particle, i) => {
      const time = clock.elapsedTime;

      // Gentle floating motion
      dummy.position.copy(particle.position);
      dummy.position.y += Math.sin(time * particle.speed + particle.offset) * 0.05;
      dummy.position.x += Math.sin(time * 0.1 + particle.offset) * 0.01;
      dummy.position.z += Math.cos(time * 0.1 + particle.offset) * 0.01;

      // Pulsing scale
      const pulse = Math.sin(time * 1.5 + particle.offset) * 0.3 + 0.7;
      const scale = particle.scale * pulse;
      dummy.scale.setScalar(scale);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color="#4a2890"
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  );
}

// Ethereal light rays - more visible/prominent for dark mode contrast
export function LightRays({
  count = 8,
  height = 3,
  radius = 0.02,
}: {
  count?: number;
  height?: number;
  radius?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((ray, i) => {
        const material = (ray as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (material) {
          const pulse = Math.sin(clock.elapsedTime * 0.8 + i * 0.5) * 0.2 + 0.8;
          material.opacity = pulse * 0.35;
        }
      });
    }
  });

  const rays = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = 2 + Math.random() * 3;
      return {
        position: [
          Math.cos(angle) * distance,
          height / 2,
          Math.sin(angle) * distance,
        ] as [number, number, number],
        rotation: [
          0,
          0,
          (Math.random() - 0.5) * 0.3,
        ] as [number, number, number],
      };
    });
  }, [count, height]);

  return (
    <group ref={groupRef}>
      {rays.map((ray, i) => (
        <mesh
          key={`light-ray-${i}`}
          position={ray.position}
          rotation={ray.rotation}
        >
          <cylinderGeometry args={[radius * 0.5, radius, height, 6]} />
          <meshBasicMaterial
            color="#a060ff"
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

// Floating orbs of light - neon ethereal colors
export function FloatingOrbs({
  count = 15,
  spread = 6,
}: {
  count?: number;
  spread?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((orb, i) => {
        const time = clock.elapsedTime;
        const offset = i * 1.2;

        // Complex floating motion
        orb.position.y = 0.3 + Math.sin(time * 0.4 + offset) * 0.15;
        orb.position.x += Math.sin(time * 0.15 + offset) * 0.002;
        orb.position.z += Math.cos(time * 0.15 + offset) * 0.002;

        // Pulsing glow
        const material = (orb as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (material) {
          const pulse = Math.sin(time * 1.2 + offset) * 0.3 + 0.7;
          material.opacity = pulse * 0.7;
        }
      });
    }
  });

  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = 1.5 + Math.random() * spread;
      const colors = ["#b06aff", "#4db8ff", "#ff6b6b", "#4ade80"];
      return {
        position: [
          Math.cos(angle) * distance,
          0.3 + Math.random() * 0.3,
          Math.sin(angle) * distance,
        ] as [number, number, number],
        color: colors[i % colors.length],
        size: 0.03 + Math.random() * 0.04,
      };
    });
  }, [count, spread]);

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh
          key={`floating-orb-${i}`}
          position={orb.position}
        >
          <sphereGeometry args={[orb.size, 12, 12]} />
          <meshBasicMaterial
            color={orb.color}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// Ethereal mist clouds - dark smoky purple
export function MistClouds({
  count = 6,
  spread = 5,
}: {
  count?: number;
  spread?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((cloud, i) => {
        const time = clock.elapsedTime;
        const offset = i * 2;

        // Gentle drifting motion
        cloud.position.x += Math.sin(time * 0.08 + offset) * 0.001;
        cloud.position.z += Math.cos(time * 0.08 + offset) * 0.001;

        // Subtle scale pulse
        const scale = 0.8 + Math.sin(time * 0.3 + offset) * 0.1;
        cloud.scale.setScalar(scale);
      });
    }
  });

  const clouds = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = 2 + Math.random() * spread;
      return {
        position: [
          Math.cos(angle) * distance,
          0.05 + Math.random() * 0.1,
          Math.sin(angle) * distance,
        ] as [number, number, number],
        scale: 0.5 + Math.random() * 0.5,
      };
    });
  }, [count, spread]);

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <group
          key={`mist-cloud-${i}`}
          position={cloud.position}
          scale={[cloud.scale * 1.5, cloud.scale * 0.3, cloud.scale]}
        >
          {/* Main cloud body */}
          <mesh>
            <sphereGeometry args={[0.3, 12, 8]} />
            <meshStandardMaterial
              color="#1a1030"
              roughness={0.98}
              metalness={0}
              emissive="#4a28a0"
              emissiveIntensity={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Cloud bumps */}
          <mesh position={[0.15, 0.05, 0]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial
              color="#1a1030"
              roughness={0.98}
              metalness={0}
              emissive="#4a28a0"
              emissiveIntensity={0.6}
              transparent
              opacity={0.5}
            />
          </mesh>
          <mesh position={[-0.1, 0.04, 0.05]}>
            <sphereGeometry args={[0.18, 10, 8]} />
            <meshStandardMaterial
              color="#1a1030"
              roughness={0.98}
              metalness={0}
              emissive="#4a28a0"
              emissiveIntensity={0.6}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Ethereal sparkles - brighter gold + electric blue mix
export function EtherealSparkles({
  count = 40,
  spread = 6,
}: {
  count?: number;
  spread?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = (i / count) * Math.PI * 2;
      const distance = Math.random() * spread;

      positions[i3] = Math.cos(angle) * distance;
      positions[i3 + 1] = Math.random() * 0.8;
      positions[i3 + 2] = Math.sin(angle) * distance;
    }
    return positions;
  }, [count, spread]);

  const sizes = useMemo(() => {
    return Array.from({ length: count }, () => 0.02 + Math.random() * 0.03);
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const time = clock.elapsedTime;
    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.getAttribute("position");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const y = positionAttribute.getY(i);

      // Gentle floating
      positionAttribute.setY(
        i,
        y + Math.sin(time * 0.5 + i * 0.8) * 0.001
      );
    }

    positionAttribute.needsUpdate = true;

    // Pulsing opacity
    const material = pointsRef.current.material as THREE.PointsMaterial;
    if (material) {
      const pulse = Math.sin(time * 1.5) * 0.2 + 0.8;
      material.opacity = pulse * 0.8;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#e0d0ff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}
