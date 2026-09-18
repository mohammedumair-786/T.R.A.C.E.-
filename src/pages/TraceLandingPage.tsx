import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { CanvasContainer } from '../components/three/CanvasContainer';
import { HeaderNav } from '../components/hud/HeaderNav';
import { SystemStatusHUD } from '../components/hud/SystemStatusHUD';
import { DetectionOverlay } from '../components/hud/DetectionOverlay';
import { ANPRScanOverlay } from '../components/hud/ANPRScanOverlay';
import { TrajectoryOverlay } from '../components/hud/TrajectoryOverlay';
import { AlertBanner } from '../components/hud/AlertBanner';
import { HeroSection } from '../components/sections/HeroSection';
import { CameraNetworkSection } from '../components/sections/CameraNetworkSection';
import { CCTVTrackingSection } from '../components/sections/CCTVTrackingSection';
import { UrbanIntelligenceSection } from '../components/sections/UrbanIntelligenceSection';
import { FinalCTASection } from '../components/sections/FinalCTASection';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useAudioSynth } from '../hooks/useAudioSynth';

interface TraceLandingPageProps {
  onNavigateToLogin: () => void;
}

export const TraceLandingPage: React.FC<TraceLandingPageProps> = ({ onNavigateToLogin }) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [warpProgress, setWarpProgress] = useState<number>(0);
  const [flashOpacity, setFlashOpacity] = useState<number>(0);

  const lenisRef = useRef<Lenis | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const audio = useAudioSynth();

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function onScroll() {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      setScrollProgress(progress);
    }

    lenis.on('scroll', onScroll);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      lenis.destroy();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Scroll to explore
  const handleExplore = () => {
    audio.playClick();
    if (lenisRef.current) {
      lenisRef.current.scrollTo(window.innerHeight * 1.2, { duration: 1.5 });
    } else {
      window.scrollTo({ top: window.innerHeight * 1.2, behavior: 'smooth' });
    }
  };

  // Hyperspace / Light-Speed Login Transition Trigger
  const handleEnterCommand = () => {
    if (isWarping) return; // Prevent repeated clicks
    setIsWarping(true);
    audio.playWarp();

    if (prefersReducedMotion) {
      // Reduced motion: gentle cyan fade into darkness
      setFlashOpacity(0.5);
      setTimeout(() => {
        setFlashOpacity(1);
        setTimeout(onNavigateToLogin, 400);
      }, 300);
      return;
    }

    // 2.0 Second Full Cinematic Hyperspace Warp
    const startTime = performance.now();
    const duration = 2000; // ms

    const animateWarp = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(1, elapsed / duration);
      setWarpProgress(t);

      // Light flash sequence near the end (between 1.5s and 1.85s)
      if (t > 0.75 && t < 0.92) {
        const flashT = (t - 0.75) / (0.92 - 0.75);
        // Quick spike to white-cyan then fade
        setFlashOpacity(Math.sin(flashT * Math.PI));
      } else if (t >= 0.92) {
        // Deep fade into darkness
        setFlashOpacity(1);
      }

      if (t < 1) {
        requestAnimationFrame(animateWarp);
      } else {
        setTimeout(onNavigateToLogin, 150);
      }
    };

    requestAnimationFrame(animateWarp);
  };

  return (
    <div ref={containerRef} className="relative bg-[#050816] text-slate-100 min-h-screen">
      {/* 3D WebGL Canvas Layer (Fixed Background) */}
      <CanvasContainer
        scrollProgress={scrollProgress}
        isWarping={isWarping}
        warpProgress={warpProgress}
        reducedMotion={prefersReducedMotion}
      />

      {/* Persistent Technical Top HUD Navigation */}
      <HeaderNav
        isMuted={audio.isMuted}
        onToggleMute={audio.toggleMute}
        onEnterCommand={handleEnterCommand}
        scrollProgress={scrollProgress}
      />

      {/* Floating System Status Pill */}
      <SystemStatusHUD scrollProgress={scrollProgress} />

      {/* Interactive 3D/2D Tracking & Analysis HUD Overlays */}
      <DetectionOverlay scrollProgress={scrollProgress} />
      <ANPRScanOverlay scrollProgress={scrollProgress} />
      <TrajectoryOverlay scrollProgress={scrollProgress} />
      <AlertBanner scrollProgress={scrollProgress} />

      {/* Scrollable Story Narrative Sections (Total height ~600vh for cinematic scroll travel) */}
      <div className="relative z-10 flex flex-col">
        {/* 0% - 15%: Hero Section */}
        <HeroSection onExplore={handleExplore} />

        {/* 15% - 35%: Multi-Camera Network */}
        <CameraNetworkSection />

        {/* 40% - 60%: CCTV CAM-07 & Road Monitoring */}
        <CCTVTrackingSection />

        {/* 65% - 75%: Spacer during AI Detection & ANPR lock */}
        <div className="h-[90vh] pointer-events-none" />

        {/* 80% - 92%: Urban Movement Intelligence */}
        <UrbanIntelligenceSection />

        {/* 94% - 100%: Citywide Overview & Final CTA */}
        <FinalCTASection
          onEnterCommand={handleEnterCommand}
          isWarping={isWarping}
        />
      </div>

      {/* Hyperspace Transition Flash & Fade Overlay */}
      {isWarping && (
        <div
          className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-75"
          style={{
            backgroundColor: flashOpacity > 0.6 ? '#E0F2FE' : '#050816',
            opacity: flashOpacity
          }}
        />
      )}
    </div>
  );
};
