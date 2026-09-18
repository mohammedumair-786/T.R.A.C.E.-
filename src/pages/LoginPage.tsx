import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, KeyRound, User, Lock, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LoginPageProps {
  onBackToLanding: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding, onLoginSuccess }) => {
  const [officerId, setOfficerId] = useState('officer.k@trace.gov');
  const [password, setPassword] = useState('••••••••••••');
  const [authStep, setAuthStep] = useState<'idle' | 'authenticating' | 'verifying' | 'granted'>('idle');

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (authStep !== 'idle') return;

    // Simulated Authentication Sequence
    setAuthStep('authenticating');
    setTimeout(() => {
      setAuthStep('verifying');
      setTimeout(() => {
        setAuthStep('granted');
        setTimeout(() => {
          onLoginSuccess();
        }, 1100);
      }, 900);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#050816] bg-tech-grid flex flex-col justify-between items-center p-6 text-slate-100 font-mono relative overflow-hidden select-none">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between border-b border-[#00C2FF]/20 pb-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-[#00C2FF] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO RECONSTRUCTION ENGINE</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#7DD3FC]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span>GATEWAY: TERMINAL-01</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#0D1B2A]/85 p-8 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan"
        >
          {/* Terminal Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/30 text-[#00C2FF] mb-3">
              <Shield size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.2em] text-white text-glow-cyan">
              T.R.A.C.E.
            </h1>
            <div className="text-xs tracking-[0.25em] text-[#7DD3FC] uppercase font-semibold mt-1">
              SECURE OFFICER ACCESS
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase mt-2">
              AUTHORIZED PERSONNEL AUTHENTICATION REQUIRED
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthenticate} className="flex flex-col gap-5">
            {/* Field 1: Officer ID */}
            <div>
              <label className="block text-[10px] tracking-widest text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                <User size={12} className="text-[#00C2FF]" />
                <span>OFFICER EMAIL / ID</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  disabled={authStep !== 'idle'}
                  className="w-full bg-[#050816] border border-[#00C2FF]/30 focus:border-[#00C2FF] rounded px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00C2FF] font-mono tracking-wider transition-all"
                  placeholder="officer.k@trace.gov"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <label className="block text-[10px] tracking-widest text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                <Lock size={12} className="text-[#00C2FF]" />
                <span>SECURITY CIPHER / PASSWORD</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authStep !== 'idle'}
                  className="w-full bg-[#050816] border border-[#00C2FF]/30 focus:border-[#00C2FF] rounded px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00C2FF] font-mono tracking-wider transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Status Simulation Feedback */}
            {authStep !== 'idle' && (
              <div className="py-2 text-center text-xs tracking-wider flex items-center justify-center gap-2">
                {authStep === 'authenticating' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-ping" />
                    <span className="text-[#7DD3FC]">AUTHENTICATING...</span>
                  </>
                )}
                {authStep === 'verifying' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
                    <span className="text-[#00C2FF]">VERIFYING ACCESS...</span>
                  </>
                )}
                {authStep === 'granted' && (
                  <>
                    <CheckCircle2 size={16} className="text-[#22C55E]" />
                    <span className="text-[#22C55E] font-bold">ACCESS GRANTED · LAUNCHING COCKPIT...</span>
                  </>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={authStep !== 'idle'}
              className="w-full mt-2"
              icon={<KeyRound size={16} className="text-[#00C2FF]" />}
            >
              {authStep === 'idle' ? 'AUTHENTICATE' : 'INITIALIZING SESSION...'}
            </Button>
          </form>

          {/* Quick Direct Bypass for Demo Reviewers */}
          <div className="mt-4 pt-3 border-t border-[#00C2FF]/10 text-center">
            <button
              type="button"
              onClick={onLoginSuccess}
              className="text-[10px] text-[#7DD3FC] hover:text-[#00C2FF] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <span>DIRECT ACCESS TO COMMAND DASHBOARD</span>
              <ArrowRight size={11} />
            </button>
          </div>

          {/* Bottom Security Classification */}
          <div className="mt-6 pt-3 border-t border-[#00C2FF]/15 flex items-center justify-between text-[9px] text-slate-500 tracking-widest uppercase">
            <span>SECURE SYSTEM</span>
            <span>AUTHORIZED ACCESS ONLY</span>
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-5xl border-t border-[#00C2FF]/10 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 tracking-wider">
        <span>T.R.A.C.E. HACKATHON PROTOCOL</span>
        <span>DEMO AUTHENTICATION // ALL DATA SIMULATED</span>
      </footer>
    </div>
  );
};
