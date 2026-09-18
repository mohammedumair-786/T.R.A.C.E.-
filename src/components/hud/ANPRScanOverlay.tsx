import React, { useState, useEffect } from 'react';
import { TARGET_VEHICLE } from '../../utils/mockData';
import { CheckCircle2, ScanLine } from 'lucide-react';

interface ANPRScanOverlayProps {
  scrollProgress: number;
}

export const ANPRScanOverlay: React.FC<ANPRScanOverlayProps> = ({ scrollProgress }) => {
  // Active during ANPR phase (0.68 to 0.82)
  const isVisible = scrollProgress >= 0.68 && scrollProgress <= 0.82;
  const [scramblePlate, setScramblePlate] = useState('.. .. ....');
  const [isLocked, setIsLocked] = useState(false);

  // Scramble / Plate decryption effect
  useEffect(() => {
    if (!isVisible) {
      setIsLocked(false);
      setScramblePlate('.. .. ....');
      return;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let iteration = 0;
    const target = TARGET_VEHICLE.plate;

    const interval = setInterval(() => {
      setScramblePlate(
        target
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return target[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= target.length) {
        clearInterval(interval);
        setIsLocked(true);
      }
      iteration += 1 / 2;
    }, 45);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center font-mono select-none px-4">
      <div className="relative w-[320px] sm:w-[380px] p-5 bg-[#0D1B2A]/90 border border-[#00C2FF]/70 shadow-glow-cyan-lg corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00C2FF]/30 pb-2">
          <div className="flex items-center gap-2">
            <ScanLine size={16} className="text-[#00C2FF] animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-[#7DD3FC]">
              PLATE LOCALIZATION
            </span>
          </div>
          <span className="text-[10px] text-slate-400">CAM-DEMO-07</span>
        </div>

        {/* License Plate Display Frame */}
        <div className="relative bg-[#050816] p-4 border border-[#00C2FF]/40 rounded text-center overflow-hidden">
          {/* Cyan Scan Line across plate */}
          <div className="absolute inset-x-0 top-0 h-1 bg-[#00C2FF] opacity-75 shadow-[0_0_8px_#00C2FF] animate-scanline" />

          <div className="text-[9px] tracking-widest text-slate-400 mb-1">
            ANPR SCANNER ACTIVE
          </div>

          <div className="text-2xl sm:text-3xl font-bold tracking-[0.2em] text-white text-glow-cyan">
            {scramblePlate}
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-300">
            <span>CONFIDENCE:</span>
            <span className="text-[#00C2FF] font-bold">{TARGET_VEHICLE.confidence}%</span>
          </div>
        </div>

        {/* Status Confirmation */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5">
            {isLocked ? (
              <>
                <CheckCircle2 size={14} className="text-[#22C55E]" />
                <span className="text-[#22C55E] font-bold tracking-wider">MATCH CONFIRMED</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-ping" />
                <span className="text-[#7DD3FC] tracking-wider">READING PLATE DATA...</span>
              </>
            )}
          </div>
          <span className="text-[9px] text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
            DEMO VISUALIZATION
          </span>
        </div>
      </div>
    </div>
  );
};
