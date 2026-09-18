import React from 'react';
import {
  LayoutDashboard,
  Map,
  Camera,
  Route,
  AlertTriangle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Globe
} from 'lucide-react';
import { useDashboard, DashboardViewType } from '../../../context/DashboardContext';
import { GlowingDivider } from '../common/GlowingDivider';

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onExitToLanding: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onExitToLanding
}) => {
  const { currentView, setCurrentView, kpiData } = useDashboard();

  const primaryNavItems: { id: DashboardViewType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'OVERVIEW', icon: <LayoutDashboard size={18} /> },
    { id: 'live-map', label: 'LIVE MAP', icon: <Map size={18} /> },
    { id: 'cameras', label: 'CAMERA NETWORK', icon: <Camera size={18} />, badge: 24 },
    { id: 'trajectories', label: 'TRAJECTORIES', icon: <Route size={18} /> },
    { id: 'alerts', label: 'ALERTS', icon: <AlertTriangle size={18} />, badge: kpiData.activeAlerts },
    { id: 'analytics', label: 'ANALYTICS', icon: <BarChart3 size={18} /> },
  ];

  const secondaryNavItems: { id: DashboardViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'settings', label: 'SETTINGS', icon: <Settings size={18} /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-[#081426]/95 border-r border-[#00C2FF]/20 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 select-none font-mono ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-[#00C2FF]/15 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-7 h-7 rounded-md bg-[#0D1B2A] border border-[#00C2FF]/40 flex items-center justify-center text-[#00C2FF] flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-[0.2em] text-white text-glow-cyan leading-tight">
                  T.R.A.C.E.
                </span>
                <span className="text-[9px] text-[#7DD3FC] tracking-widest uppercase">
                  COMMAND SYSTEM
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Navigation Section */}
        <div className="py-4 px-2 space-y-1">
          <div className={`px-2 mb-2 text-[9px] text-slate-500 tracking-widest uppercase ${collapsed ? 'hidden' : 'block'}`}>
            CORE OPERATING MATRIX
          </div>

          {primaryNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-all relative group ${
                  isActive
                    ? 'bg-[#00C2FF]/10 text-white font-semibold border-l-2 border-[#00C2FF] shadow-[inset_0_0_12px_rgba(0,194,255,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1B2A]/50 border-l-2 border-transparent'
                }`}
              >
                <span className={`${isActive ? 'text-[#00C2FF]' : 'text-slate-400 group-hover:text-[#00C2FF]'}`}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="flex-1 text-left tracking-wider truncate">
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      item.id === 'alerts' && item.badge > 0
                        ? 'bg-[#FF3B4E]/20 text-[#FF3B4E] border border-[#FF3B4E]/40'
                        : 'bg-[#081426] text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Glowing Divider Line (fading at both ends) */}
        <div className="px-3">
          <GlowingDivider intensity="subtle" />
        </div>

        {/* Secondary Navigation Section */}
        <div className="py-2 px-2 space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-all relative group ${
                  isActive
                    ? 'bg-[#00C2FF]/10 text-white font-semibold border-l-2 border-[#00C2FF]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1B2A]/50 border-l-2 border-transparent'
                }`}
              >
                <span className={`${isActive ? 'text-[#00C2FF]' : 'text-slate-400 group-hover:text-[#00C2FF]'}`}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="flex-1 text-left tracking-wider truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-2 border-t border-[#00C2FF]/15 space-y-1">
        {/* Return to 3D Landing Page */}
        <button
          onClick={onExitToLanding}
          title="Return to 3D Landing Experience"
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-slate-400 hover:text-[#00C2FF] hover:bg-[#0D1B2A]/50 transition-colors"
        >
          <Globe size={18} className="text-[#00C2FF]" />
          {!collapsed && <span className="tracking-wider truncate">3D EXPERIENCE</span>}
        </button>

        {/* Sidebar Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded text-slate-400 hover:text-white hover:bg-[#0D1B2A]/50 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
