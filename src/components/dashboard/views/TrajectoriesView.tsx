import React, { useState, useEffect, useRef } from 'react';
import {
  Route,
  Search,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { TARGET_VEHICLE, TRAJECTORY_SEQUENCE } from '../../../utils/mockData';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { GeographicLiveMap } from '../common/GeographicLiveMap';

export const TrajectoriesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('RJ14 AB 1234');
  const [scrubProgress, setScrubProgress] = useState(0.4); // 0 to 1
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredEventIndex, setHoveredEventIndex] = useState<number | null>(null);

  // Play/Pause animation timer
  useEffect(() => {
    let animFrame: number;
    if (isPlaying) {
      const step = () => {
        setScrubProgress((prev) => {
          if (prev >= 1) {
            setIsPlaying(false);
            return 1;
          }
          return prev + 0.005;
        });
        animFrame = requestAnimationFrame(step);
      };
      animFrame = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  // Convert trajectory 3D coords to SVG 2D coords
  const mapPoints = TRAJECTORY_SEQUENCE.map((pt) => ({
    ...pt,
    x: 480 + pt.position[0] * 9.5,
    y: 260 + pt.position[2] * 3.8
  }));

  // Build SVG path data connecting the sequential trajectory nodes
  const splinePathD = mapPoints.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    return `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Calculate current vehicle marker position along the spline
  const activeSegmentIndex = Math.min(
    mapPoints.length - 2,
    Math.floor(scrubProgress * (mapPoints.length - 1))
  );
  const segmentFraction = (scrubProgress * (mapPoints.length - 1)) % 1;

  const currentP1 = mapPoints[activeSegmentIndex];
  const currentP2 = mapPoints[activeSegmentIndex + 1];

  const markerX = currentP1 ? currentP1.x + (currentP2.x - currentP1.x) * segmentFraction : mapPoints[0].x;
  const markerY = currentP1 ? currentP1.y + (currentP2.y - currentP1.y) * segmentFraction : mapPoints[0].y;

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Top Search & Filter Bar */}
      <div className="p-4 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PLATE OR TARGET ID..."
              className="w-full bg-[#050816] border border-[#00C2FF]/40 focus:border-[#00C2FF] rounded pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={13} className="text-[#00C2FF]" />
            <span>TODAY (LAST 2H)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge status="SUCCESS" label="ROUTE CORRELATED (98.4%)" size="sm" />
        </div>
      </div>

      {/* Main Trajectory Reconstruction Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Trajectory Map & Timeline Scrubber (65%) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Map Surface */}
          <div className="relative h-[420px] bg-[#050816] hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br overflow-hidden">
            {/* Real Geographic Map Surface replacing SVG Vector Map */}
            <GeographicLiveMap 
              className="w-full h-[420px]" 
              height="h-[420px]"
              showOnlyTrajectory={true} 
              scrubProgress={scrubProgress} 
            />

            {/* In-Map Telemetry HUD Banner */}
            <div className="absolute top-3 left-3 bg-[#0D1B2A]/90 backdrop-blur-md p-2.5 hud-border text-[10px] space-y-0.5">
              <div className="text-white font-bold tracking-wider">
                TARGET: {TARGET_VEHICLE.plate}
              </div>
              <div className="text-[#00C2FF]">{TARGET_VEHICLE.type}</div>
              <div className="text-slate-400">CORRELATED NODES: 5 // DISTANCE: 1.84 KM</div>
            </div>
          </div>

          {/* Horizontal Timeline Scrubber Controls */}
          <div className="p-4 bg-[#0D1B2A]/90 hud-border corner-bracket-bl corner-bracket-br space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  icon={isPlaying ? <Pause size={14} /> : <Play size={14} />}
                >
                  {isPlaying ? 'PAUSE SCRUBBER' : 'PLAY TIMELINE'}
                </Button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setScrubProgress(0);
                  }}
                  className="p-2 rounded bg-[#081426] border border-slate-700 text-slate-400 hover:text-white"
                  title="Reset Timeline"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>PROGRESS: <span className="text-[#00C2FF] font-semibold">{Math.round(scrubProgress * 100)}%</span></span>
                <span>EST. SPEED: <span className="text-white font-semibold">44.8 KM/H</span></span>
              </div>
            </div>

            {/* Scrubber Slider */}
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={scrubProgress}
                onChange={(e) => {
                  setIsPlaying(false);
                  setScrubProgress(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-[#050816] rounded-lg appearance-none cursor-pointer accent-[#00C2FF] focus:outline-none"
              />
            </div>

            {/* Sequential Node Markers along timeline */}
            <div className="flex justify-between text-[9px] text-slate-500 pt-1">
              {mapPoints.map((pt, i) => (
                <span
                  key={pt.nodeId}
                  className={`cursor-pointer ${
                    scrubProgress >= i / (mapPoints.length - 1) ? 'text-[#00C2FF] font-bold' : ''
                  }`}
                  onClick={() => setScrubProgress(i / (mapPoints.length - 1))}
                >
                  {pt.cameraName.replace('CAM-DEMO-', 'CAM-')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chronological Detection Events List (35%) */}
        <div className="lg:col-span-4 p-4 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br space-y-4">
          <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-2">
            <span className="text-xs font-bold text-white tracking-wider">
              DETECTION EVENTS ({TRAJECTORY_SEQUENCE.length})
            </span>
            <span className="text-[9px] text-[#22C55E] font-semibold">ALL MATCHED</span>
          </div>

          <div className="space-y-2.5">
            {TRAJECTORY_SEQUENCE.map((event, idx) => {
              const nodeRatio = idx / (TRAJECTORY_SEQUENCE.length - 1);
              const isPast = scrubProgress >= nodeRatio;

              return (
                <div
                  key={event.nodeId}
                  onMouseEnter={() => setHoveredEventIndex(idx)}
                  onMouseLeave={() => setHoveredEventIndex(null)}
                  onClick={() => setScrubProgress(nodeRatio)}
                  className={`p-3 rounded border transition-all cursor-pointer text-[10px] space-y-1.5 ${
                    isPast
                      ? 'bg-[#00C2FF]/10 border-[#00C2FF]/60 shadow-[0_0_10px_rgba(0,194,255,0.15)]'
                      : 'bg-[#081426] border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{event.cameraName}</span>
                    <span className="text-slate-400 text-[9px]">{event.timestamp}</span>
                  </div>

                  <div className="text-slate-300 text-[9px] truncate">
                    SECTOR: {event.sector}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-700/50 pt-1 text-[9px]">
                    <span className="text-slate-400">RECORDED SPEED:</span>
                    <span className="font-bold text-[#00C2FF]">{event.speedKmh} km/h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
