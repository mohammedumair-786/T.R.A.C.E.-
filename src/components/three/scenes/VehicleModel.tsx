import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface VehicleModelProps {
  scrollProgress: number;
  onPositionUpdate?: (pos: [number, number, number]) => void;
}

export const VehicleModel: React.FC<VehicleModelProps> = ({ scrollProgress, onPositionUpdate }) => {
  const carGroupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const scannerLineRef = useRef<THREE.Mesh>(null);

  // Position calculation based on scroll
  // Vehicle sequence spans scroll 0.48 to 0.82
  const zPosition = (() => {
    if (scrollProgress < 0.48) return -25;
    if (scrollProgress > 0.82) return 35;
    const t = (scrollProgress - 0.48) / (0.82 - 0.48);
    // Smooth acceleration and deceleration curve
    return -25 + t * 60;
  })();

  const isScanningActive = scrollProgress >= 0.58 && scrollProgress <= 0.78;

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (carGroupRef.current) {
      // Smooth position lerp
      carGroupRef.current.position.z = THREE.MathUtils.lerp(
        carGroupRef.current.position.z,
        zPosition,
        0.15
      );

      // Report position to parent for CCTV tracking
      if (onPositionUpdate) {
        onPositionUpdate([
          carGroupRef.current.position.x,
          carGroupRef.current.position.y + 0.6,
          carGroupRef.current.position.z
        ]);
      }
    }

    // Wheel rotation
    wheelsRef.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x -= 0.15;
      }
    });

    // Animate AI laser scan plane across vehicle
    if (scannerLineRef.current && isScanningActive) {
      scannerLineRef.current.position.z = Math.sin(time * 5) * 1.8;
      const mat = scannerLineRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.6 + Math.sin(time * 10) * 0.2;
    }
  });

  return (
    <group ref={carGroupRef} position={[0, 0.4, -25]}>
      {/* Main Chassis */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 0.5, 4.2]} />
        <meshStandardMaterial color="#0A1526" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Tapered Hood */}
      <mesh position={[0, 0.52, 1.2]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[1.65, 0.25, 1.6]} />
        <meshStandardMaterial color="#07101E" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Aerodynamic Cabin / Glass Canopy */}
      <mesh position={[0, 0.85, -0.2]}>
        <boxGeometry args={[1.4, 0.55, 2.2]} />
        <meshStandardMaterial color="#030712" roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Cyber Front Bumper */}
      <mesh position={[0, 0.25, 2.1]}>
        <boxGeometry args={[1.75, 0.3, 0.3]} />
        <meshStandardMaterial color="#050816" metalness={0.7} />
      </mesh>

      {/* Cyan LED Headlight Strips */}
      <mesh position={[-0.7, 0.45, 2.15]}>
        <boxGeometry args={[0.35, 0.08, 0.05]} />
        <meshBasicMaterial color="#00C2FF" />
      </mesh>
      <mesh position={[0.7, 0.45, 2.15]}>
        <boxGeometry args={[0.35, 0.08, 0.05]} />
        <meshBasicMaterial color="#00C2FF" />
      </mesh>

      {/* Front Road Beams */}
      <spotLight
        position={[0, 0.5, 2.2]}
        target-position={[0, 0, 15]}
        color="#00C2FF"
        intensity={2.2}
        distance={20}
        angle={Math.PI / 6}
        penumbra={0.5}
      />

      {/* Rear Taillight Strip */}
      <mesh position={[0, 0.5, -2.12]}>
        <boxGeometry args={[1.7, 0.08, 0.05]} />
        <meshBasicMaterial color="#FF3B4E" />
      </mesh>

      {/* Rear License Plate Target Bracket */}
      <mesh position={[0, 0.32, -2.14]}>
        <boxGeometry args={[0.7, 0.22, 0.02]} />
        <meshBasicMaterial color="#0D1B2A" />
      </mesh>
      {/* Plate White/Cyan Background */}
      <mesh position={[0, 0.32, -2.155]}>
        <boxGeometry args={[0.62, 0.16, 0.01]} />
        <meshBasicMaterial color="#E2E8F0" />
      </mesh>

      {/* Wheels */}
      {[
        [-0.95, 0, 1.3],
        [0.95, 0, 1.3],
        [-0.95, 0, -1.3],
        [0.95, 0, -1.3]
      ].map((pos, idx) => (
        <group
          key={idx}
          position={pos as [number, number, number]}
          ref={(el) => {
            if (el) wheelsRef.current[idx] = el;
          }}
        >
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 0.25, 16]} />
            <meshStandardMaterial color="#040711" roughness={0.8} />
          </mesh>
          {/* Cyber Rim with Cyan Hub */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.26, 0.26, 0.26, 8]} />
            <meshStandardMaterial color="#081426" metalness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.27, 8]} />
            <meshBasicMaterial color="#00C2FF" />
          </mesh>
        </group>
      ))}

      {/* Neon Cyan Underglow */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 3.8]} />
        <meshBasicMaterial color="#00C2FF" transparent opacity={0.35} />
      </mesh>

      {/* AI Scanning Slice Plane over Vehicle */}
      {isScanningActive && (
        <mesh ref={scannerLineRef} position={[0, 0.7, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[2.4, 1.4, 0.04]} />
          <meshBasicMaterial color="#00C2FF" transparent opacity={0.65} wireframe={false} />
        </mesh>
      )}

      {/* AI Bounding Wireframe Box surrounding vehicle */}
      {isScanningActive && (
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[2.2, 1.3, 4.6]} />
          <meshBasicMaterial color="#00C2FF" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};
