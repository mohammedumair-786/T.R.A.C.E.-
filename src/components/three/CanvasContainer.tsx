import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { MasterScene } from './scenes/MasterScene';

interface CanvasContainerProps {
  scrollProgress: number;
  isWarping: boolean;
  warpProgress: number;
  reducedMotion?: boolean;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  scrollProgress,
  isWarping,
  warpProgress,
  reducedMotion = false
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050816]">
      <Canvas
        camera={{ position: [0, 42, 60], fov: 45, near: 0.1, far: 300 }}
        dpr={[1, 2]}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          alpha: false,
          depth: true,
          stencil: false
        }}
      >
        <Suspense fallback={null}>
          <MasterScene
            scrollProgress={scrollProgress}
            isWarping={isWarping}
            warpProgress={warpProgress}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
