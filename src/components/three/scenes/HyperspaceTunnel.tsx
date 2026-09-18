import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface HyperspaceTunnelProps {
  isWarping: boolean;
  warpProgress: number; // 0 to 1
  reducedMotion?: boolean;
}

export const HyperspaceTunnel: React.FC<HyperspaceTunnelProps> = ({
  isWarping,
  warpProgress,
  reducedMotion = false
}) => {
  const streakMeshRef = useRef<THREE.InstancedMesh>(null);
  const streakCount = 350;

  // Generate streak particles positioned in a cylinder around the camera
  const streaks = useMemo(() => {
    return Array.from({ length: streakCount }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 25; // tunnel radius
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 120,
        speed: 40 + Math.random() * 80,
        color: i % 4 === 0 ? '#FFFFFF' : (i % 3 === 0 ? '#2563EB' : '#00C2FF'),
        baseLength: 0.8 + Math.random() * 1.5,
        radiusWidth: 0.04 + Math.random() * 0.05
      };
    });
  }, []);

  useFrame((_, delta) => {
    if (!streakMeshRef.current) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    streaks.forEach((s, idx) => {
      // If warping, streak speeds explode and stretch along Z axis!
      if (isWarping && !reducedMotion) {
        const speedMult = 1 + warpProgress * 6;
        s.z += s.speed * speedMult * delta;
        if (s.z > 60) s.z = -80;

        const stretch = s.baseLength * (1 + warpProgress * 25);
        dummy.position.set(s.x, s.y, s.z);
        dummy.scale.set(1, 1, stretch);
        dummy.updateMatrix();
        streakMeshRef.current?.setMatrixAt(idx, dummy.matrix);

        color.set(s.color);
        streakMeshRef.current?.setColorAt(idx, color);
      } else {
        // Idle gentle float
        s.z += delta * 4;
        if (s.z > 40) s.z = -40;

        dummy.position.set(s.x, s.y, s.z);
        dummy.scale.set(0.5, 0.5, s.baseLength);
        dummy.updateMatrix();
        streakMeshRef.current?.setMatrixAt(idx, dummy.matrix);

        color.set('#00C2FF');
        streakMeshRef.current?.setColorAt(idx, color);
      }
    });

    streakMeshRef.current.instanceMatrix.needsUpdate = true;
    if (streakMeshRef.current.instanceColor) {
      streakMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group visible={isWarping}>
      <instancedMesh
        ref={streakMeshRef}
        args={[undefined, undefined, streakCount]}
      >
        <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
        <meshBasicMaterial
          color="#00C2FF"
          transparent
          opacity={isWarping ? Math.min(0.9, 0.3 + warpProgress * 0.6) : 0.2}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
};
