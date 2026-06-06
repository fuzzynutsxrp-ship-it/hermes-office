"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import * as THREE from "three";
import { WORLD_H, WORLD_W } from "@/features/retro-office/core/constants";
import {
  DISTRICT_CAMERA_POSITION,
  DISTRICT_CAMERA_TARGET,
  DISTRICT_CAMERA_ZOOM,
} from "@/features/retro-office/core/district";
import { toWorld } from "@/features/retro-office/core/geometry";
import type { RenderAgent } from "@/features/retro-office/core/types";

export type CameraPreset = {
  pos: [number, number, number];
  target: [number, number, number];
  zoom?: number;
};

export const CAMERA_PRESETS = {
  overview: {
    pos: DISTRICT_CAMERA_POSITION,
    target: DISTRICT_CAMERA_TARGET,
    zoom: DISTRICT_CAMERA_ZOOM,
  },
  frontDesk: {
    pos: [-2, 8, 4],
    target: [-3, 0, -2],
    zoom: 70,
  },
  lounge: {
    pos: [7, 7, -5],
    target: [5, 0, -3],
    zoom: 62,
  },
} satisfies Record<string, CameraPreset>;

type OrbitControllerLike = {
  target: THREE.Vector3;
  update: () => void;
};

export function CameraAnimator({
  presetRef,
  orbitRef,
}: {
  presetRef: MutableRefObject<CameraPreset | null>;
  orbitRef: RefObject<OrbitControllerLike | null>;
}) {
  const { camera } = useThree();
  const activePerspectiveCameraRef = useRef<THREE.PerspectiveCamera | null>(
    camera instanceof THREE.PerspectiveCamera ? camera : null,
  );
  const targetPositionRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      activePerspectiveCameraRef.current = camera;
    }
  }, [camera]);

  useFrame(() => {
    const preset = presetRef.current;
    const orbit = orbitRef.current;
    if (!preset || !orbit) return;
    const activeCamera = activePerspectiveCameraRef.current;

    targetPositionRef.current.set(...preset.pos);
    targetLookAtRef.current.set(...preset.target);
    camera.position.lerp(targetPositionRef.current, 0.06);
    orbit.target.lerp(targetLookAtRef.current, 0.06);

    if (activeCamera && typeof preset.zoom === "number") {
      activeCamera.zoom += (preset.zoom - activeCamera.zoom) * 0.08;
      activeCamera.updateProjectionMatrix();
    }

    orbit.update();
    const zoomSettled =
      !activeCamera ||
      typeof preset.zoom !== "number" ||
      Math.abs(activeCamera.zoom - preset.zoom) < 0.5;

    if (camera.position.distanceTo(targetPositionRef.current) < 0.05 && zoomSettled) {
      presetRef.current = null;
    }
  });

  return null;
}

export function FollowCamController({
  followRef,
  agentsRef,
  agentLookupRef,
}: {
  followRef: MutableRefObject<string | null>;
  agentsRef: RefObject<RenderAgent[]>;
  agentLookupRef?: RefObject<Map<string, RenderAgent>>;
}) {
  const { camera, set, size, gl } = useThree();
  const perspectiveCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const originalCameraRef = useRef<THREE.PerspectiveCamera | null>(
    camera instanceof THREE.PerspectiveCamera ? camera : null,
  );
  const wasFollowingRef = useRef(false);
  const lastAgentIdRef = useRef<string | null>(null);
  const thetaRef = useRef(0);
  const phiRef = useRef(Math.PI / 6);
  const radiusRef = useRef(2.0);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const cameraPositionRef = useRef(new THREE.Vector3());
  const lookAtRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      originalCameraRef.current = camera;
    }
  }, [camera]);

  useEffect(() => {
    const element = gl.domElement;

    const handleMouseDown = (event: MouseEvent) => {
      if (!followRef.current || event.button !== 0) return;
      isDraggingRef.current = true;
      lastMouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = event.clientX - lastMouseRef.current.x;
      const dy = event.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: event.clientX, y: event.clientY };
      thetaRef.current -= dx * 0.006;
      phiRef.current = Math.max(
        0.05,
        Math.min(Math.PI / 2.2, phiRef.current + dy * 0.006),
      );
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!followRef.current) return;
      radiusRef.current = Math.max(
        0.8,
        Math.min(10, radiusRef.current + event.deltaY * 0.005),
      );
    };

    element.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    element.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      element.removeEventListener("wheel", handleWheel);
    };
  }, [gl, followRef]);

  useFrame(() => {
    const agentId = followRef.current;
    const isFollowing = agentId !== null;

    if (isFollowing && !wasFollowingRef.current) {
      const agent =
        (agentId ? agentLookupRef?.current?.get(agentId) : undefined) ??
        agentsRef.current?.find((candidate) => candidate.id === agentId);
      if (!agent) return;

      if (!perspectiveCameraRef.current) {
        perspectiveCameraRef.current = new THREE.PerspectiveCamera(
          65,
          size.width / size.height,
          0.1,
          100,
        );
      }

      thetaRef.current = agent.facing + Math.PI;
      lastAgentIdRef.current = agentId;
      set({ camera: perspectiveCameraRef.current });
      wasFollowingRef.current = true;
    }

    if (!isFollowing && wasFollowingRef.current) {
      if (originalCameraRef.current) {
        set({ camera: originalCameraRef.current });
      }
      wasFollowingRef.current = false;
      return;
    }

    if (!isFollowing || !perspectiveCameraRef.current) return;

    const agent =
      (agentId ? agentLookupRef?.current?.get(agentId) : undefined) ??
      agentsRef.current?.find((candidate) => candidate.id === agentId);
    if (!agent) return;

    if (agentId !== lastAgentIdRef.current) {
      thetaRef.current = agent.facing + Math.PI;
      lastAgentIdRef.current = agentId;
    }

    const [wx, , wz] = toWorld(agent.x, agent.y);
    const radius = radiusRef.current;
    const theta = thetaRef.current;
    const phi = phiRef.current;

    cameraPositionRef.current.set(
      wx + radius * Math.sin(phi) * Math.sin(theta),
      0.4 + radius * Math.cos(phi),
      wz + radius * Math.sin(phi) * Math.cos(theta),
    );
    perspectiveCameraRef.current.position.copy(cameraPositionRef.current);

    lookAtRef.current.set(wx, 0.5, wz);
    perspectiveCameraRef.current.lookAt(lookAtRef.current);
    perspectiveCameraRef.current.aspect = size.width / size.height;
    perspectiveCameraRef.current.updateProjectionMatrix();
  });

  return null;
}

