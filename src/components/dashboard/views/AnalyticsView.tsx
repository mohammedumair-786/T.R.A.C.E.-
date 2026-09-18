import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';
import { Button } from '../../ui/Button';

export const AnalyticsView: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | '24h' | '7d' | '30d'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; label: string } | null>(null);

  // Hourly volume trend line points (24 hours)
  const volumeData = [
    { hour: '00:00', current: 120, baseline: 140 },
    { hour: '02:00', current: 80, baseline: 90 },
    { hour: '04:00', current: 65, baseline: 70 },
    { hour: '06:00', current: 320, baseline: 290 },
    { hour: '08:00', current: 890, baseline: 820 },
    { hour: '10:00', current: 710, baseline: 690 },
    { hour: '12:00', current: 650, baseline: 640 },
    { hour: '14:00', current: 690, baseline: 670 },
    { hour: '16:00', current: 880, baseline: 850 },
    { hour: '18:00', current: 1040, baseline: 980 }, // peak
    { hour: '20:00', current: 620, baseline: 610 },
    { hour: '22:00', current: 340, baseline: 350 },
  ];

  // Congestion by Zone
  const zoneData = [
    { zone: 'Harbor Expressway', value: 78, status: 'HIGH' },
    { zone: 'Main Transit Corridor', value: 64, status: 'MODERATE' },
    { zone: 'Financial Corridor South', value: 58, status: 'MODERATE' },
    { zone: 'Central Crossway', value: 42, status: 'NORMAL' },
    { zone: 'Technology Boulevard', value: 36, status: 'NORMAL' },
    { zone: 'Civil Center Plaza', value: 24, status: 'FREE FLOW' },
  ];

  // Days of week x Hours of day heatmap (Mon-Sun x 12 buckets)
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const hourBuckets = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];

  const getHeatmapColor = (dayIdx: number, hourIdx: number) => {
    // Simulated peak intensity around 08h (idx 4) and 18h (idx 9)
    const isPeak = (hourIdx === 4 || hourIdx === 9) && dayIdx < 5;
    const isModerate = (hourIdx >= 3 && hourIdx <= 10);
    if (isPeak) return 'bg-[#00C2FF] shadow-[0_0_8px_#00C2FF]';
    if (isModerate) return 'bg-[#2563EB]/70';
    if (dayIdx >= 5 && (hourIdx >= 6 && hourIdx <= 10)) return 'bg-[#00C2FF]/50';
    return 'bg-[#081426] border border-slate-800';
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Header & Date Range Select */}
      <div className="p-4 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#7DD3FC] tracking-widest uppercase">
            <BarChart3 size={15} className="text-[#00C2FF]" />
            <span>URBAN TELEMETRY INTELLIGENCE</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            CORRELATED OVER 24 CAMERAS AND 14,890+ LIVE SAMPLES
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Simulated Demo Data Badge */}
          <span className="text-[9px] px-2 py-0.5 rounded border border-[#00C2FF]/30 text-[#7DD3FC] bg-[#081426]">
            SIMULATED DEMO DATA
          </span>

          {/* Range Selector */}
          <div className="flex items-center gap-1 bg-[#081426] p-1 rounded border border-slate-700 text-xs">
            {(['today', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                  dateRange === range
                    ? 'bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Row: Line Chart (Volume Over Time) */}
      <div className="p-6 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br space-y-4">
        <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider">
              HOURLY TRAFFIC VOLUME TRAJECTORY
            </h3>
            <span className="text-[10px] text-slate-400">
              VEHICLES PER HOUR · ELECTRIC CYAN = TODAY · MUTED SLATE = 7-DAY BASELINE
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#00C2FF]" />
              <span className="text-slate-300 text-[10px]">CURRENT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-500" />
              <span className="text-slate-400 text-[10px]">BASELINE</span>
            </div>
          </div>
        </div>

        {/* Vector Line Chart */}
        <div className="relative h-64 w-full">
          <svg viewBox="0 0 900 240" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="vol-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00C2FF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[40, 90, 140, 190].map((y, i) => (
              <line
                key={i}
                x1="40"
                y1={y}
                x2="880"
                y2={y}
                stroke="#081426"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            ))}

            {/* Baseline Path (Muted Gray) */}
            <polyline
              points={volumeData.map((d, i) => {
                const x = 50 + (i / (volumeData.length - 1)) * 820;
                const y = 200 - (d.baseline / 1100) * 160;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />

            {/* Area Fill under Cyan Line */}
            <polygon
              points={`50,200 ${volumeData.map((d, i) => {
                const x = 50 + (i / (volumeData.length - 1)) * 820;
                const y = 200 - (d.current / 1100) * 160;
                return `${x},${y}`;
              }).join(' ')} 870,200`}
              fill="url(#vol-gradient)"
            />

            {/* Primary Cyan Line */}
            <polyline
              points={volumeData.map((d, i) => {
                const x = 50 + (i / (volumeData.length - 1)) * 820;
                const y = 200 - (d.current / 1100) * 160;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#00C2FF"
              strokeWidth="2.5"
            />

            {/* Interactive Data Points */}
            {volumeData.map((d, i) => {
              const x = 50 + (i / (volumeData.length - 1)) * 820;
              const y = 200 - (d.current / 1100) * 160;

              return (
                <g key={i} className="cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#00C2FF"
                    stroke="#050816"
                    strokeWidth="2"
                    onMouseEnter={() =>
                      setHoveredPoint({ x, y, val: d.current, label: d.hour })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text
                    x={x}
                    y="225"
                    fontFamily="'JetBrains Mono', monospace"
                    fontSize="9"
                    fill="#64748b"
                    textAnchor="middle"
                  >
                    {d.hour}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute p-2 bg-[#081426] border border-[#00C2FF] rounded text-[10px] shadow-glow-cyan pointer-events-none transform -translate-x-1/2 -translate-y-full"
              style={{ left: `${(hoveredPoint.x / 900) * 100}%`, top: `${(hoveredPoint.y / 240) * 100}%` }}
            >
              <div className="text-white font-bold">{hoveredPoint.val} VEHICLES</div>
              <div className="text-[#00C2FF]">{hoveredPoint.label}</div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Heatmap & Zone Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Peak Hours Heatmap (70% width or 7 cols) */}
        <div className="lg:col-span-7 p-6 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-br space-y-4">
          <div className="border-b border-[#00C2FF]/20 pb-3">
            <h3 className="text-sm font-bold text-white tracking-wider">
              PEAK HOURS HEATMAP MATRIX
            </h3>
            <span className="text-[10px] text-slate-400">
              HOUR-OF-DAY × DAY-OF-WEEK OCCUPANCY INTENSITY
            </span>
          </div>

          <div className="space-y-1.5 overflow-x-auto">
            {/* Header X-Axis */}
            <div className="flex items-center gap-1 text-[8px] text-slate-500 pl-10">
              {hourBuckets.map((h, i) => (
                <div key={i} className="flex-1 text-center truncate">
                  {h}
                </div>
              ))}
            </div>

            {/* Rows for Mon-Sun */}
            {days.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-400 w-8">{day}</span>
                <div className="flex-1 flex items-center gap-1">
                  {hourBuckets.map((_, hourIdx) => (
                    <div
                      key={hourIdx}
                      className={`flex-1 h-5 rounded-sm transition-all duration-200 cursor-pointer ${getHeatmapColor(dayIdx, hourIdx)}`}
                      title={`${day} @ ${hourBuckets[hourIdx]}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-slate-800">
            <span>LOW DENSITY</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#081426] border border-slate-800" />
              <span className="w-3 h-3 rounded bg-[#2563EB]/70" />
              <span className="w-3 h-3 rounded bg-[#00C2FF]" />
            </div>
            <span>HIGH CONGESTION</span>
          </div>
        </div>

        {/* Right: Congestion By Zone (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-[#0D1B2A]/90 hud-border corner-bracket-tr corner-bracket-bl space-y-4">
          <div className="border-b border-[#00C2FF]/20 pb-3">
            <h3 className="text-sm font-bold text-white tracking-wider">
              CONGESTION BY SECTOR
            </h3>
            <span className="text-[10px] text-slate-400">
              CAPACITY OCCUPANCY RATIO (%)
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {zoneData.map((z, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 truncate max-w-[200px]">{z.zone}</span>
                  <span className={`font-bold ${z.status === 'HIGH' ? 'text-[#FF3B4E]' : z.status === 'MODERATE' ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
                    {z.value}%
                  </span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-1.5 bg-[#050816] rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      z.status === 'HIGH'
                        ? 'bg-[#FF3B4E]'
                        : z.status === 'MODERATE'
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#00C2FF]'
                    }`}
                    style={{ width: `${z.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
