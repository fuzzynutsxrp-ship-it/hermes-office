"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Angel halo component - bright emissive gold that pops against dark
export function AngelHalo({ position = [0, 0.65, 0] }: { position?: [number, number, number] }) {
  const haloRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (haloRef.current) {
      // Gentle rotation
      haloRef.current.rotation.y = clock.elapsedTime * 0.5;
      // Subtle pulse
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.05 + 0.95;
      haloRef.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 1.5) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(pulse * 1.2);
    }
  });

  return (
    <group position={position}>
      {/* Main halo ring - bright emissive gold */}
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.015, 8, 24]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffaa00"
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Glow effect - brighter for dark background */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.025, 8, 24]} />
        <meshBasicMaterial
          color="#ffd700"
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

// Angel wings component - luminous white/pale blue with stronger emissive
export function AngelWings({
  position = [0, 0.3, -0.08],
  wingColor = "#e0e8ff",
  wingSpan = 0.25,
}: {
  position?: [number, number, number];
  wingColor?: string;
  wingSpan?: number;
}) {
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    // Gentle wing flutter
    const flutter = Math.sin(time * 2) * 0.08;

    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = -0.3 + flutter;
      leftWingRef.current.rotation.y = -0.1;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = 0.3 - flutter;
      rightWingRef.current.rotation.y = 0.1;
    }
  });

  const featherColor = "#c8d8ff";
  const wingTipColor = "#a0b8ff";

  return (
    <group position={position}>
      {/* Left wing */}
      <group ref={leftWingRef} position={[-0.05, 0, 0]}>
        {/* Wing base */}
        <mesh position={[-wingSpan * 0.4, 0.02, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[wingSpan * 0.8, 0.02, 0.12]} />
          <meshStandardMaterial
            color={wingColor}
            roughness={0.8}
            metalness={0.1}
            emissive={featherColor}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Wing feathers - layered for depth */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={`left-feather-${i}`}
            position={[-wingSpan * (0.3 + i * 0.15), 0.03 - i * 0.01, 0]}
            rotation={[0, 0, -0.4 - i * 0.1]}
          >
            <boxGeometry args={[wingSpan * (0.6 - i * 0.15), 0.015, 0.1 - i * 0.02]} />
            <meshStandardMaterial
              color={i === 2 ? wingTipColor : wingColor}
              roughness={0.85}
              metalness={0.05}
              emissive="#b0c0ff"
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}

        {/* Wing glow - more visible */}
        <mesh position={[-wingSpan * 0.4, 0.01, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[wingSpan * 0.9, 0.03, 0.14]} />
          <meshBasicMaterial
            color="#8090ff"
            transparent
            opacity={0.35}
          />
        </mesh>
      </group>

      {/* Right wing */}
      <group ref={rightWingRef} position={[0.05, 0, 0]}>
        {/* Wing base */}
        <mesh position={[wingSpan * 0.4, 0.02, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[wingSpan * 0.8, 0.02, 0.12]} />
          <meshStandardMaterial
            color={wingColor}
            roughness={0.8}
            metalness={0.1}
            emissive={featherColor}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Wing feathers */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={`right-feather-${i}`}
            position={[wingSpan * (0.3 + i * 0.15), 0.03 - i * 0.01, 0]}
            rotation={[0, 0, 0.4 + i * 0.1]}
          >
            <boxGeometry args={[wingSpan * (0.6 - i * 0.15), 0.015, 0.1 - i * 0.02]} />
            <meshStandardMaterial
              color={i === 2 ? wingTipColor : wingColor}
              roughness={0.85}
              metalness={0.05}
              emissive="#b0c0ff"
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}

        {/* Wing glow - more visible */}
        <mesh position={[wingSpan * 0.4, 0.01, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[wingSpan * 0.9, 0.03, 0.14]} />
          <meshBasicMaterial
            color="#8090ff"
            transparent
            opacity={0.35}
          />
        </mesh>
      </group>
    </group>
  );
}

// Ethereal robe component - darker base with glowing trim
export function EtherealRobe({
  position = [0, 0.28, 0],
  robeColor = "#1a1030",
}: {
  position?: [number, number, number];
  robeColor?: string;
}) {
  const robeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (robeRef.current) {
      // Gentle robe sway
      const sway = Math.sin(clock.elapsedTime * 0.8) * 0.02;
      robeRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={robeRef} position={position}>
      {/* Main robe body - dark base */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.2, 0.25, 0.12]} />
        <meshStandardMaterial
          color={robeColor}
          roughness={0.9}
          metalness={0.05}
          emissive="#2a1870"
          emissiveIntensity={0.15}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Robe bottom - flowing, dark */}
      <mesh position={[0, -0.18, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.14, 0.12, 8]} />
        <meshStandardMaterial
          color={robeColor}
          roughness={0.92}
          metalness={0.03}
          emissive="#2a1870"
          emissiveIntensity={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Robe trim - bright golden accent that pops */}
      <mesh position={[0, -0.12, 0.065]}>
        <boxGeometry args={[0.21, 0.015, 0.01]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffaa00"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Collar accent - bright golden */}
      <mesh position={[0, 0.08, 0.065]}>
        <boxGeometry args={[0.12, 0.015, 0.01]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffaa00"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// Floating animation component
export function FloatingAnimation({
  children,
  floatSpeed = 0.5,
  floatHeight = 0.05,
}: {
  children: React.ReactNode;
  floatSpeed?: number;
  floatHeight?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle floating motion
      const float = Math.sin(clock.elapsedTime * floatSpeed) * floatHeight;
      groupRef.current.position.y = float;
    }
  });

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}

// Angel glow aura component - more visible for dark background
export function AngelAura({
  position = [0, 0.3, 0],
  color = "#8060ff",
  size = 0.4,
}: {
  position?: [number, number, number];
  color?: string;
  size?: number;
}) {
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (auraRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 1.2) * 0.1 + 0.9;
      auraRef.current.scale.setScalar(pulse);
      (auraRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.25;
    }
  });

  return (
    <mesh ref={auraRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.25}
        side={THREE.BackSide}
      />
    </mesh>
  );
}
