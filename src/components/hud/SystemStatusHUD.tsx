import React from 'react';
import { MOCK_METRICS } from '../../utils/mockData';

interface SystemStatusHUDProps {
  scrollProgress: number;
}

export const SystemStatusHUD: React.FC<SystemStatusHUDProps> = ({ scrollProgress }) => {
  // Visible during hero and early city overview
  const isVisible = scrollProgress < 0.28 || scrollProgress > 0.88;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-30 hidden sm:flex flex-col gap-3 font-mono pointer-events-none select-none">
      <div className="hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br p-3.5 flex flex-col gap-2 min-w-[220px]">
        <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-1.5">
          <span className="text-[10px] tracking-widest text-[#7DD3FC] uppercase">SYSTEM STATUS</span>
          <span className="text-[10px] font-bold text-[#22C55E] tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            ONLINE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">ACTIVE NODES</div>
            <div className="text-base font-bold text-white tracking-wide">
              {MOCK_METRICS.activeCameraNodes}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">VEHICLES ANALYZED</div>
            <div className="text-base font-bold text-[#00C2FF] tracking-wide">
              {MOCK_METRICS.vehiclesAnalyzed.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">ACTIVE ALERTS</div>
            <div className="text-base font-bold text-[#F59E0B] tracking-wide">
              0{MOCK_METRICS.activeAlerts}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">LATENCY</div>
            <div className="text-base font-bold text-slate-300 tracking-wide">
              {MOCK_METRICS.networkLatency}ms
            </div>
          </div>
        </div>

        <div className="border-t border-[#00C2FF]/10 pt-1 text-[8px] text-slate-500 tracking-widest uppercase">
          SIMULATED DEMO TELEMETRY
        </div>
      </div>
    </div>
  );
};