// Dark mode ethereal lighting - dim ambient with strategic colored accents
export function DayNightCycle({
  externalTimeRef,
}: {
  externalTimeRef?: MutableRefObject<number>;
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    // Subtle pulsing for ethereal feel
    const pulse = Math.sin(clock.elapsedTime * 0.3) * 0.05 + 0.95;

    if (ambientRef.current) {
      ambientRef.current.intensity = 0.35 * pulse;
    }

    if (sunRef.current) {
      sunRef.current.intensity = 0.45 * pulse;
    }

    if (fillLightRef.current) {
      fillLightRef.current.intensity = 0.5 * pulse;
    }

    if (rimLightRef.current) {
      rimLightRef.current.intensity = 0.4 * pulse;
    }

    if (externalTimeRef) {
      externalTimeRef.current = 0.25; // Fixed daytime
    }
  });

  return (
    <>
      {/* Main ambient - dim cool ethereal light */}
      <ambientLight
        ref={ambientRef}
        intensity={0.35}
        color="#1a1030"
      />

      {/* Main directional light - dim cool blue */}
      <directionalLight
        ref={sunRef}
        position={[8, 14, 6]}
        intensity={0.45}
        color="#8090ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
        shadow-camera-left={-WORLD_W * 0.7}
        shadow-camera-right={WORLD_W * 0.7}
        shadow-camera-top={WORLD_H * 0.7}
        shadow-camera-bottom={-WORLD_H * 0.7}
      />

      {/* Fill light - deep purple atmospheric */}
      <pointLight
        ref={fillLightRef}
        position={[0, 3, 0]}
        intensity={0.5}
        color="#6030c0"
        distance={15}
        decay={2}
      />

      {/* Rim light - subtle gold heavenly accent */}
      <pointLight
        ref={rimLightRef}
        position={[0, 8, -5]}
        intensity={0.4}
        color="#a08030"
        distance={20}
        decay={2}
      />

      {/* Colored atmospheric point lights */}
      <pointLight
        position={[-5, 2, -3]}
        intensity={0.25}
        color="#7c3aed"
        distance={8}
        decay={2}
      />
      <pointLight
        position={[5, 2, 3]}
        intensity={0.25}
        color="#3b82f6"
        distance={8}
        decay={2}
      />
      <pointLight
        position={[3, 1.5, -4]}
        intensity={0.15}
        color="#a855f7"
        distance={6}
        decay={2}
      />
      <pointLight
        position={[-3, 1.5, 4]}
        intensity={0.15}
        color="#6366f1"
        distance={6}
        decay={2}
      />

      {/* Heavenly rays from above - dimmer but still present */}
      <spotLight
        position={[0, 10, 0]}
        angle={0.6}
        penumbra={0.8}
        intensity={0.15}
        color="#8060ff"
        distance={15}
        decay={2}
      />
    </>
  );
}
