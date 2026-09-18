import React, { useState } from 'react';
import {
  Car,
  Camera,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ScanLine,
  ChevronRight
} from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';
import { GeographicLiveMap } from '../common/GeographicLiveMap';
import { DataCalloutLine } from '../common/DataCalloutLine';
import { Badge } from '../../ui/Badge';

interface OverviewViewProps {
  forceMapOnly?: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ forceMapOnly = false }) => {
  const { kpiData, alerts, recentDetections, setSelectedCameraId, setCurrentView } = useDashboard();
  const [hoveredKpi, setHoveredKpi] = useState<number | null>(null);

  const kpis = [
    {
      id: 0,
      title: 'TOTAL VEHICLES TRACKED',
      value: kpiData.totalVehicles.toLocaleString(),
      trend: kpiData.vehiclesTrend,
      isPositive: true,
      icon: <Car size={18} className="text-[#00C2FF]" />,
      sparkline: [40, 48, 55, 62, 70, 68, 78, 85, 92],
      tooltipNote: 'Peak throughput recorded at South Transit Corridor'
    },
    {
      id: 1,
      title: 'ACTIVE CAMERA NODES',
      value: `${kpiData.activeNodes} / ${kpiData.totalNodes}`,
      trend: '100% OPERATIONAL',
      isPositive: true,
      icon: <Camera size={18} className="text-[#22C55E]" />,
      sparkline: [24, 24, 24, 24, 24, 24, 24, 24, 24],
      tooltipNote: 'Zero packet loss detected across optical mesh'
    },
    {
      id: 2,
      title: 'ACTIVE ALERTS',
      value: `0${kpiData.activeAlerts}`,
      trend: '1 Critical · 3 Warning',
      isPositive: false,
      icon: <AlertTriangle size={18} className="text-[#F59E0B]" />,
      sparkline: [2, 3, 5, 4, 8, 7, 6, 8, 8],
      tooltipNote: 'Deceleration cluster flagged at CAM-DEMO-12'
    },
    {
      id: 3,
      title: 'AVG. CONGESTION INDEX',
      value: `${kpiData.congestionIndex}%`,
      trend: kpiData.congestionTrend,
      isPositive: true,
      icon: <Activity size={18} className="text-[#00C2FF]" />,
      sparkline: [62, 60, 58, 55, 54, 53, 54, 55, 54],
      tooltipNote: 'Flow rates stabilized post evening peak window'
    }
  ];

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Top Row: 4 KPI Cards */}
      {!forceMapOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              onMouseEnter={() => setHoveredKpi(kpi.id)}
              onMouseLeave={() => setHoveredKpi(null)}
              className="relative p-4 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br transition-all duration-300 hover:border-[#00C2FF]/70 hover:shadow-glow-cyan group"
            >
              {/* Header */}
              <div className="flex items-center justify-between text-slate-400 text-[10px] tracking-wider mb-2">
                <span>{kpi.title}</span>
                <div className="p-1 rounded bg-[#081426] border border-[#00C2FF]/20">
                  {kpi.icon}
                </div>
              </div>

              {/* Main Metric Value */}
              <div className="text-2xl font-bold text-white tracking-wider text-glow-cyan mb-1">
                {kpi.value}
              </div>

              {/* Trend */}
              <div className="flex items-center gap-1.5 text-[10px]">
                {kpi.isPositive ? (
                  <ArrowUpRight size={12} className="text-[#22C55E]" />
                ) : (
                  <ArrowDownRight size={12} className="text-[#F59E0B]" />
                )}
                <span className={kpi.isPositive ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
                  {kpi.trend}
                </span>
              </div>

              {/* Data-Callout Tooltip on Hover with Sparkline */}
              {hoveredKpi === kpi.id && (
                <div className="absolute -bottom-24 left-2 right-2 z-40 p-2.5 bg-[#081426] border border-[#00C2FF]/60 rounded shadow-glow-cyan text-[9px] pointer-events-none">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>TREND ANALYSIS</span>
                    <span className="text-[#00C2FF]">LAST 60 MIN</span>
                  </div>
                  {/* Mini Sparkline SVG */}
                  <svg viewBox="0 0 100 24" className="w-full h-6 stroke-[#00C2FF] fill-none stroke-[1.5]">
                    <polyline
                      points={kpi.sparkline.map((val, i) => `${(i / (kpi.sparkline.length - 1)) * 100},${24 - (val / 100) * 20}`).join(' ')}
                    />
                  </svg>
                  <div className="text-slate-300 truncate mt-1">
                    {kpi.tooltipNote}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Row: Live City Map (65%) + Feeds Side Panel (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live City Map */}
        <div className={forceMapOnly ? 'lg:col-span-12' : 'lg:col-span-8'}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-[#7DD3FC] tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
              <span>LIVE CITYWIDE SURVEILLANCE MESH</span>
            </div>
            <button
              onClick={() => setCurrentView('cameras')}
              className="text-[10px] text-[#00C2FF] hover:underline flex items-center gap-1"
            >
              <span>INSPECT ALL 24 NODES</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <GeographicLiveMap
            selectedNodeId="cam-07"
            onSelectNode={(node) => setSelectedCameraId(node.id)}
            height="h-[520px] sm:h-[600px]"
          />
        </div>

        {/* Right: Feeds Side Panel */}
        {!forceMapOnly && (
          <div className="lg:col-span-4 space-y-6">
            {/* Live Alerts Feed */}
            <div className="p-4 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br">
              <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-[#F59E0B]" />
                  <span className="text-xs font-bold text-white tracking-wider">LIVE ALERTS</span>
                </div>
                <button
                  onClick={() => setCurrentView('alerts')}
                  className="text-[9px] text-[#00C2FF] hover:underline"
                >
                  VIEW LOG
                </button>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded bg-[#081426] border-l-2 transition-all ${
                      alert.severity === 'CRITICAL'
                        ? 'border-l-[#FF3B4E]'
                        : alert.severity === 'WARNING'
                        ? 'border-l-[#F59E0B]'
                        : 'border-l-[#22C55E]'
                    } border border-slate-700/50 hover:border-[#00C2FF]/40 text-[10px] space-y-1`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{alert.title}</span>
                      <span className="text-[8px] text-slate-500">{alert.timestamp}</span>
                    </div>
                    <div className="text-slate-400 text-[9px] truncate">{alert.message}</div>
                    <div className="flex items-center justify-between text-[8px] text-slate-500 pt-0.5">
                      <span>NODE: <span className="text-[#7DD3FC]">{alert.camera}</span></span>
                      <Badge status={alert.severity} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Detections Mini-Feed */}
            <div className="p-4 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br">
              <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <ScanLine size={15} className="text-[#00C2FF] animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-wider">RECENT ANPR SCANS</span>
                </div>
                <button
                  onClick={() => setCurrentView('trajectories')}
                  className="text-[9px] text-[#00C2FF] hover:underline"
                >
                  RECONSTRUCT
                </button>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {recentDetections.slice(0, 5).map((det) => (
                  <div
                    key={det.id}
                    className="p-2 rounded bg-[#081426] border border-slate-700/50 hover:border-[#00C2FF]/40 text-[10px] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#00C2FF] tracking-wider text-xs">
                        {det.plate}
                      </div>
                      <div className="text-slate-400 text-[9px]">{det.vehicleType} · {det.speed}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-semibold text-[#22C55E] block">
                        {det.confidence}% MATCH
                      </span>
                      <span className="text-[8px] text-slate-500">{det.camera}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
