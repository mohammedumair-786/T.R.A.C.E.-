import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ProceduralCity } from './ProceduralCity';
import { RoadNetwork } from './RoadNetwork';
import { CameraNodes } from './CameraNodes';
import { CCTVModel } from './CCTVModel';
import { VehicleModel } from './VehicleModel';
import { TrajectorySpline } from './TrajectorySpline';
import { HyperspaceTunnel } from './HyperspaceTunnel';

interface MasterSceneProps {
  scrollProgress: number;
  isWarping: boolean;
  warpProgress: number;
  reducedMotion?: boolean;
}

export const MasterScene: React.FC<MasterSceneProps> = ({
  scrollProgress,
  isWarping,
  warpProgress,
  reducedMotion = false
}) => {
  const { camera } = useThree();
  const [vehiclePos, setVehiclePos] = useState<[number, number, number]>([0, 0.6, -25]);
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  useFrame(({ pointer, clock }) => {
    const time = clock.getElapsedTime();

    // Subtle parallax from pointer
    const px = reducedMotion ? 0 : pointer.x * 1.5;
    const py = reducedMotion ? 0 : pointer.y * 0.8;

    if (isWarping && !reducedMotion) {
      // Warp flight camera: accelerates straight forward along Z-axis!
      const warpZ = 40 - Math.pow(warpProgress, 2.5) * 220;
      camera.position.set(0, 5, warpZ);
      currentLookAt.current.set(0, 5, warpZ - 50);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // Scroll-driven camera choreographies
    let targetPos = new THREE.Vector3(0, 42, 60);
    let targetLook = new THREE.Vector3(0, 2, 0);

    if (scrollProgress < 0.15) {
      // Hero Boot & Wide City
      const t = scrollProgress / 0.15;
      targetPos.set(0 + px, 44 - t * 4, 62 + py);
      targetLook.set(0, 2, 0);
    } else if (scrollProgress < 0.35) {
      // Camera Network expansion
      const t = (scrollProgress - 0.15) / 0.20;
      targetPos.set(-10 + t * 4 + px, 38 - t * 14, 52 - t * 16 + py);
      targetLook.set(0, 3, 0);
    } else if (scrollProgress < 0.52) {
      // CCTV Turret Close-up (CAM-07)
      const t = (scrollProgress - 0.35) / 0.17;
      // Fly down close to CAM-07 at [0, 4.5, 5]
      targetPos.set(
        THREE.MathUtils.lerp(-6, 2.8, t) + px * 0.3,
        THREE.MathUtils.lerp(24, 6.2, t) + py * 0.3,
        THREE.MathUtils.lerp(36, 9.8, t)
      );
      targetLook.set(
        THREE.MathUtils.lerp(0, 0.8, t),
        THREE.MathUtils.lerp(3, 4.6, t),
        5
      );
    } else if (scrollProgress < 0.68) {
      // Vehicle Interception & AI Detection tracking shot
      const t = (scrollProgress - 0.52) / 0.16;
      targetPos.set(2.4 + px * 0.3, 4.2 + py * 0.2, vehiclePos[2] + 6.5);
      targetLook.set(vehiclePos[0], vehiclePos[1] + 0.4, vehiclePos[2]);
    } else if (scrollProgress < 0.82) {
      // ANPR License Plate Scan Lock
      const t = (scrollProgress - 0.68) / 0.14;
      targetPos.set(
        THREE.MathUtils.lerp(2.4, 0.8, t) + px * 0.2,
        THREE.MathUtils.lerp(4.2, 2.2, t) + py * 0.2,
        vehiclePos[2] + THREE.MathUtils.lerp(6.5, 4.5, t)
      );
      targetLook.set(0, 0.8, vehiclePos[2]);
    } else if (scrollProgress < 0.94) {
      // Trajectory Reconstruction & Multi-Camera zoom out
      const t = (scrollProgress - 0.82) / 0.12;
      targetPos.set(
        THREE.MathUtils.lerp(0.8, -12, t) + px,
        THREE.MathUtils.lerp(2.2, 55, t),
        THREE.MathUtils.lerp(vehiclePos[2] + 4.5, 45, t) + py
      );
      targetLook.set(0, 1, 15);
    } else {
      // Final Citywide Overview & System Complete
      const t = (scrollProgress - 0.94) / 0.06;
      targetPos.set(px, 55 + t * 15, 45 + t * 18 + py);
      targetLook.set(0, 0, 12);
    }

    // Subtle idle floating sway
    if (!reducedMotion) {
      targetPos.x += Math.sin(time * 0.8) * 0.4;
      targetPos.y += Math.cos(time * 0.6) * 0.3;
    }

    // Smooth camera position interpolation
    camera.position.lerp(targetPos, 0.08);

    // Smooth camera lookAt interpolation
    currentLookAt.current.lerp(targetLook, 0.08);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      {/* Deep Space Navy Fog */}
      <fogExp2 attach="fog" args={['#050816', 0.015]} />

      {/* Lighting System */}
      <ambientLight color="#081426" intensity={1.8} />
      <directionalLight
        position={[25, 50, 30]}
        color="#2563EB"
        intensity={2.2}
      />
      <directionalLight
        position={[-25, 30, -20]}
        color="#00C2FF"
        intensity={1.2}
      />
      <pointLight position={[0, 10, 0]} color="#00C2FF" intensity={1.5} distance={60} />

      {/* 3D World Components */}
      <ProceduralCity scrollProgress={scrollProgress} />
      <RoadNetwork scrollProgress={scrollProgress} />
      <CameraNodes scrollProgress={scrollProgress} />
      <CCTVModel scrollProgress={scrollProgress} vehiclePosition={vehiclePos} />
      <VehicleModel
        scrollProgress={scrollProgress}
        onPositionUpdate={setVehiclePos}
      />
      <TrajectorySpline scrollProgress={scrollProgress} />
      <HyperspaceTunnel
        isWarping={isWarping}
        warpProgress={warpProgress}
        reducedMotion={reducedMotion}
      />
    </>
  );
};
