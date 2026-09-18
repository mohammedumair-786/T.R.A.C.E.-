import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from '../../../context/DashboardContext';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import { OverviewView } from '../views/OverviewView';
import { GeographicLiveMap } from '../common/GeographicLiveMap';
import { CameraNetworkView } from '../views/CameraNetworkView';

import { TrajectoriesView } from '../views/TrajectoriesView';
import { AlertsView } from '../views/AlertsView';
import { AnalyticsView } from '../views/AnalyticsView';
import { SettingsView } from '../views/SettingsView';

interface DashboardShellProps {
  onExitToLanding: () => void;
  onLogout: () => void;
}

const DashboardContent: React.FC<DashboardShellProps> = ({ onExitToLanding, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentView } = useDashboard();

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 relative overflow-x-hidden font-sans">
      {/* Ambient background particle / grid texture (3-5% opacity, never competing with data) */}
      <div className="fixed inset-0 bg-tech-grid opacity-30 pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.03)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Persistent Left Sidebar */}
      <DashboardSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onExitToLanding={onExitToLanding}
      />

      {/* Persistent Top Bar */}
      <DashboardTopBar
        collapsed={collapsed}
        onLogout={onLogout}
      />

      {/* Main Routed Content Area */}
      <main
        className={`pt-20 pb-12 px-6 transition-all duration-300 relative z-10 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {currentView === 'overview' && <OverviewView />}
        {currentView === 'live-map' && <GeographicLiveMap />}
        {currentView === 'cameras' && <CameraNetworkView />}
        {currentView === 'trajectories' && <TrajectoriesView />}
        {currentView === 'alerts' && <AlertsView />}
        {currentView === 'analytics' && <AnalyticsView />}
        {currentView === 'settings' && <SettingsView onLogout={onLogout} />}
      </main>
    </div>
  );
};

export const DashboardShell: React.FC<DashboardShellProps> = (props) => {
  return (
    <DashboardProvider>
      <DashboardContent {...props} />
    </DashboardProvider>
  );
};
