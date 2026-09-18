import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { MOCK_METRICS } from '../../utils/mockData';

export const UrbanIntelligenceSection: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center px-6 py-24 pointer-events-none select-none">
      <div className="max-w-xl mx-auto lg:ml-20">
        <GlassCard className="p-6 sm:p-8 font-mono">
          <div className="flex items-center gap-2 text-xs tracking-widest text-[#00C2FF] mb-2">
            <BarChart3 size={16} />
            <span>CITYWIDE ANALYTICS MATRIX</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-white text-glow-cyan mb-2">
            URBAN MOVEMENT INTELLIGENCE
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
            Individual vehicle trajectories aggregate into citywide macro-flow patterns. 
            Predictive congestion modelling and anomaly mitigation activate in real time.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#00C2FF]/20 pt-4 text-xs">
            <div>
              <span className="text-[9px] text-slate-400 block">TOTAL VEHICLES</span>
              <span className="text-lg font-bold text-white">
                {MOCK_METRICS.vehiclesAnalyzed.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">PEAK WINDOW</span>
              <span className="text-lg font-bold text-[#7DD3FC]">
                {MOCK_METRICS.peakTrafficWindow}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[9px] text-slate-400 block">CONGESTION LEVEL</span>
              <span className="text-lg font-bold text-[#00C2FF]">
                {MOCK_METRICS.congestionIndex}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};
