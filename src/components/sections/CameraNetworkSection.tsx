import React from 'react';
import { Network, Activity } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const CameraNetworkSection: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center px-6 py-24 pointer-events-none select-none">
      <div className="max-w-xl mx-auto lg:ml-20">
        <GlassCard className="p-6 sm:p-8 font-mono">
          <div className="flex items-center gap-2 text-[#00C2FF] text-xs tracking-widest mb-2">
            <Network size={16} />
            <span>OPTICAL SURVEILLANCE MESH</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-white text-glow-cyan mb-2">
            MULTI-CAMERA NETWORK
          </h2>

          <h3 className="text-xs sm:text-sm tracking-widest text-[#7DD3FC] uppercase mb-4">
            DISTRIBUTED TRAFFIC INTELLIGENCE
          </h3>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
            Continuous cross-camera correlation tracks vehicle journeys across complex urban topography. 
            Nodes transmit edge-inferred vector metadata to eliminate visual blindspots.
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-[#00C2FF]/20 pt-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block tracking-wider">ACTIVE NODES</span>
              <span className="text-xl font-bold text-white">24 ACTIVE</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block tracking-wider">COVERAGE FIELD</span>
              <span className="text-xl font-bold text-[#00C2FF]">360° MESH</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};
