import React from 'react';
import { Eye, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

export const CCTVTrackingSection: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-end px-6 py-24 pointer-events-none select-none">
      <div className="max-w-xl mx-auto lg:mr-20">
        <GlassCard className="p-6 sm:p-8 font-mono">
          <div className="flex items-center justify-between mb-3 border-b border-[#00C2FF]/20 pb-2">
            <div className="flex items-center gap-2 text-xs tracking-widest text-[#7DD3FC]">
              <Eye size={16} className="text-[#00C2FF]" />
              <span>PRIMARY INTERCEPTOR NODE</span>
            </div>
            <Badge status="ACTIVE" label="LIVE FEED" size="sm" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-white text-glow-cyan mb-1">
            CAM-DEMO-07
          </h2>

          <div className="text-xs tracking-widest text-[#00C2FF] mb-4">
            MAIN TRANSIT CORRIDOR // SECTOR 04
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
            High-speed optical turret locked on approaching vehicle. 
            Automated gimbal tracking continuously adjusts pan/tilt orientation to maintain optimal target focal plane.
          </p>

          <div className="bg-[#050816]/70 p-3 rounded border border-slate-700/60 text-xs flex justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block">OPTICAL RESOLUTION</span>
              <span className="font-semibold text-white">4K ULTRA HD @ 60 FPS</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">TARGET LOCK</span>
              <span className="font-semibold text-[#22C55E]">ACQUIRED (99.2%)</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};
