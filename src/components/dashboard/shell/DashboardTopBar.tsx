import React, { useState, useEffect } from 'react';
import { Bell, User, Clock, ShieldCheck, LogOut, CheckCircle2, ChevronDown } from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';

interface DashboardTopBarProps {
  collapsed: boolean;
  onLogout: () => void;
}

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({ collapsed, onLogout }) => {
  const { currentView, alerts, acknowledgeAlert } = useDashboard();
  const [currentTime, setCurrentTime] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadAlerts = alerts.filter((a) => a.status === 'NEW');

  const viewTitles: Record<string, string> = {
    overview: 'OVERVIEW // CITY INTELLIGENCE COCKPIT',
    'live-map': 'LIVE MAP // 24-NODE SURVEILLANCE MESH',
    cameras: 'CAMERA NETWORK // HARDWARE TELEMETRY',
    trajectories: 'TRAJECTORIES // MULTI-CAMERA RECONSTRUCTION',
    alerts: 'INCIDENT ALERTS // REAL-TIME DISPATCH',
    analytics: 'ANALYTICS // URBAN MOVEMENT TRENDS',
    settings: 'SETTINGS // SYSTEM & OPERATOR PROFILE',
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#050816]/90 border-b border-[#00C2FF]/15 backdrop-blur-md z-20 flex items-center justify-between px-6 transition-all duration-300 font-mono ${
        collapsed ? 'left-16' : 'left-64'
      }`}
    >
      {/* Left: Breadcrumb / View Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xs sm:text-sm font-bold tracking-[0.2em] text-white text-glow-cyan uppercase">
          {viewTitles[currentView] || 'COMMAND SYSTEM'}
        </h1>
      </div>

      {/* Right: Telemetry, Clock, Notifications & Profile */}
      <div className="flex items-center gap-4 text-xs">
        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0D1B2A] border border-[#00C2FF]/30">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[10px] tracking-widest text-slate-300">
            SYSTEM STATUS · <span className="text-[#22C55E] font-semibold">ONLINE</span>
          </span>
        </div>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs tracking-wider">
          <Clock size={13} className="text-[#00C2FF]" />
          <span>{currentTime}</span>
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded bg-[#0D1B2A] border border-[#00C2FF]/20 text-slate-300 hover:text-[#00C2FF] hover:border-[#00C2FF] transition-colors"
          >
            <Bell size={16} />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3B4E] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-[#0D1B2A] hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan p-3 space-y-2 z-50">
              <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-2">
                <span className="text-xs font-bold text-white tracking-wider">LIVE ALERTS FEED</span>
                <span className="text-[9px] text-[#00C2FF] font-semibold">{unreadAlerts.length} UNACKNOWLEDGED</span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 py-1">
                {alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2 rounded bg-[#081426] border border-slate-700/60 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${alert.severity === 'CRITICAL' ? 'text-[#FF3B4E]' : alert.severity === 'WARNING' ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
                        {alert.title}
                      </span>
                      <span className="text-[9px] text-slate-500">{alert.timestamp}</span>
                    </div>
                    <div className="text-slate-400 text-[10px] truncate">{alert.message}</div>
                    {alert.status === 'NEW' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-[9px] text-[#00C2FF] hover:underline"
                      >
                        ACKNOWLEDGE
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Officer Avatar / Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded bg-[#0D1B2A] border border-[#00C2FF]/30 hover:border-[#00C2FF] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF] flex items-center justify-center text-[#00C2FF]">
              <User size={13} />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[11px] font-bold text-white leading-none">OFFICER K</span>
              <span className="text-[8px] text-[#7DD3FC] tracking-widest leading-none mt-0.5">LEVEL 4 CLEARANCE</span>
            </div>
            <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Menu Popover */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-56 bg-[#0D1B2A] hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan p-3 z-50 space-y-2">
              <div className="border-b border-[#00C2FF]/20 pb-2">
                <div className="text-xs font-bold text-white">OFFICER K // TR-9042</div>
                <div className="text-[10px] text-slate-400">Urban Intelligence Division</div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 p-1.5 rounded text-xs text-[#FF3B4E] hover:bg-[#FF3B4E]/10 transition-colors"
              >
                <LogOut size={13} />
                <span>TERMINATE SESSION</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
