import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Shield, Terminal } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderNavProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onEnterCommand: () => void;
  scrollProgress: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  isMuted,
  onToggleMute,
  onEnterCommand,
  scrollProgress
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between border-b border-[#00C2FF]/15 bg-[#050816]/70 backdrop-blur-md">
      {/* Brand Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-3 h-3 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[#00C2FF] animate-ping opacity-75" />
            <span className="w-2 h-2 rounded-full bg-[#00C2FF]" />
          </div>
          <span className="text-xl font-bold tracking-[0.2em] font-mono text-white text-glow-cyan">
            T.R.A.C.E.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-700/60 text-[11px] font-mono text-slate-400 tracking-wider">
          <span className="text-[#00C2FF]">CIVIC ENGINE</span>
          <span>//</span>
          <span>SYS.ONLINE</span>
        </div>
      </div>

      {/* Middle Telemetry / Time */}
      <div className="hidden lg:flex items-center gap-6 font-mono text-xs tracking-widest text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span>MESH: 24/24 NODES</span>
        </div>
        <div>TIME: <span className="text-slate-200">{currentTime}</span></div>
        <div>
          PROGRESS: <span className="text-[#00C2FF] font-semibold">{Math.round(scrollProgress * 100)}%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Audio Synthesizer Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? "Enable Synthetic Audio" : "Mute Synthetic Audio"}
          className="p-2 rounded bg-[#0D1B2A]/80 border border-[#00C2FF]/30 text-slate-300 hover:text-[#00C2FF] hover:border-[#00C2FF] transition-colors"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-[#00C2FF]" />}
        </button>

        {/* Command Access Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onEnterCommand}
          icon={<Shield size={14} className="text-[#00C2FF]" />}
        >
          <span className="hidden sm:inline">OFFICER </span>ACCESS
        </Button>
      </div>

      {/* Thin Bottom Scroll Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#00C2FF] to-[#7DD3FC] transition-all duration-150"
        style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
      />
    </header>
  );
};
