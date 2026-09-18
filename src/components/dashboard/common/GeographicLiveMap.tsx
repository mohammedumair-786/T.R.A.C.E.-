import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  Radio,
  Car,
  AlertTriangle,
  X,
  ExternalLink,
  Layers,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { CAMERA_NODES, CameraNodeData, TARGET_VEHICLE, TRAJECTORY_SEQUENCE } from '../../../utils/mockData';
import { useDashboard } from '../../../context/DashboardContext';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

interface GeographicLiveMapProps {
  selectedNodeId?: string | null;
  onSelectNode?: (node: CameraNodeData) => void;
  className?: string;
  height?: string;
  scrubProgress?: number;
  showOnlyTrajectory?: boolean;
}

export const GeographicLiveMap: React.FC<GeographicLiveMapProps> = ({
  selectedNodeId = 'cam-07',
  onSelectNode,
  className = '',
  height = 'h-[580px] lg:h-[680px]',
  scrubProgress,
  showOnlyTrajectory = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { kpiData, alerts, setCurrentView, setSelectedCameraId } = useDashboard();

  const [activeNode, setActiveNode] = useState<CameraNodeData | null>(() => {
    return CAMERA_NODES.find((n) => n.id === selectedNodeId) || CAMERA_NODES[6];
  });
  const [selectedVehicleTrace, setSelectedVehicleTrace] = useState<boolean>(false);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [showCongestion, setShowCongestion] = useState<boolean>(true);

  // Center coordinates: Metropolitan Coordinates
  const cityCenter: [number, number] = [26.9124, 75.7873];

  // Convert 3D node positions into real geographic coordinates
  const geoNodes = useMemo(() => {
    return CAMERA_NODES.map((node) => {
      // Realistic lat/lng offset mapping
      const lat = cityCenter[0] - (node.position[2] / 75) * 0.042;
      const lng = cityCenter[1] + (node.position[0] / 45) * 0.052;
      return {
        ...node,
        lat,
        lng
      };
    });
  }, []);

  // Road corridors with congestion severity
  const geoRoads = useMemo(() => [
    // Harbor Expressway: Critical Congestion
    {
      name: 'Harbor Expressway',
      status: 'CRITICAL',
      color: '#FF3B4E',
      weight: 5,
      coords: [
        [26.892, 75.742],
        [26.891, 75.765],
        [26.890, 75.795],
        [26.888, 75.835]
      ] as [number, number][]
    },
    // Central Transit Avenue: Moderate Congestion
    {
      name: 'Central Transit Avenue',
      status: 'MODERATE',
      color: '#F59E0B',
      weight: 4.5,
      coords: [
        [26.935, 75.787],
        [26.920, 75.788],
        [26.905, 75.786],
        [26.885, 75.787]
      ] as [number, number][]
    },
    // Sector 4 North Corridor: Normal Flow
    {
      name: 'Sector 4 East-West Corridor',
      status: 'NORMAL',
      color: '#00C2FF',
      weight: 3.5,
      coords: [
        [26.928, 75.745],
        [26.929, 75.775],
        [26.927, 75.815],
        [26.926, 75.835]
      ] as [number, number][]
    },
    // Financial Corridor: Moderate
    {
      name: 'Financial Corridor South',
      status: 'MODERATE',
      color: '#F59E0B',
      weight: 4,
      coords: [
        [26.901, 75.748],
        [26.902, 75.776],
        [26.899, 75.810],
        [26.903, 75.838]
      ] as [number, number][]
    },
    // Civic Center Crossway: Normal
    {
      name: 'Civic Center Crossway',
      status: 'NORMAL',
      color: '#22C55E',
      weight: 3.5,
      coords: [
        [26.918, 75.750],
        [26.917, 75.788],
        [26.919, 75.825]
      ] as [number, number][]
    }
  ], []);

  // Trajectory sequence mapped to real coordinates
  const trajectoryGeoPoints = useMemo(() => {
    return TRAJECTORY_SEQUENCE.map((pt) => {
      const lat = cityCenter[0] - (pt.position[2] / 75) * 0.042;
      const lng = cityCenter[1] + (pt.position[0] / 45) * 0.052;
      return [lat, lng] as [number, number];
    });
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map with dark canvas background
    const map = L.map(mapContainerRef.current, {
      center: [26.908, 75.787],
      zoom: 13,
      zoomControl: false,
      attributionControl: true
    });
    mapInstanceRef.current = map;

    // Google Maps Tiles with provided API Key + CSS Inversion for Dark Mode
    const tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=AIzaSyBtD6Tso9FNh53vKJnjPAq49iIFB8UKlhM', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>'
    }).addTo(map);

    // Apply CSS filter to make Google Maps dark to match the UI
    if (tileLayer.getContainer()) {
      tileLayer.getContainer()!.style.filter = 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)';
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Overlays (Camera Nodes, Road Corridors, Trajectory)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const layerGroup = L.layerGroup().addTo(map);

    // 1. Render Congestion Road Corridors
    if (!showOnlyTrajectory && showCongestion) {
      geoRoads.forEach((road) => {
        // Outer dark shadow
        L.polyline(road.coords, {
          color: '#050816',
          weight: road.weight + 4,
          opacity: 0.9
        }).addTo(layerGroup);

        // Colored congestion line
        L.polyline(road.coords, {
          color: road.color,
          weight: road.weight,
          opacity: 0.85,
          dashArray: road.status === 'CRITICAL' ? undefined : '6 4'
        }).addTo(layerGroup);
      });
    }

    // 2. Render Trajectory Spline & Vehicle Trace
    if (showTrajectory && trajectoryGeoPoints.length > 1) {
      // Glow underlay
      L.polyline(trajectoryGeoPoints, {
        color: '#2563EB',
        weight: 7,
        opacity: 0.4
      }).addTo(layerGroup);

      // Neon cyan trajectory line
      const trajLine = L.polyline(trajectoryGeoPoints, {
        color: '#00C2FF',
        weight: 3,
        opacity: 0.95
      }).addTo(layerGroup);

      trajLine.on('click', () => {
        setSelectedVehicleTrace(true);
      });

      // Live vehicle marker icon at intermediate checkpoint
      const activeIdx = Math.min(trajectoryGeoPoints.length - 2, Math.floor((scrubProgress ?? 0.5) * (trajectoryGeoPoints.length - 1)));
      const segmentFraction = ((scrubProgress ?? 0.5) * (trajectoryGeoPoints.length - 1)) % 1;
      
      const p1 = trajectoryGeoPoints[activeIdx];
      const p2 = trajectoryGeoPoints[activeIdx + 1];
      
      let vehiclePos = p1;
      if (p1 && p2) {
         vehiclePos = [
           p1[0] + (p2[0] - p1[0]) * segmentFraction,
           p1[1] + (p2[1] - p1[1]) * segmentFraction
         ];
      }

      if (vehiclePos) {
        const vehicleIcon = L.divIcon({
          className: 'vehicle-marker-div',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
              <span class="absolute inset-0 rounded-full bg-[#00C2FF] animate-ping opacity-60"></span>
              <span class="relative w-4 h-4 rounded-full bg-[#7DD3FC] border-2 border-[#00C2FF] shadow-[0_0_12px_#00C2FF] flex items-center justify-center">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              </span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const vMarker = L.marker(vehiclePos as [number, number], { icon: vehicleIcon }).addTo(layerGroup);
        vMarker.on('click', () => setSelectedVehicleTrace(true));
      }
    }

    // 3. Render 24 Camera Node Markers
    if (!showOnlyTrajectory) {
      geoNodes.forEach((node) => {
        const isSelected = activeNode?.id === node.id;
        const isWarning = node.id === 'cam-12' || node.id === 'cam-09';
        const nodeColor = isWarning ? '#F59E0B' : '#00C2FF';

        const customIcon = L.divIcon({
          className: 'camera-node-div',
          html: `
            <div class="relative flex items-center justify-center w-7 h-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <span class="absolute inset-0 rounded-full border ${isSelected ? 'animate-ping opacity-75' : 'opacity-30'}" style="border-color: ${nodeColor};"></span>
            ${isSelected ? `<span class="absolute w-6 h-6 rounded-full bg-[rgba(0,194,255,0.2)] border border-[#00C2FF]"></span>` : ''}
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${nodeColor}; box-shadow: 0 0 8px ${nodeColor};"></span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon }).addTo(layerGroup);

      marker.on('click', () => {
        setActiveNode(node);
        setSelectedCameraId(node.id);
        if (onSelectNode) onSelectNode(node);
      });
      });
    }

    return () => {
      layerGroup.remove();
    };
  }, [geoNodes, geoRoads, trajectoryGeoPoints, showTrajectory, showCongestion, activeNode, scrubProgress, showOnlyTrajectory]);

  const handleResetView = () => {
    mapInstanceRef.current?.setView([26.908, 75.787], 13);
  };

  return (
    <div className={`relative w-full ${height} bg-[#050816] hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br overflow-hidden select-none font-mono ${className}`}>
      {/* Leaflet Mount Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Geographic Telemetry Header */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3 pointer-events-none">
        <div className="bg-[#0D1B2A]/90 backdrop-blur-md px-3 py-1.5 hud-border text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
          <span className="font-bold text-white tracking-widest">REAL GEOGRAPHIC MESH</span>
          <span className="text-[#00C2FF]">//</span>
          <span className="text-slate-400 text-[10px]">26.9124° N, 75.7873° E</span>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="hidden sm:flex items-center gap-3 bg-[#081426]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#00C2FF]/30 text-[10px] text-slate-300">
          <span>VEHICLES: <span className="text-[#00C2FF] font-bold">{kpiData.totalVehicles.toLocaleString()}</span></span>
          <span>NODES: <span className="text-white font-bold">{kpiData.activeNodes} ONLINE</span></span>
          <span>ALERTS: <span className="text-[#F59E0B] font-bold">0{kpiData.activeAlerts}</span></span>
        </div>
      </div>

      {/* Top Right: Map Controls & Layer Toggles */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Trajectory Layer Toggle */}
        <button
          onClick={() => setShowTrajectory(!showTrajectory)}
          className={`px-2.5 py-1.5 rounded text-[10px] font-bold transition-colors border ${
            showTrajectory
              ? 'bg-[#00C2FF]/20 text-[#00C2FF] border-[#00C2FF]/50 shadow-glow-cyan'
              : 'bg-[#0D1B2A] text-slate-400 border-slate-700'
          }`}
          title="Toggle Vehicle Trajectory Spline"
        >
          TRAJECTORY PATH
        </button>

        {/* Congestion Corridors Toggle */}
        <button
          onClick={() => setShowCongestion(!showCongestion)}
          className={`px-2.5 py-1.5 rounded text-[10px] font-bold transition-colors border ${
            showCongestion
              ? 'bg-[#00C2FF]/20 text-[#00C2FF] border-[#00C2FF]/50 shadow-glow-cyan'
              : 'bg-[#0D1B2A] text-slate-400 border-slate-700'
          }`}
          title="Toggle Traffic Congestion Corridors"
        >
          CONGESTION
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-[#0D1B2A]/90 p-1 rounded border border-[#00C2FF]/30">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1 rounded text-slate-300 hover:text-[#00C2FF]"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1 rounded text-slate-300 hover:text-[#00C2FF]"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={handleResetView}
            className="p-1 rounded text-slate-300 hover:text-[#00C2FF]"
            title="Reset to City Center"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Floating Node Inspection Panel */}
      {activeNode && (
        <div className="absolute bottom-16 sm:bottom-6 right-4 z-20 w-80 bg-[#0D1B2A]/95 backdrop-blur-md p-4 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan text-xs">
          <div className="flex items-center justify-between border-b border-[#00C2FF]/30 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
              <span className="font-bold text-white tracking-widest">{activeNode.name}</span>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1.5 mb-3 text-[11px]">
            <div className="text-slate-400 truncate">
              SECTOR: <span className="text-slate-200">{activeNode.sector}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">STATUS:</span>
              <Badge status={activeNode.id === 'cam-12' ? 'WARNING' : 'ONLINE'} size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">TELEMETRY:</span>
              <span className="text-[#22C55E] font-semibold">{activeNode.fps} FPS · {activeNode.latencyMs}ms</span>
            </div>
          </div>

          {/* Simulated Optical Feed Placeholder */}
          <div className="relative h-28 bg-[#050816] rounded border border-[#00C2FF]/40 overflow-hidden mb-3 flex flex-col justify-between p-2">
            <div className="flex items-center justify-between text-[9px] text-[#7DD3FC]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                LIVE 4K SENSOR
              </span>
              <span>FOV: {activeNode.coverageAngle}°</span>
            </div>

            <div className="absolute inset-x-0 top-0 h-1 bg-[#00C2FF] opacity-50 animate-scanline" />
            <div className="text-center text-[9px] text-slate-500 uppercase">
              OPTICAL ANPR TARGETING
            </div>

            <div className="text-[9px] text-slate-400">
              LAST READ: <span className="text-white font-bold">RJ14 AB 1234 · 43.8 km/h</span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentView('cameras')}
            className="w-full text-[10px]"
            icon={<Eye size={12} />}
          >
            INSPECT IN CAMERA NETWORK
          </Button>
        </div>
      )}

      {/* Tracked Vehicle Trace Detail Modal */}
      {selectedVehicleTrace && (
        <div className="absolute top-16 left-4 z-20 w-80 bg-[#0D1B2A]/95 backdrop-blur-md p-4 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan text-xs">
          <div className="flex items-center justify-between border-b border-[#00C2FF]/30 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Car size={15} className="text-[#00C2FF]" />
              <span className="font-bold text-white tracking-wider">TRACKED TARGET DOSSIER</span>
            </div>
            <button
              onClick={() => setSelectedVehicleTrace(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2 text-[11px] mb-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">PLATE ID:</span>
              <span className="text-lg font-bold text-[#00C2FF] text-glow-cyan">{TARGET_VEHICLE.plate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">CLASSIFICATION:</span>
              <span className="text-white font-semibold">{TARGET_VEHICLE.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">SPEED:</span>
              <span className="text-slate-200 font-semibold">{TARGET_VEHICLE.speed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ROUTE NODES:</span>
              <span className="text-[#7DD3FC]">CAM-01 → 05 → 07 → 09 → 12</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentView('trajectories')}
            className="w-full text-[10px]"
            icon={<ExternalLink size={12} />}
          >
            OPEN RECONSTRUCTION VIEWER
          </Button>
        </div>
      )}

      {/* Tactical Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#0D1B2A]/90 backdrop-blur-md px-3 py-2 hud-border text-[10px] flex items-center gap-4 text-slate-300">
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
