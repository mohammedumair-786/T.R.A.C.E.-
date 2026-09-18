import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Sliders,
  Cpu,
  CheckCircle2,
  Lock,
  Radio,
  LogOut,
  Moon,
  Volume2
} from 'lucide-react';
import { Button } from '../../ui/Button';

interface SettingsViewProps {
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => {
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyCongestion, setNotifyCongestion] = useState(true);
  const [notifyAnpr, setNotifyAnpr] = useState(false);
  const [audioAlarms, setAudioAlarms] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSave = () => {
    setSaveNotice('OPERATOR CONFIGURATION PERSISTED TO LOCAL STORAGE');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="space-y-6 font-mono select-none max-w-5xl">
      {/* Officer Profile Dossier Card */}
      <div className="p-6 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br space-y-4">
        <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/40 flex items-center justify-center text-[#00C2FF]">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wider">
                OFFICER K // TR-9042
              </h2>
              <span className="text-[10px] text-[#7DD3FC]">
                CLEARANCE LEVEL 4 · CHIEF SURVEILLANCE CONTROLLER
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] font-bold">
            AUTHENTICATED SESSION
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[9px] text-slate-500 block">DEPARTMENT</span>
            <span className="text-slate-200">Urban Traffic Intelligence</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block">ASSIGNED JURISDICTION</span>
            <span className="text-slate-200">Metropolitan Sector 04-12</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block">SESSION PROTOCOL</span>
            <span className="text-[#00C2FF]">TLS 1.3 / ECDHE-RSA</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Notifications & Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Preferences */}
        <div className="p-6 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-br space-y-4">
          <div className="flex items-center gap-2 border-b border-[#00C2FF]/20 pb-3">
            <Bell size={16} className="text-[#00C2FF]" />
            <h3 className="text-sm font-bold text-white tracking-wider">
              NOTIFICATION CHANNELS
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">Critical Incident Priority</span>
                <span className="text-[10px] text-slate-400">Push high-priority alerts with HUD overlay</span>
              </div>
              <button
                onClick={() => setNotifyCritical(!notifyCritical)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  notifyCritical ? 'bg-[#00C2FF]' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notifyCritical ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">Congestion Threshold Alerts</span>
                <span className="text-[10px] text-slate-400">Alert when sector exceeds 75% capacity</span>
              </div>
              <button
                onClick={() => setNotifyCongestion(!notifyCongestion)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  notifyCongestion ? 'bg-[#00C2FF]' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notifyCongestion ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">ANPR Hotlist Watch Matches</span>
                <span className="text-[10px] text-slate-400">Notify immediately on flag match</span>
              </div>
              <button
                onClick={() => setNotifyAnpr(!notifyAnpr)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  notifyAnpr ? 'bg-[#00C2FF]' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notifyAnpr ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">Audio Radar Beacon Chirp</span>
                <span className="text-[10px] text-slate-400">Auditory feedback on target lock</span>
              </div>
              <button
                onClick={() => setAudioAlarms(!audioAlarms)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  audioAlarms ? 'bg-[#00C2FF]' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    audioAlarms ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Display & Environment Preferences */}
        <div className="p-6 bg-[#0D1B2A]/90 hud-border corner-bracket-tr corner-bracket-bl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#00C2FF]/20 pb-3">
            <Sliders size={16} className="text-[#00C2FF]" />
            <h3 className="text-sm font-bold text-white tracking-wider">
              DISPLAY &amp; RUNTIME
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">Tactical Theme</span>
                <span className="text-[10px] text-slate-400">Deep Space Navy (Standard Government Cockpit)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-[#081426] border border-slate-700 text-slate-500 rounded">
                FIXED DARK
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">High Contrast Reticles</span>
                <span className="text-[10px] text-slate-400">Enhance HUD borders and telemetry text</span>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  highContrast ? 'bg-[#00C2FF]' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">Light Theme Switcher</span>
                <span className="text-[10px] text-slate-400">High-illuminance outdoor mode</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-[#081426] border border-slate-700 text-slate-500 rounded">
                COMING SOON
              </span>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                className="w-full"
              >
                SAVE PREFERENCES
              </Button>
            </div>

            {saveNotice && (
              <div className="p-2 rounded bg-[#22C55E]/10 border border-[#22C55E]/40 text-[10px] text-[#22C55E] flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>{saveNotice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Diagnostics & Simulated Hardware Mesh */}
      <div className="p-6 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br space-y-4">
        <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-3">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-[#00C2FF]" />
            <h3 className="text-sm font-bold text-white tracking-wider">
              SYSTEM DIAGNOSTICS &amp; CONNECTIVITY
            </h3>
          </div>
          <span className="text-[10px] text-[#22C55E] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            SYNCHRONIZED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[9px] text-slate-500 block">CORE BUILD</span>
            <span className="text-white font-bold">V4.8.2-HACKATHON</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block">WEBSOCKET BRIDGE</span>
            <span className="text-[#22C55E] font-bold">SIMULATED (12ms)</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block">LOCAL DATABASE</span>
            <span className="text-white font-bold">INDEXEDDB ACTIVE</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block">ENCRYPTION CIPHER</span>
            <span className="text-slate-300 font-bold">AES-256-GCM</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#00C2FF]/15 flex items-center justify-between">
          <span className="text-[9px] text-slate-500">
            SESSION ID: 98D54B54-DA65-4D8E-ABC2-CE0C602DC7EE
          </span>

          <Button
            variant="danger"
            size="sm"
            onClick={onLogout}
            icon={<LogOut size={13} />}
          >
            TERMINATE SESSION
          </Button>
        </div>
      </div>
    </div>
  );
};
