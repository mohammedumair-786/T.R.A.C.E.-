import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ShieldCheck, Cpu, Radio } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore }) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20 pb-16 pointer-events-none select-none">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Technical Status Badges */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 text-[10px] sm:text-xs font-mono text-[#7DD3FC]"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D1B2A]/70 border border-[#00C2FF]/30 rounded">
            <Radio size={12} className="text-[#00C2FF] animate-pulse" />
            <span>CAMERA NETWORK: ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D1B2A]/70 border border-[#00C2FF]/30 rounded">
            <Cpu size={12} className="text-[#2563EB]" />
            <span>ACTIVE NODES: 24</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D1B2A]/70 border border-[#00C2FF]/30 rounded">
            <ShieldCheck size={12} className="text-[#22C55E]" />
            <span>DATA STREAM: ACTIVE</span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-[0.25em] font-mono text-white text-glow-cyan drop-shadow-2xl"
        >
          T.R.A.C.E.
        </motion.h1>

        {/* Sub-Title */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-sm sm:text-lg md:text-xl font-mono tracking-[0.3em] sm:tracking-[0.4em] text-[#00C2FF] font-semibold uppercase mt-4 mb-6"
        >
          Trajectory Reconstruction &amp; Automated Citywide Engine
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed mb-10 font-sans"
        >
          AI-powered multi-camera vehicle trajectory reconstruction and urban traffic intelligence.
          Synchronizing citywide optical nodes into a unified neural tracking mesh.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="pointer-events-auto"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onExplore}
            icon={<ChevronDown size={18} className="animate-bounce text-[#00C2FF]" />}
          >
            ENTER SYSTEM
          </Button>
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10px] tracking-widest text-slate-400"
      >
        <span>SCROLL TO TRAVERSE ENGINE</span>
        <div className="w-4 h-8 rounded-full border border-slate-600 flex justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
};
