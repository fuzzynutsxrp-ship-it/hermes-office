"use client";

import { memo, type ReactNode, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CANVAS_H,
  CANVAS_W,
  SCALE,
} from "@/features/retro-office/core/constants";
import {
  LOCAL_OFFICE_CANVAS_HEIGHT,
  LOCAL_OFFICE_CANVAS_WIDTH,
} from "@/features/retro-office/core/district";
import { toWorld } from "@/features/retro-office/core/geometry";
import {
  CloudParticles,
  LightRays,
  FloatingOrbs,
  MistClouds,
  EtherealSparkles,
} from "@/features/retro-office/objects/ethereal-effects";

// Ethereal cloud floor component - dark mode
const CloudFloor = memo(function CloudFloor() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Subtle pulsing glow effect
      const pulse = Math.sin(clock.elapsedTime * 0.5) * 0.1 + 0.9;
      materialRef.current.emissiveIntensity = pulse * 0.15;
    }
  });

  const districtWidth = CANVAS_W * SCALE;
  const districtHeight = CANVAS_H * SCALE;
  const [centerX, , centerZ] = toWorld(CANVAS_W / 2, CANVAS_H / 2);

  return (
    <group>
      {/* Main cloud floor - dark cosmic void with subtle glow */}
      <mesh
        ref={meshRef}
        position={[centerX, -0.02, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[districtWidth * 1.5, districtHeight * 1.5, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#0a0515"
          roughness={0.95}
          metalness={0.05}
          emissive="#2a1060"
          emissiveIntensity={0.35}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Secondary cloud layer - slightly higher, dark indigo */}
      <mesh
        position={[centerX, 0.02, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[districtWidth * 1.3, districtHeight * 1.3, 24, 24]} />
        <meshStandardMaterial
          color="#150a2e"
          roughness={0.98}
          metalness={0.02}
          emissive="#301870"
          emissiveIntensity={0.25}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Cloud wisps - dark smoky clusters with subtle purple glow */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = districtWidth * 0.4;
        const x = centerX + Math.cos(angle) * radius;
        const z = centerZ + Math.sin(angle) * radius;
        const height = 0.05 + Math.random() * 0.1;
        const scale = 0.8 + Math.random() * 0.6;

        return (
          <mesh
            key={`cloud-wisp-${i}`}
            position={[x, height, z]}
            rotation={[-Math.PI / 2, 0, angle]}
            scale={[scale, scale * 0.6, 1]}
          >
            <circleGeometry args={[0.4 + Math.random() * 0.3, 16]} />
            <meshStandardMaterial
              color="#1a1030"
              roughness={0.98}
              metalness={0}
              emissive="#3a1880"
              emissiveIntensity={0.5}
              transparent
              opacity={0.5 + Math.random() * 0.3}
            />
          </mesh>
        );
      })}

      {/* Ethereal mist effect - dark indigo mist layers */}
      {Array.from({ length: 5 }).map((_, i) => {
        const y = 0.01 + i * 0.015;
        const opacity = 0.15 - i * 0.025;
        return (
          <mesh
            key={`mist-${i}`}
            position={[centerX, y, centerZ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[districtWidth * (1.2 - i * 0.1), districtHeight * (1.2 - i * 0.1)]} />
            <meshBasicMaterial
              color="#1a0a30"
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
});

// Floating cloud decorations - dark smoky with emissive glow
const FloatingClouds = memo(function FloatingClouds() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.children.forEach((cloud, i) => {
        const offset = i * 1.5;
        cloud.position.y = 0.3 + Math.sin(clock.elapsedTime * 0.3 + offset) * 0.08;
        cloud.rotation.z = Math.sin(clock.elapsedTime * 0.2 + offset) * 0.05;
      });
    }
  });

  const cloudPositions: [number, number, number][] = [
    [-3, 0.3, -2],
    [4, 0.35, -3],
    [2, 0.3, 3],
    [-4, 0.32, 2],
    [0, 0.28, -4],
    [3, 0.33, 1],
  ];

  return (
    <group ref={groupRef}>
      {cloudPositions.map((pos, i) => (
        <group key={`floating-cloud-${i}`} position={pos}>
          {/* Cloud body */}
          <mesh scale={[0.6, 0.3, 0.4]}>
            <sphereGeometry args={[0.3, 12, 8]} />
            <meshStandardMaterial
              color="#1a1030"
              roughness={0.98}
              metalness={0}
              emissive="#4028b0"
              emissiveIntensity={0.55}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Cloud bumps */}
          <mesh position={[0.15, 0.08, 0]} scale={[0.35, 0.2, 0.3]}>
            <sphereGeometry args={[0.25, 10, 8]} />
            <meshStandardMaterial
              color="#1a1030"
              roughness={0.98}
              metalness={0}
              emissive="#3820a0"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[-0.12, 0.06, 0.05]} scale={[0.3, 0.18, 0.25]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial
              color="#1a1030"
              roughness={0.98}
              metalness={0}
              emissive="#3820a0"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
});

// Ethereal light pillars - brighter to contrast dark background
const LightPillars = memo(function LightPillars() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((pillar, i) => {
        const material = (pillar as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (material) {
          const pulse = Math.sin(clock.elapsedTime * 0.8 + i * 2) * 0.15 + 0.85;
          material.emissiveIntensity = pulse * 0.9;
          material.opacity = pulse * 0.5;
        }
      });
    }
  });

  const pillarPositions: [number, number, number][] = [
    [-5, 0, -5],
    [5, 0, -5],
    [-5, 0, 5],
    [5, 0, 5],
    [0, 0, -6],
    [0, 0, 6],
  ];

  return (
    <group ref={groupRef}>
      {pillarPositions.map((pos, i) => (
        <mesh
          key={`light-pillar-${i}`}
          position={[pos[0], 0.5, pos[2]]}
        >
          <cylinderGeometry args={[0.03, 0.08, 1, 8]} />
          <meshStandardMaterial
            color="#7040d0"
            emissive="#9060ff"
            emissiveIntensity={1.2}
            transparent
            opacity={0.5}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
});

// Main ethereal environment
export const FloorAndWalls = memo(function FloorAndWalls({
  showRemoteOffice = true,
}: {
  showRemoteOffice?: boolean;
}) {
  return (
    <group>
      {/* Cloud floor replaces the dark office floor */}
      <CloudFloor />

      {/* Floating cloud decorations */}
      <FloatingClouds />

      {/* Ethereal light pillars */}
      <LightPillars />

      {/* Ambient particles - small glowing orbs */}
      <EtherealParticles />

      {/* Enhanced ethereal effects — optimized particle counts for performance */}
      <CloudParticles count={30} spread={10} heightRange={[0.05, 0.4]} />
      <LightRays count={6} height={2.5} radius={0.015} />
      <FloatingOrbs count={12} spread={7} />
      <MistClouds count={4} spread={6} />
      <EtherealSparkles count={25} spread={8} />
    </group>
  );
});

// Ethereal floating particles - neon ethereal colors on dark
const EtherealParticles = memo(function EtherealParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = 15;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((particle, i) => {
        const offset = i * 0.8;
        const speed = 0.4 + (i % 3) * 0.2;
        particle.position.y = 0.2 + Math.sin(clock.elapsedTime * speed + offset) * 0.15;
        particle.position.x += Math.sin(clock.elapsedTime * 0.1 + offset) * 0.001;
        particle.position.z += Math.cos(clock.elapsedTime * 0.1 + offset) * 0.001;

        const material = (particle as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (material) {
          const pulse = Math.sin(clock.elapsedTime * 1.5 + offset) * 0.3 + 0.7;
          material.opacity = pulse * 0.7;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 2 + Math.random() * 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const size = 0.02 + Math.random() * 0.03;

        return (
          <mesh
            key={`particle-${i}`}
            position={[x, 0.2 + Math.random() * 0.3, z]}
          >
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? "#9b59b6" : i % 3 === 1 ? "#3498db" : "#e74c3c"}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
});

// Wall pictures - dark ethereal art pieces
export const WallPictures = memo(function WallPictures({
  showRemoteOffice = true,
}: {
  showRemoteOffice?: boolean;
}) {
  return (
    <group>
      {/* Ethereal art pieces floating on walls */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const distance = 4;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        return (
          <group
            key={`wall-art-${i}`}
            position={[x, 0.8, z]}
            rotation={[0, -angle + Math.PI, 0]}
          >
            {/* Frame */}
            <mesh>
              <boxGeometry args={[0.6, 0.4, 0.02]} />
              <meshStandardMaterial
                color="#2a1860"
                metalness={0.7}
                roughness={0.3}
                emissive="#5a38a0"
                emissiveIntensity={0.5}
              />
            </mesh>

            {/* Canvas - dark ethereal art */}
            <mesh position={[0, 0, 0.015]}>
              <planeGeometry args={[0.52, 0.32]} />
              <meshStandardMaterial
                color="#0d0520"
                emissive="#2a1060"
                emissiveIntensity={0.4}
                roughness={0.95}
                metalness={0.05}
              />
            </mesh>

            {/* Glowing accent - purple instead of gold */}
            <mesh position={[0, 0, 0.02]}>
              <circleGeometry args={[0.1, 16]} />
              <meshBasicMaterial
                color="#a855f7"
                transparent
                opacity={0.6}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});
