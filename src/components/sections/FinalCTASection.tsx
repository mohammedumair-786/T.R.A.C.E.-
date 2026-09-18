import React from 'react';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { MOCK_METRICS } from '../../utils/mockData';

interface FinalCTASectionProps {
  onEnterCommand: () => void;
  isWarping: boolean;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onEnterCommand, isWarping }) => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 py-24 select-none">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0D1B2A]/80 border border-[#00C2FF]/40 rounded text-xs font-mono text-[#00C2FF] tracking-widest uppercase mb-4">
          <Sparkles size={14} className="animate-pulse" />
          <span>SYNCHRONIZED CITYWIDE MESH</span>
        </div>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[0.2em] font-mono text-white text-glow-cyan mb-4">
          T.R.A.C.E.
        </h2>

        <h3 className="text-sm sm:text-lg font-mono tracking-[0.3em] text-[#7DD3FC] uppercase font-semibold mb-8">
          CITYWIDE TRAFFIC INTELLIGENCE
        </h3>

        {/* High-level system statistics ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full p-4 mb-10 bg-[#0D1B2A]/80 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br font-mono text-xs text-left">
          <div>
            <span className="text-[9px] text-slate-400 block">CAMERA NODES</span>
            <span className="text-base font-bold text-white">{MOCK_METRICS.activeCameraNodes} NODES</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block">VEHICLES ANALYZED</span>
            <span className="text-base font-bold text-[#00C2FF]">12,486</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block">ACTIVE ALERTS</span>
            <span className="text-base font-bold text-[#F59E0B]">08 ACTIVE</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block">SYSTEM STATUS</span>
            <span className="text-base font-bold text-[#22C55E]">ONLINE</span>
          </div>
        </div>

        {/* Final CTA triggering Hyperspace Warp */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="primary"
            size="lg"
            disabled={isWarping}
            onClick={onEnterCommand}
            className="text-base sm:text-lg px-8 sm:px-12 py-4 shadow-glow-cyan-lg"
            icon={<Shield size={18} className="text-[#00C2FF]" />}
          >
            {isWarping ? 'WARPING TO COMMAND...' : 'ENTER THE COMMAND SYSTEM'}
          </Button>
          <span className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase mt-1">
            AUTHORIZED PERSONNEL ONLY
          </span>
        </div>
      </div>
    </section>
  );
};
