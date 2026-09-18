import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CAMERA_NODES, CameraNodeData } from '../../../utils/mockData';

interface CameraNodesProps {
  scrollProgress: number;
}

export const CameraNodes: React.FC<CameraNodesProps> = ({ scrollProgress }) => {
  const ringsRef = useRef<THREE.Group>(null);
  const pulseLinesRef = useRef<THREE.LineSegments>(null);

  // Nodes become active after scroll reaches 10%
  const networkActive = scrollProgress >= 0.1;

  // Interconnection line segments between connected nodes
  const { linePositions, connections } = useMemo(() => {
    const points: number[] = [];
    const conns: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const nodeMap = new Map<string, CameraNodeData>(CAMERA_NODES.map((n: CameraNodeData) => [n.id, n]));

    CAMERA_NODES.forEach((node: CameraNodeData) => {
      node.connectedTo.forEach((targetId: string) => {
        const target = nodeMap.get(targetId);
        if (target) {
          points.push(node.position[0], node.position[1], node.position[2]);
          points.push(target.position[0], target.position[1], target.position[2]);
          conns.push({
            start: new THREE.Vector3(...node.position),
            end: new THREE.Vector3(...target.position)
          });
        }
      });
    });

    return {
      linePositions: new Float32Array(points),
      connections: conns
    };
  }, []);

  // Moving signal pulses on network links
  const pulseCount = 18;
  const linkPulses = useMemo(() => {
    return Array.from({ length: pulseCount }).map((_, i) => ({
      connectionIndex: i % Math.max(1, connections.length),
      progress: (i / pulseCount),
      speed: 0.2 + (i % 3) * 0.1
    }));
  }, [connections.length]);

  const pulseMeshRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();

    // Pulse animation for node rings
    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const scale = 1 + Math.sin(time * 3 + i) * 0.2;
        mesh.scale.set(scale, scale, scale);
      });
    }

    // Advance pulses along network links
    if (networkActive && connections.length > 0) {
      linkPulses.forEach((p, idx) => {
        const mesh = pulseMeshRefs.current[idx];
        if (mesh) {
          p.progress += p.speed * delta;
          if (p.progress > 1) p.progress = 0;

          const conn = connections[p.connectionIndex];
          if (conn) {
            mesh.position.lerpVectors(conn.start, conn.end, p.progress);
          }
        }
      });
    }
  });

  // Calculate network line visibility based on scroll
  const lineOpacity = scrollProgress < 0.12 ? 0 : Math.min((scrollProgress - 0.12) / 0.15, 0.45);

  return (
    <group>
      {/* 24 Camera Mast Structures */}
      {CAMERA_NODES.map((node: CameraNodeData) => {
        const isCam07 = node.id === 'cam-07';
        const isTrajectoryNode = ['cam-01', 'cam-05', 'cam-07', 'cam-09', 'cam-12'].includes(node.id);

        return (
          <group key={node.id} position={node.position}>
            {/* Mast Post */}
            <mesh position={[0, -node.position[1] / 2, 0]}>
              <cylinderGeometry args={[0.08, 0.12, node.position[1], 8]} />
              <meshStandardMaterial color="#0D1B2A" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Sensor Pod / Crossbar */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.6, 0.18, 0.3]} />
              <meshStandardMaterial color="#081426" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Pulsing Cyan Node Core */}
            <mesh position={[0, 0, 0.1]}>
              <sphereGeometry args={[isCam07 ? 0.24 : (isTrajectoryNode ? 0.18 : 0.12), 12, 12]} />
              <meshBasicMaterial
                color={isCam07 ? '#00C2FF' : (isTrajectoryNode ? '#7DD3FC' : '#00C2FF')}
                transparent
                opacity={networkActive ? 0.95 : 0.4}
              />
            </mesh>

            {/* Vertical Radar/Sightline Laser to Ground */}
            {networkActive && (
              <mesh position={[0, -node.position[1] / 2, 0]}>
                <cylinderGeometry args={[0.015, 0.015, node.position[1], 4]} />
                <meshBasicMaterial
                  color="#00C2FF"
                  transparent
                  opacity={isCam07 ? 0.35 : 0.12}
                />
              </mesh>
            )}

            {/* Ground Ping Circle */}
            {networkActive && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -node.position[1] + 0.05, 0]}>
                <ringGeometry args={[0.6, 0.75, 16]} />
                <meshBasicMaterial
                  color={isCam07 ? '#00C2FF' : '#2563EB'}
                  transparent
                  opacity={isCam07 ? 0.6 : 0.2}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Pulsing Rings Group */}
      {networkActive && (
        <group ref={ringsRef}>
          {CAMERA_NODES.map((node: CameraNodeData) => (
            <mesh key={`ring-${node.id}`} position={node.position} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.3, 0.38, 16]} />
              <meshBasicMaterial
                color="#00C2FF"
                transparent
                opacity={node.id === 'cam-07' ? 0.8 : 0.35}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Network Interconnection Lines */}
      {lineOpacity > 0 && (
        <lineSegments ref={pulseLinesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={linePositions.length / 3}
              array={linePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#00C2FF"
            transparent
            opacity={lineOpacity}
            linewidth={1}
          />
        </lineSegments>
      )}

      {/* Link Pulse Packets */}
      {networkActive && lineOpacity > 0.1 && (
        <group>
          {linkPulses.map((_, idx) => (
            <mesh
              key={`pulse-${idx}`}
              ref={(el) => {
                if (el) pulseMeshRefs.current[idx] = el;
              }}
              position={[0, -10, 0]}
            >
              <sphereGeometry args={[0.12, 6, 6]} />
              <meshBasicMaterial color="#7DD3FC" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
