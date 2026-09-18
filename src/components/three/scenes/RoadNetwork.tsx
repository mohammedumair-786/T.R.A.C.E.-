import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface RoadNetworkProps {
  scrollProgress: number;
}

export const RoadNetwork: React.FC<RoadNetworkProps> = ({ scrollProgress }) => {
  const pulseGroupRef = useRef<THREE.Group>(null);

  // Define primary avenues and cross streets
  const roads = useMemo(() => [
    // Main South-North Avenue (where CAM-07 & vehicle drive)
    { start: [0, 0.05, -80] as [number, number, number], end: [0, 0.05, 80] as [number, number, number], width: 5 },
    // Cross Street 1 (North)
    { start: [-80, 0.05, -30] as [number, number, number], end: [80, 0.05, -30] as [number, number, number], width: 4 },
    // Cross Street 2 (Mid-North)
    { start: [-80, 0.05, -10] as [number, number, number], end: [80, 0.05, -10] as [number, number, number], width: 4.5 },
    // Cross Street 3 (Main Intersection at CAM-07)
    { start: [-80, 0.05, 5] as [number, number, number], end: [80, 0.05, 5] as [number, number, number], width: 6 },
    // Cross Street 4 (South)
    { start: [-80, 0.05, 20] as [number, number, number], end: [80, 0.05, 20] as [number, number, number], width: 4 },
    // Cross Street 5 (Expressway South)
    { start: [-80, 0.05, 38] as [number, number, number], end: [80, 0.05, 38] as [number, number, number], width: 5 },
    // Parallel Avenue West
    { start: [-25, 0.05, -80] as [number, number, number], end: [-25, 0.05, 80] as [number, number, number], width: 3.5 },
    // Parallel Avenue East
    { start: [25, 0.05, -80] as [number, number, number], end: [25, 0.05, 80] as [number, number, number], width: 3.5 },
  ], []);

  // Moving traffic data packets
  const packetCount = 40;
  const packets = useMemo(() => {
    return Array.from({ length: packetCount }).map((_, i) => ({
      axis: i % 2 === 0 ? 'z' : 'x',
      fixedCoord: i % 2 === 0 ? (i % 4 === 0 ? 0 : (i % 4 === 1 ? -25 : 25)) : (i % 3 === 0 ? 5 : -10),
      speed: 15 + (i % 5) * 5,
      offset: (i * 17) % 160 - 80,
      size: 0.8 + (i % 3) * 0.4,
      color: i % 6 === 0 ? '#2563EB' : '#00C2FF'
    }));
  }, []);

  const packetMeshesRef = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    // Flow speeds increase when in Urban Intelligence phase (scrollProgress > 0.8)
    const speedMult = scrollProgress > 0.8 ? 2.2 : 1.0;

    packets.forEach((p, idx) => {
      const mesh = packetMeshesRef.current[idx];
      if (mesh) {
        p.offset += p.speed * speedMult * delta;
        if (p.offset > 80) p.offset = -80;

        if (p.axis === 'z') {
          mesh.position.set(p.fixedCoord, 0.15, p.offset);
        } else {
          mesh.position.set(p.offset, 0.15, p.fixedCoord);
        }
      }
    });
  });

  return (
    <group>
      {/* Road Surfaces */}
      {roads.map((road, idx) => {
        const isHorizontal = road.start[0] !== road.end[0];
        const length = isHorizontal ? Math.abs(road.end[0] - road.start[0]) : Math.abs(road.end[2] - road.start[2]);
        const midX = (road.start[0] + road.end[0]) / 2;
        const midZ = (road.start[2] + road.end[2]) / 2;

        return (
          <group key={idx}>
            {/* Dark asphalt road bed */}
            <mesh
              position={[midX, 0.02, midZ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[isHorizontal ? length : road.width, isHorizontal ? road.width : length]} />
              <meshStandardMaterial color="#070D18" roughness={0.9} />
            </mesh>

            {/* Glowing Center Line / Data Guide */}
            <mesh
              position={[midX, 0.04, midZ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[isHorizontal ? length : 0.2, isHorizontal ? 0.2 : length]} />
              <meshBasicMaterial
                color="#00C2FF"
                transparent
                opacity={scrollProgress > 0.8 ? 0.6 : 0.25}
              />
            </mesh>

            {/* Road Edge Highlights */}
            <mesh
              position={[midX + (isHorizontal ? 0 : road.width / 2), 0.04, midZ + (isHorizontal ? road.width / 2 : 0)]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[isHorizontal ? length : 0.08, isHorizontal ? 0.08 : length]} />
              <meshBasicMaterial color="#081426" />
            </mesh>
            <mesh
              position={[midX - (isHorizontal ? 0 : road.width / 2), 0.04, midZ - (isHorizontal ? road.width / 2 : 0)]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[isHorizontal ? length : 0.08, isHorizontal ? 0.08 : length]} />
              <meshBasicMaterial color="#081426" />
            </mesh>
          </group>
        );
      })}

      {/* Traffic Data Pulses */}
      <group ref={pulseGroupRef}>
        {packets.map((p, idx) => (
          <mesh
            key={idx}
            ref={(el) => {
              if (el) packetMeshesRef.current[idx] = el;
            }}
            position={[0, -1, 0]}
          >
            <boxGeometry args={[p.axis === 'z' ? 0.3 : p.size, 0.1, p.axis === 'z' ? p.size : 0.3]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
