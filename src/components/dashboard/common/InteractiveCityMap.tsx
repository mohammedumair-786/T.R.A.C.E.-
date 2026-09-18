import React, { useState, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Video, Activity, ShieldCheck, X, Eye } from 'lucide-react';
import { CAMERA_NODES, CameraNodeData } from '../../../utils/mockData';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

interface InteractiveCityMapProps {
  selectedNodeId?: string | null;
  onSelectNode?: (node: CameraNodeData) => void;
  className?: string;
  height?: string;
}

export const InteractiveCityMap: React.FC<InteractiveCityMapProps> = ({
  selectedNodeId = 'cam-07',
  onSelectNode,
  className = '',
  height = 'h-[500px] lg:h-[580px]'
}) => {
  const [zoom, setZoom] = useState(1);
  const [activeNode, setActiveNode] = useState<CameraNodeData | null>(() => {
    return CAMERA_NODES.find((n) => n.id === selectedNodeId) || CAMERA_NODES[6];
  });
  const [filterCongestion, setFilterCongestion] = useState<'all' | 'congested'>('all');

  // Convert 3D world coords [-45..45, z -35..75] into SVG 2D coords [100..900, 80..580]
  const nodeMapPositions = useMemo(() => {
    return CAMERA_NODES.map((node) => {
      const svgX = 500 + node.position[0] * 9.5;
      const svgY = 280 + node.position[2] * 3.8;
      return {
        ...node,
        svgX,
        svgY
      };
    });
  }, []);

  // Road segments with congestion levels
  const roadSegments = useMemo(() => [
    // Harbor Expressway (CAM-12): Severe Congestion
    { id: 'rd-1', d: 'M 150 424 L 880 424', status: 'CRITICAL', color: '#FF3B4E', label: 'Harbor Expy' },
    // Central Transit Avenue (CAM-07): Moderate Congestion
    { id: 'rd-2', d: 'M 500 60 L 500 580', status: 'MODERATE', color: '#F59E0B', label: 'Central Ave' },
    // Sector 4 East Corridor: Normal
    { id: 'rd-3', d: 'M 100 160 L 900 160', status: 'NORMAL', color: '#00C2FF', label: 'Sector 4 Blvd' },
    // Financial Corridor (CAM-09): Moderate
    { id: 'rd-4', d: 'M 100 356 L 900 356', status: 'MODERATE', color: '#F59E0B', label: 'Financial Cor' },
    // Civic Center Crossway (CAM-05): Normal
    { id: 'rd-5', d: 'M 120 240 L 880 240', status: 'NORMAL', color: '#22C55E', label: 'Civic Way' },
    // Western Arterial: Normal
    { id: 'rd-6', d: 'M 262 60 L 262 580', status: 'NORMAL', color: '#00C2FF', label: 'West Arterial' },
    // Eastern Parkway: Normal
    { id: 'rd-7', d: 'M 737 60 L 737 580', status: 'NORMAL', color: '#22C55E', label: 'East Pkwy' },
    // Southern Ring Connector: Normal
    { id: 'rd-8', d: 'M 120 480 L 880 480', status: 'NORMAL', color: '#00C2FF', label: 'Perimeter Ring' },
    // Diagonal Highway
    { id: 'rd-9', d: 'M 150 120 L 850 520', status: 'NORMAL', color: '#2563EB', label: 'Metro Link' },
  ], []);

  const handleNodeClick = (node: (typeof nodeMapPositions)[0]) => {
    setActiveNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const currentNode = activeNode ? nodeMapPositions.find((n) => n.id === activeNode.id) : null;

  return (
    <div className={`relative w-full ${height} bg-[#050816] hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br overflow-hidden select-none ${className}`}>
      {/* Background Subtle Radar Coordinates */}
      <div className="absolute top-3 left-4 z-10 font-mono text-[10px] text-slate-400 tracking-wider flex items-center gap-3">
        <span className="text-[#00C2FF] font-semibold">VECTOR MAP ENGINE</span>
        <span>//</span>
        <span>COORDINATES: 26.9124° N, 75.7873° E</span>
      </div>

      {/* Map Control Actions */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.25))}
          title="Zoom In"
          className="p-1.5 rounded bg-[#0D1B2A]/90 border border-[#00C2FF]/30 text-slate-300 hover:text-[#00C2FF] hover:border-[#00C2FF] transition-colors"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
          title="Zoom Out"
          className="p-1.5 rounded bg-[#0D1B2A]/90 border border-[#00C2FF]/30 text-slate-300 hover:text-[#00C2FF] hover:border-[#00C2FF] transition-colors"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => setZoom(1)}
          title="Reset Zoom"
          className="p-1.5 rounded bg-[#0D1B2A]/90 border border-[#00C2FF]/30 text-slate-300 hover:text-[#00C2FF] hover:border-[#00C2FF] transition-colors"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Main SVG Vector Surface */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair">
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,194,255,0.05)" strokeWidth="1" />
            </pattern>

            {/* Glowing Filter */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* City Grid Background */}
          <rect width="1000" height="650" fill="url(#city-grid)" />

          {/* Urban Coastline / Natural Geographic Boundary */}
          <path
            d="M 50 620 Q 250 560 400 590 T 750 550 T 950 580"
            fill="none"
            stroke="#081426"
            strokeWidth="38"
            opacity="0.8"
          />
          <path
            d="M 50 620 Q 250 560 400 590 T 750 550 T 950 580"
            fill="none"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.3"
          />

          {/* Road Corridors Layer */}
          {roadSegments.map((road) => (
            <g key={road.id}>
              {/* Road bed shadow */}
              <path
                d={road.d}
                fill="none"
                stroke="#081426"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Colored Congestion Line */}
              <path
                d={road.d}
                fill="none"
                stroke={road.color}
                strokeWidth="2.5"
                filter={road.status === 'CRITICAL' ? 'url(#neon-glow)' : undefined}
                opacity={road.status === 'CRITICAL' ? 0.95 : 0.65}
              />
              {/* Moving Pulse Dashes along road */}
              <path
                d={road.d}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeDasharray="6 30"
                className="animate-[dash_12s_linear_infinite]"
                opacity="0.4"
              />
            </g>
          ))}

          {/* Inter-camera optical mesh vectors */}
          <g opacity="0.2">
            {nodeMapPositions.slice(0, 15).map((node, i) => {
              const next = nodeMapPositions[(i + 3) % nodeMapPositions.length];
              return (
                <line
                  key={`link-${i}`}
                  x1={node.svgX}
                  y1={node.svgY}
                  x2={next.svgX}
                  y2={next.svgY}
                  stroke="#00C2FF"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}
          </g>

          {/* 24 Camera Nodes */}
          {nodeMapPositions.map((node) => {
            const isSelected = activeNode?.id === node.id;
            const isWarning = node.id === 'cam-12' || node.id === 'cam-09';
            const nodeColor = isWarning ? '#F59E0B' : '#00C2FF';

            return (
              <g
                key={node.id}
                className="cursor-pointer group"
                onClick={() => handleNodeClick(node)}
              >
                {/* Outer Radar Ping Ring */}
                <circle
                  cx={node.svgX}
                  cy={node.svgY}
                  r={isSelected ? 18 : 12}
                  fill="none"
                  stroke={nodeColor}
                  strokeWidth="1"
                  opacity={isSelected ? 0.8 : 0.3}
                  className={isSelected ? 'animate-ping' : ''}
                />

                {/* Selection Halo */}
                {isSelected && (
                  <circle
                    cx={node.svgX}
                    cy={node.svgY}
                    r="10"
                    fill="rgba(0,194,255,0.2)"
                    stroke="#00C2FF"
                    strokeWidth="1.5"
                  />
                )}

                {/* Center Solid Core Dot */}
                <circle
                  cx={node.svgX}
                  cy={node.svgY}
                  r="3.5"
                  fill={nodeColor}
                  filter="url(#neon-glow)"
                />

                {/* Node ID label */}
                <text
                  x={node.svgX + 8}
                  y={node.svgY + 3}
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="8.5"
                  fill={isSelected ? '#FFFFFF' : '#7DD3FC'}
                  opacity={isSelected ? 1 : 0.65}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {node.code}
                </text>
              </g>
            );
          })}

          {/* Data-Callout Line from active node to floating inspection card */}
          {currentNode && (
            <g>
              {/* Connector line from node to right-hand floating card */}
              <path
                d={`M ${currentNode.svgX} ${currentNode.svgY} L ${Math.min(currentNode.svgX + 40, 680)} ${currentNode.svgY - 20} L 710 180`}
                fill="none"
                stroke="#00C2FF"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity="0.8"
              />
              <circle cx={currentNode.svgX} cy={currentNode.svgY} r="4" fill="#00C2FF" />
              <circle cx="710" cy="180" r="3" fill="#00C2FF" />
            </g>
          )}
        </svg>
      </div>

      {/* Floating Node Detail Callout Panel (Inside Map on Right side) */}
      {currentNode && (
        <div className="absolute top-12 right-4 z-20 w-72 bg-[#0D1B2A]/95 backdrop-blur-md p-4 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#00C2FF]/30 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
              <span className="font-bold text-white tracking-widest">{currentNode.name}</span>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2 mb-3">
            <div className="text-[10px] text-slate-400">
              SECTOR: <span className="text-slate-200">{currentNode.sector}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">TELEMETRY:</span>
              <span className="text-[#22C55E] font-semibold">{currentNode.fps} FPS · {currentNode.latencyMs}ms</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">ANPR RECOGNITION:</span>
              <span className="text-[#00C2FF] font-semibold">ACTIVE (99.4%)</span>
            </div>
          </div>

          {/* Simulated Optical Feed Placeholder with Scanlines */}
          <div className="relative h-24 bg-[#050816] rounded border border-[#00C2FF]/30 overflow-hidden mb-3 flex items-center justify-center">
            {/* Scanline */}
            <div className="absolute inset-x-0 top-0 h-1 bg-[#00C2FF] opacity-60 animate-scanline" />
            {/* Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-10 h-10 border border-[#00C2FF]" />
              <div className="absolute w-full h-[1px] bg-[#00C2FF]/20" />
            </div>
            <span className="text-[9px] text-slate-400 tracking-widest uppercase">
              SIMULATED OPTICAL FEED
            </span>
          </div>

          <div className="text-[9px] text-slate-500 tracking-wider">
            LAST DETECTION: <span className="text-slate-300">RJ14 AB 1234 · 43.8 km/h</span>
          </div>
        </div>
      )}

      {/* Tactical Map Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-4 z-10 bg-[#0D1B2A]/90 backdrop-blur-md px-3 py-2 hud-border font-mono text-[10px] flex items-center gap-4 text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 rounded bg-[#00C2FF]" />
          <span>FREE FLOW</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 rounded bg-[#F59E0B]" />
          <span>MODERATE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 rounded bg-[#FF3B4E]" />
          <span>CONGESTION</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
          <span>24 NODES</span>
        </div>
      </div>
    </div>
  );
};
