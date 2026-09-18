import React from 'react';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { SYSTEM_ALERTS } from '../../utils/mockData';

interface AlertBannerProps {
  scrollProgress: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ scrollProgress }) => {
  // Visible during Alert sequence (0.86 to 0.96)
  const isVisible = scrollProgress >= 0.86 && scrollProgress <= 0.96;

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-6 z-30 pointer-events-none font-mono select-none flex flex-col gap-3 max-w-sm">
      {/* Warning Alert (Orange #F59E0B) */}
      <div className="p-3.5 bg-[#0D1B2A]/90 border border-[#F59E0B]/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded corner-bracket-tl corner-bracket-tr flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#F59E0B]" />
            <span className="text-xs font-bold tracking-widest text-[#F59E0B]">
              {SYSTEM_ALERTS[0].title}
            </span>
          </div>
          <span className="text-[9px] bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded font-bold">
            {SYSTEM_ALERTS[0].priority}
          </span>
        </div>
        <div className="text-[10px] text-slate-300">
          {SYSTEM_ALERTS[0].message}
        </div>
        <div className="text-[9px] text-slate-400">
          NODE: <span className="text-white">{SYSTEM_ALERTS[0].camera}</span> // SECTOR: {SYSTEM_ALERTS[0].sector}
        </div>
      </div>

      {/* Critical System Alert (Controlled Red #FF3B4E) */}
      <div className="p-3 bg-[#0D1B2A]/90 border border-[#FF3B4E]/60 shadow-[0_0_15px_rgba(255,59,78,0.2)] rounded corner-bracket-bl corner-bracket-br flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon size={14} className="text-[#FF3B4E]" />
            <span className="text-xs font-bold tracking-widest text-[#FF3B4E]">
              {SYSTEM_ALERTS[1].title}
            </span>
          </div>
          <span className="text-[9px] bg-[#FF3B4E]/20 text-[#FF3B4E] px-1.5 py-0.5 rounded font-bold">
            {SYSTEM_ALERTS[1].priority}
          </span>
        </div>
        <div className="text-[10px] text-slate-300">
          {SYSTEM_ALERTS[1].message}
        </div>
      </div>
    </div>
  );
};
