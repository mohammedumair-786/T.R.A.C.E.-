import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING CORE ENGINE...');

  useEffect(() => {
    const steps = [
      { at: 15, text: 'ALLOCATING PROCEDURAL GEOMETRY...' },
      { at: 35, text: 'MAPPING 24-NODE CAMERA GRID...' },
      { at: 60, text: 'CALIBRATING CCTV OPTICS & TELEMETRY...' },
      { at: 85, text: 'LOADING ANPR RECOGNITION VECTORS...' },
      { at: 100, text: 'SYSTEM ONLINE. READY FOR ACCESS.' },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        const currentStep = steps.find((s) => next >= s.at && prev < s.at);
        if (currentStep) {
          setStatusText(currentStep.text);
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return 100;
        }
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Generate block progress string: ████████░░
  const totalBlocks = 20;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);
  const blockString = '█'.repeat(filledBlocks) + '░'.repeat(Math.max(0, totalBlocks - filledBlocks));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050816] bg-tech-grid text-slate-100 font-mono select-none px-6"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      >
        {/* Subtle Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md p-8 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan">
          {/* Top Identifier */}
          <div className="flex items-center justify-between border-b border-accent-cyan/20 pb-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-ping" />
              <span className="text-xs tracking-widest text-[#7DD3FC]">SYSTEM BOOT</span>
            </div>
            <span className="text-xs text-slate-400">V4.8.2-SECURE</span>
          </div>

          {/* Main Brand */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-[0.25em] text-white text-glow-cyan">
              T.R.A.C.E.
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-[#00C2FF] uppercase mt-1">
              Trajectory Reconstruction &amp; Automated Citywide Engine
            </p>
          </div>

          {/* Custom Reticle Loader */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#00C2FF]/40 animate-[spin_8s_linear_infinite]" />
              {/* Inner counter-rotating ring */}
              <div className="absolute inset-2 rounded-full border-2 border-t-[#00C2FF] border-r-transparent border-b-[#2563EB] border-l-transparent animate-[spin_3s_linear_infinite_reverse]" />
              {/* Center percentage */}
              <span className="text-sm font-bold text-[#7DD3FC]">{progress}%</span>
            </div>
          </div>

          {/* Text Status */}
          <div className="mb-4">
            <div className="text-[11px] text-slate-400 mb-1 flex justify-between">
              <span>LOADING ENVIRONMENT</span>
              <span className="text-[#00C2FF] font-semibold">{progress}%</span>
            </div>
            {/* Block Progress Bar */}
            <div className="text-xs tracking-wider text-[#00C2FF] font-mono select-none overflow-hidden text-center bg-[#081426] py-1.5 px-2 border border-accent-cyan/20 rounded">
              {blockString}
            </div>
          </div>

          {/* Live Diagnostic Feed */}
          <div className="text-[10px] text-slate-400 tracking-wider h-4 overflow-hidden truncate">
            &gt; {statusText}
          </div>

          {/* Bottom Security Classification */}
          <div className="mt-6 pt-3 border-t border-accent-cyan/10 flex justify-between items-center text-[9px] text-slate-500 tracking-widest uppercase">
            <span>HACKATHON SIMULATION</span>
            <span>DEMO PROTOCOL</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
