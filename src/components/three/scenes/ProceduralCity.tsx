import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ProceduralCityProps {
  scrollProgress: number;
}

export const ProceduralCity: React.FC<ProceduralCityProps> = ({ scrollProgress }) => {
  const count = 90;
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const beaconMeshRef = useRef<THREE.InstancedMesh>(null);

  // Generate building transforms once
  const { buildingData, beaconData } = useMemo(() => {
    const buildings: { position: [number, number, number]; scale: [number, number, number]; color: string }[] = [];
    const beacons: { position: [number, number, number] }[] = [];

    // Deterministic pseudo-random seed
    let seed = 42;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Grid distribution with streets left open
    const gridSize = 10;
    const spacing = 12;
    const offset = (gridSize * spacing) / 2;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Leave main avenues open for roads (center lanes)
        if (i === 4 || i === 5 || j === 4 || j === 5) continue;
        // Randomly skip some blocks for plazas
        if (random() > 0.85) continue;

        const x = i * spacing - offset + (random() - 0.5) * 3;
        const z = j * spacing - offset + (random() - 0.5) * 3;
        
        // Height varies from 8 to 45
        const distFromCenter = Math.sqrt(x * x + z * z);
        const height = 10 + (1 - Math.min(distFromCenter / 60, 1)) * 32 + random() * 12;
        const width = 4 + random() * 4;
        const depth = 4 + random() * 4;

        buildings.push({
          position: [x, height / 2, z],
          scale: [width, height, depth],
          color: random() > 0.7 ? '#0D1B2A' : '#081426'
        });

        // Top beacon light on taller buildings
        if (height > 20) {
          beacons.push({
            position: [x, height + 0.5, z]
          });
        }
      }
    }

    return { buildingData: buildings, beaconData: beacons };
  }, []);

  // Set initial transforms for instanced mesh
  useMemo(() => {
    // Wait for refs to be mounted in useEffect/useFrame or do it lazily
  }, []);

  useFrame(({ clock }) => {
    if (instancedMeshRef.current && instancedMeshRef.current.count !== buildingData.length) {
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();

      buildingData.forEach((b, idx) => {
        dummy.position.set(...b.position);
        dummy.scale.set(...b.scale);
        dummy.updateMatrix();
        instancedMeshRef.current?.setMatrixAt(idx, dummy.matrix);
        color.set(b.color);
        instancedMeshRef.current?.setColorAt(idx, color);
      });
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      if (instancedMeshRef.current.instanceColor) {
        instancedMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (beaconMeshRef.current && beaconMeshRef.current.count !== beaconData.length) {
      const dummy = new THREE.Object3D();
      beaconData.forEach((b, idx) => {
        dummy.position.set(...b.position);
        dummy.scale.set(0.4, 0.4, 0.4);
        dummy.updateMatrix();
        beaconMeshRef.current?.setMatrixAt(idx, dummy.matrix);
      });
      beaconMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Instanced Low-poly Buildings */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, buildingData.length]}
        castShadow={false}
        receiveShadow={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#081426"
          roughness={0.8}
          metalness={0.4}
          wireframe={false}
        />
      </instancedMesh>

      {/* Building Edges Wireframe Accent */}
      <group>
        {buildingData.slice(0, 30).map((b, idx) => (
          <mesh key={idx} position={b.position}>
            <boxGeometry args={b.scale} />
            <meshBasicMaterial
              color="#00C2FF"
              wireframe
              transparent
              opacity={0.07 + (idx % 3 === 0 ? 0.08 : 0)}
            />
          </mesh>
        ))}
      </group>

      {/* Rooftop Beacons */}
      <instancedMesh
        ref={beaconMeshRef}
        args={[undefined, undefined, beaconData.length]}
      >
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color="#00C2FF" />
      </instancedMesh>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#050816" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
};
