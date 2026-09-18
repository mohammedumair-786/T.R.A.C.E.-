import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface CCTVModelProps {
  scrollProgress: number;
  vehiclePosition: [number, number, number];
}

export const CCTVModel: React.FC<CCTVModelProps> = ({ scrollProgress, vehiclePosition }) => {
  const gantryRef = useRef<THREE.Group>(null);
  const yawHeadRef = useRef<THREE.Group>(null);
  const pitchBodyRef = useRef<THREE.Group>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const frustumConeRef = useRef<THREE.Mesh>(null);

  // Position of CAM-07 mast next to the road intersection
  const mastPosition: [number, number, number] = [2.2, 0, 5];

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Idle subtle pan when vehicle is not in primary tracking range
    if (scrollProgress < 0.45 || scrollProgress > 0.8) {
      if (yawHeadRef.current) {
        yawHeadRef.current.rotation.y = THREE.MathUtils.lerp(
          yawHeadRef.current.rotation.y,
          Math.sin(time * 0.5) * 0.3 - 0.4,
          0.05
        );
      }
      if (pitchBodyRef.current) {
        pitchBodyRef.current.rotation.x = THREE.MathUtils.lerp(
          pitchBodyRef.current.rotation.x,
          0.35 + Math.sin(time * 0.8) * 0.05,
          0.05
        );
      }
    } else {
      // Active Tracking mode: pan & tilt directly towards the vehicle!
      const targetVec = new THREE.Vector3(...vehiclePosition);
      const camWorldPos = new THREE.Vector3(mastPosition[0] - 1.2, 5.0, mastPosition[2]);
      const dirToTarget = targetVec.clone().sub(camWorldPos).normalize();

      // Calculate yaw angle (azimuth)
      const targetYaw = Math.atan2(-dirToTarget.x, -dirToTarget.z);
      // Calculate pitch angle (elevation down)
      const horizDist = Math.sqrt(dirToTarget.x * dirToTarget.x + dirToTarget.z * dirToTarget.z);
      const targetPitch = Math.atan2(-dirToTarget.y, horizDist);

      if (yawHeadRef.current) {
        yawHeadRef.current.rotation.y = THREE.MathUtils.lerp(yawHeadRef.current.rotation.y, targetYaw, 0.1);
      }
      if (pitchBodyRef.current) {
        pitchBodyRef.current.rotation.x = THREE.MathUtils.lerp(pitchBodyRef.current.rotation.x, targetPitch, 0.1);
      }
    }

    // Pulse scanning frustum cone opacity
    if (frustumConeRef.current) {
      const mat = frustumConeRef.current.material as THREE.MeshBasicMaterial;
      if (scrollProgress >= 0.45 && scrollProgress <= 0.8) {
        mat.opacity = 0.18 + Math.sin(time * 4) * 0.06;
      } else {
        mat.opacity = 0.08;
      }
    }
  });

  return (
    <group position={mastPosition}>
      {/* Heavy-Duty Gantry Pole */}
      <mesh position={[0, 2.75, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 5.5, 12]} />
        <meshStandardMaterial color="#0D1B2A" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Horizontal Cantilever Arm over Road */}
      <mesh position={[-0.7, 5.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 1.6, 8]} />
        <meshStandardMaterial color="#081426" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Arm Bracing Strut */}
      <mesh position={[-0.5, 4.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
        <meshStandardMaterial color="#0D1B2A" metalness={0.8} />
      </mesh>

      {/* Camera Mount Hub at end of arm */}
      <group position={[-1.4, 5.15, 0]} ref={gantryRef}>
        {/* Motorized Gimbal Base (Yaw Axis) */}
        <group ref={yawHeadRef}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.15, 12]} />
            <meshStandardMaterial color="#050816" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Gimbal Fork */}
          <mesh position={[-0.14, -0.15, 0]}>
            <boxGeometry args={[0.05, 0.25, 0.15]} />
            <meshStandardMaterial color="#081426" metalness={0.8} />
          </mesh>
          <mesh position={[0.14, -0.15, 0]}>
            <boxGeometry args={[0.05, 0.25, 0.15]} />
            <meshStandardMaterial color="#081426" metalness={0.8} />
          </mesh>

          {/* Camera Housing (Pitch Axis) */}
          <group position={[0, -0.22, 0]} ref={pitchBodyRef}>
            {/* Main Weatherproof Body */}
            <mesh position={[0, 0, 0.1]}>
              <boxGeometry args={[0.22, 0.22, 0.45]} />
              <meshStandardMaterial color="#0D1B2A" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Sun/Rain Shield Hood */}
            <mesh position={[0, 0.12, 0.15]}>
              <boxGeometry args={[0.26, 0.03, 0.5]} />
              <meshStandardMaterial color="#00C2FF" transparent opacity={0.3} metalness={0.9} />
            </mesh>

            {/* Optical Lens Barrel */}
            <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.09, 0.1, 16]} />
              <meshStandardMaterial color="#050816" metalness={0.95} roughness={0.1} />
            </mesh>

            {/* Glowing Lens Glass with Cyan Reflection */}
            <mesh position={[0, 0, 0.405]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.01, 16]} />
              <meshBasicMaterial color="#00C2FF" />
            </mesh>

            {/* Infrared LED Ring around lens */}
            <mesh position={[0, 0, 0.38]} rotation={[0, 0, 0]}>
              <ringGeometry args={[0.085, 0.1, 12]} />
              <meshBasicMaterial color="#00C2FF" transparent opacity={0.75} side={THREE.DoubleSide} />
            </mesh>

            {/* Technical Node Identifier Decal */}
            <mesh position={[0.115, 0.05, 0.1]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.2, 0.06]} />
              <meshBasicMaterial color="#00C2FF" transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>

            {/* Sweeping Light Spotlight */}
            <spotLight
              ref={spotLightRef}
              position={[0, 0, 0.45]}
              target-position={[0, -5, 4]}
              color="#00C2FF"
              intensity={scrollProgress >= 0.45 && scrollProgress <= 0.8 ? 2.5 : 0.8}
              distance={25}
              angle={Math.PI / 5}
              penumbra={0.6}
            />

            {/* Cyan Laser / Scanner Cone Frustum Mesh */}
            <mesh
              ref={frustumConeRef}
              position={[0, 0, 4.5]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <coneGeometry args={[2.5, 9, 16, 1, true]} />
              <meshBasicMaterial
                color="#00C2FF"
                transparent
                opacity={0.12}
                side={THREE.DoubleSide}
                wireframe={false}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
