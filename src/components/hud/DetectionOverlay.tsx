import React from 'react';
import { TARGET_VEHICLE } from '../../utils/mockData';
import { Badge } from '../ui/Badge';

interface DetectionOverlayProps {
  scrollProgress: number;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ scrollProgress }) => {
  // Visible during vehicle interception and detection sequence (0.54 to 0.74)
  const isVisible = scrollProgress >= 0.54 && scrollProgress <= 0.74;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center font-mono select-none px-4">
      {/* Central Precision Bounding Box */}
      <div className="relative w-[340px] h-[220px] sm:w-[460px] sm:h-[280px] border border-[#00C2FF]/50 corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan flex flex-col justify-between p-3">
        {/* Animated Scanning Line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[#00C2FF] shadow-[0_0_12px_#00C2FF] animate-scanline" />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-ping" />
            <span className="text-xs font-bold tracking-widest text-[#7DD3FC]">
              VEHICLE DETECTED
            </span>
          </div>
          <Badge status="ACTIVE" label="TRACKING LOCK" size="sm" />
        </div>

        {/* Crosshair Center Reticle */}
        <div className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center opacity-60">
          <span className="w-full h-[1px] bg-[#00C2FF]" />
          <span className="h-full w-[1px] bg-[#00C2FF] absolute" />
        </div>

        {/* Bottom Telemetry HUD */}
        <div className="bg-[#050816]/85 backdrop-blur-md p-2.5 border border-[#00C2FF]/30 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <span className="text-[9px] text-slate-400 block">TARGET ID</span>
            <span className="text-white font-semibold">{TARGET_VEHICLE.id}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block">CLASSIFICATION</span>
            <span className="text-[#00C2FF] font-semibold">{TARGET_VEHICLE.type.split(' ')[0]}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block">EST. SPEED</span>
            <span className="text-slate-200 font-semibold">{TARGET_VEHICLE.speed}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block">SECTOR</span>
            <span className="text-slate-200 font-semibold">SEC-04 TRANSIT</span>
          </div>
        </div>
      </div>

      {/* Floating Side Telemetry Pill */}
      <div className="absolute right-8 top-1/3 hidden lg:flex flex-col gap-2 p-3 bg-[#0D1B2A]/80 hud-border text-xs max-w-xs">
        <div className="text-[10px] text-[#7DD3FC] tracking-widest uppercase border-b border-[#00C2FF]/20 pb-1">
          AI OPTICAL INFERENCE
        </div>
        <div className="text-[11px] text-slate-300">
          Neural model localized bounding coordinates in CAM-DEMO-07 field of view.
        </div>
        <div className="text-[9px] text-[#00C2FF] tracking-widest">
          STATUS: EXTRACTING ANPR REGION...
        </div>
      </div>
    </div>
  );
};
