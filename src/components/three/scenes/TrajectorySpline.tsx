import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TRAJECTORY_SEQUENCE, TrajectoryPoint } from '../../../utils/mockData';

interface TrajectorySplineProps {
  scrollProgress: number;
}

export const TrajectorySpline: React.FC<TrajectorySplineProps> = ({ scrollProgress }) => {
  const markerRef = useRef<THREE.Mesh>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);

  // Active during trajectory reconstruction phase
  const isVisible = scrollProgress >= 0.72;

  // Build Catmull-Rom curve from the trajectory nodes
  const { curve, fullPoints } = useMemo(() => {
    const vectors = TRAJECTORY_SEQUENCE.map(
      (p: TrajectoryPoint) => new THREE.Vector3(p.position[0], p.position[1] + 0.3, p.position[2])
    );
    const crCurve = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.5);
    const pts = crCurve.getPoints(120);
    return { curve: crCurve, fullPoints: pts };
  }, []);

  // Calculate draw progression of the spline (from 0 to 1)
  const drawProgress = isVisible ? Math.min((scrollProgress - 0.72) / 0.16, 1.0) : 0;

  // Partial points array based on drawProgress
  const currentPoints = useMemo(() => {
    const count = Math.max(2, Math.floor(fullPoints.length * Math.max(drawProgress, 0.05)));
    return fullPoints.slice(0, count);
  }, [drawProgress, fullPoints]);

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(currentPoints);
    return geom;
  }, [currentPoints]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Move marker along the reconstructed curve
    if (markerRef.current && isVisible) {
      // Loop marker from 0 to drawProgress
      const markerT = (time * 0.25) % Math.max(drawProgress, 0.01);
      const point = curve.getPointAt(markerT);
      markerRef.current.position.copy(point);

      if (pulseRingRef.current) {
        pulseRingRef.current.position.copy(point);
        const s = 1 + Math.sin(time * 6) * 0.3;
        pulseRingRef.current.scale.set(s, s, s);
      }
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      {/* Dynamic Animated Trajectory Path */}
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0x00c2ff, linewidth: 2, transparent: true, opacity: 0.9 }))} />

      {/* Trajectory Underglow Line */}
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0x2563eb, linewidth: 4, transparent: true, opacity: 0.4 }))} />

      {/* Waypoint Markers at each camera in sequence */}
      {TRAJECTORY_SEQUENCE.map((pt: TrajectoryPoint, idx: number) => {
        const isReached = drawProgress >= idx / (TRAJECTORY_SEQUENCE.length - 1);
        return (
          <group key={pt.nodeId} position={[pt.position[0], pt.position[1] + 0.3, pt.position[2]]}>
            <mesh>
              <sphereGeometry args={[0.3, 12, 12]} />
              <meshBasicMaterial
                color={isReached ? '#00C2FF' : '#081426'}
                transparent
                opacity={isReached ? 0.95 : 0.4}
              />
            </mesh>

            {/* Pulsing Target Ring at Reached Nodes */}
            {isReached && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.65, 16]} />
                <meshBasicMaterial color="#00C2FF" transparent opacity={0.7} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Moving Vehicle Waypoint Marker */}
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial color="#7DD3FC" />
      </mesh>

      <mesh ref={pulseRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.8, 16]} />
        <meshBasicMaterial color="#00C2FF" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
