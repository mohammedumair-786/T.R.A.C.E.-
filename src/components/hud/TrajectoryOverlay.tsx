import React from 'react';
import { TRAJECTORY_SEQUENCE } from '../../utils/mockData';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface TrajectoryOverlayProps {
  scrollProgress: number;
}

export const TrajectoryOverlay: React.FC<TrajectoryOverlayProps> = ({ scrollProgress }) => {
  // Visible during multi-camera trajectory reconstruction (0.76 to 0.94)
  const isVisible = scrollProgress >= 0.76 && scrollProgress <= 0.94;

  if (!isVisible) return null;

  // Reconstructed sequence progress: 0 to 5 cameras
  const activeCount = Math.min(
    TRAJECTORY_SEQUENCE.length,
    Math.max(1, Math.floor(((scrollProgress - 0.76) / 0.14) * (TRAJECTORY_SEQUENCE.length + 1)))
  );

  return (
    <div className="fixed bottom-10 left-6 right-6 lg:left-auto lg:right-10 lg:bottom-10 z-30 pointer-events-none font-mono select-none">
      <div className="w-full max-w-lg bg-[#0D1B2A]/90 p-5 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan flex flex-col gap-4">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-[#00C2FF]/30 pb-2">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#7DD3FC]">
              TRAJECTORY RECONSTRUCTED
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider">
              MULTI-CAMERA ANALYSIS COMPLETE
            </div>
          </div>
          <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
            <CheckCircle2 size={13} />
            SYNCHRONIZED
          </span>
        </div>

        {/* Sequential Camera Path */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
          {TRAJECTORY_SEQUENCE.map((cam, idx) => {
            const isDone = idx < activeCount;
            return (
              <React.Fragment key={cam.nodeId}>
                <div
                  className={`flex flex-col p-2 rounded border transition-all text-center min-w-[70px] ${
                    isDone
                      ? 'bg-[#00C2FF]/15 border-[#00C2FF] text-white shadow-glow-cyan'
                      : 'bg-[#081426] border-slate-700/60 text-slate-500 opacity-50'
                  }`}
                >
                  <span className="text-[10px] font-bold">{cam.cameraName.replace('CAM-DEMO-', 'CAM-')}</span>
                  <span className="text-[8px] text-slate-400 mt-0.5">{cam.speedKmh} km/h</span>
                </div>
                {idx < TRAJECTORY_SEQUENCE.length - 1 && (
                  <ArrowRight
                    size={14}
                    className={idx < activeCount - 1 ? 'text-[#00C2FF]' : 'text-slate-700'}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Reconstructed Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#00C2FF]/15 text-[10px]">
          <div>
            <span className="text-slate-400 block text-[9px]">TOTAL DISTANCE</span>
            <span className="text-slate-100 font-semibold">1.84 KM</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px]">AVG VELOCITY</span>
            <span className="text-slate-100 font-semibold">44.9 KM/H</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px]">CONFIDENCE</span>
            <span className="text-[#00C2FF] font-semibold">97.8% COMPOSITE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
