import React, { useState } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Camera,
  Activity,
  CheckCircle2,
  AlertTriangle,
  X,
  Play,
  RotateCw,
  Signal,
  SlidersHorizontal,
  Plus,
  Smartphone,
  Video
} from 'lucide-react';
import { CameraNodeData } from '../../../utils/mockData';
import { useDashboard } from '../../../context/DashboardContext';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { AddCameraModal, RegisteredCameraPayload } from '../cameras/AddCameraModal';
import { LiveCameraCardFeed } from '../cameras/LiveCameraCardFeed';

export const CameraNetworkView: React.FC = () => {
  const { cameraNodes, registerCameraNode } = useDashboard();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState<CameraNodeData | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered cameras
  const filteredCameras = cameraNodes.filter((cam) => {
    const matchesSearch =
      cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || cam.sector.includes(sectorFilter);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ALERT' && (cam.id === 'cam-12' || cam.id === 'cam-09')) ||
      (statusFilter === 'ONLINE' && cam.id !== 'cam-12');
    const matchesSource =
      sourceFilter === 'ALL' ||
      (sourceFilter === 'PHONE' && cam.sourceType === 'PHONE') ||
      (sourceFilter === 'IP_CAMERA' && cam.sourceType === 'IP_CAMERA') ||
      (sourceFilter === 'SIMULATED' && (!cam.sourceType || cam.sourceType === 'SIMULATED'));
    return matchesSearch && matchesSector && matchesStatus && matchesSource;
  });

  const handleTestNode = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('DIAGNOSTIC PASSED: Optical MTF 0.92 · Bitrate 14.8 Mbps · Latency 11ms');
    }, 1500);
  };

  const handleRegisterCamera = (payload: RegisteredCameraPayload) => {
    const newNode: CameraNodeData = {
      id: payload.id,
      name: payload.name,
      code: payload.code,
      sector: payload.sector,
      position: [0, 4.5, 0],
      status: 'ONLINE',
      fps: 60,
      latencyMs: payload.sourceType === 'PHONE' ? 4 : 16,
      coverageAngle: 110,
      connectedTo: ['cam-07', 'cam-05'],
      sourceType: payload.sourceType,
      streamUrl: payload.streamUrl,
      mediaStream: payload.mediaStream
    };
    registerCameraNode(newNode);
    setSelectedNode(newNode);
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Top Filter / Search Bar with Register Button */}
      <div className="p-4 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="SEARCH NODE ID OR SECTOR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050816] border border-[#00C2FF]/30 focus:border-[#00C2FF] rounded pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filter Badges & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Source Type Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#081426] border border-[#00C2FF]/30 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">ALL SOURCES ({cameraNodes.length})</option>
            <option value="PHONE">PHONE / WEBCAMS</option>
            <option value="IP_CAMERA">IP CAMERAS</option>
            <option value="SIMULATED">SIMULATED (24)</option>
          </select>

          {/* Sector Select */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-[#081426] border border-[#00C2FF]/30 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">ALL SECTORS</option>
            <option value="Sector 4">Sector 4</option>
            <option value="Financial">Financial Corridor</option>
            <option value="Harbor">Harbor Expressway</option>
            <option value="Central">Central Crossway</option>
          </select>

          {/* Register Camera Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus size={14} />}
          >
            REGISTER CAMERA
          </Button>

          {/* Grid / List View Toggle Buttons */}
          <div className="flex items-center gap-1 bg-[#081426] p-1 rounded border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#00C2FF]/20 text-[#00C2FF]' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#00C2FF]/20 text-[#00C2FF]' : 'text-slate-400'}`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List of Nodes */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCameras.map((cam) => {
            const hasAlert = cam.id === 'cam-12' || cam.id === 'cam-09';
            return (
              <div
                key={cam.id}
                onClick={() => setSelectedNode(cam)}
                className="cursor-pointer bg-[#0D1B2A]/85 hud-border corner-bracket-tl corner-bracket-br p-3.5 hover:border-[#00C2FF] hover:shadow-glow-cyan transition-all group flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Camera size={14} className="text-[#00C2FF]" />
                    <span className="font-bold text-white tracking-wider text-xs group-hover:text-[#00C2FF] transition-colors">
                      {cam.name}
                    </span>
                  </div>
                  <Badge
                    status={hasAlert ? 'WARNING' : 'ONLINE'}
                    label={hasAlert ? 'FLAGGED' : 'ONLINE'}
                    size="sm"
                  />
                </div>

                {/* Source Type Tag */}
                <div className="flex items-center justify-between text-[9px] mb-1.5">
                  <span
                    className={`px-1.5 py-0.2 rounded font-semibold ${
                      cam.sourceType === 'PHONE'
                        ? 'bg-[#00C2FF]/15 text-[#00C2FF] border border-[#00C2FF]/30'
                        : cam.sourceType === 'IP_CAMERA'
                        ? 'bg-[#7DD3FC]/15 text-[#7DD3FC] border border-[#7DD3FC]/30'
                        : 'bg-[#081426] text-slate-500 border border-slate-800'
                    }`}
                  >
                    {cam.sourceType === 'PHONE'
                      ? 'PHONE / WEBCAM'
                      : cam.sourceType === 'IP_CAMERA'
                      ? 'IP CAMERA'
                      : 'SIMULATED'}
                  </span>

                  <span className="text-[8px] text-slate-500">{cam.fps} FPS</span>
                </div>

                {/* Live / Simulated Optical Feed Preview */}
                <LiveCameraCardFeed camera={cam} heightClass="h-28" />

                {/* Metadata */}
                <div className="space-y-1 text-[10px]">
                  <div className="text-slate-400 truncate">
                    SECTOR: <span className="text-slate-200">{cam.sector}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>LATENCY: <span className="text-slate-200">{cam.latencyMs}ms</span></span>
                    <span>COVERAGE: <span className="text-[#00C2FF]">{cam.coverageAngle}°</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-br overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#00C2FF]/20 text-[10px] text-slate-400 bg-[#081426]/60">
              <tr>
                <th className="p-3">NODE ID</th>
                <th className="p-3">SOURCE</th>
                <th className="p-3">SECTOR / ZONE</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">FPS</th>
                <th className="p-3">LATENCY</th>
                <th className="p-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00C2FF]/10 text-[11px]">
              {filteredCameras.map((cam) => {
                const hasAlert = cam.id === 'cam-12' || cam.id === 'cam-09';
                return (
                  <tr
                    key={cam.id}
                    onClick={() => setSelectedNode(cam)}
                    className="hover:bg-[#00C2FF]/5 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-white">{cam.name}</td>
                    <td className="p-3">
                      <span className="text-[9px] text-[#7DD3FC]">
                        {cam.sourceType || 'SIMULATED'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{cam.sector}</td>
                    <td className="p-3">
                      <Badge
                        status={hasAlert ? 'WARNING' : 'ONLINE'}
                        label={hasAlert ? 'FLAGGED' : 'ONLINE'}
                        size="sm"
                      />
                    </td>
                    <td className="p-3 text-slate-300">{cam.fps} FPS</td>
                    <td className="p-3 text-slate-300">{cam.latencyMs}ms</td>
                    <td className="p-3">
                      <button className="text-[10px] text-[#00C2FF] hover:underline">
                        INSPECT
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-out Camera Detail Drawer */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-[#0D1B2A] border-l border-[#00C2FF]/40 shadow-glow-cyan p-6 overflow-y-auto space-y-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#00C2FF]/20 pb-3">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-[#00C2FF]" />
                <h3 className="text-lg font-bold text-white tracking-wider">{selectedNode.name}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  setTestResult(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Source Tag in Drawer */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">HARDWARE TYPE:</span>
              <span className="px-2 py-0.5 rounded bg-[#00C2FF]/15 border border-[#00C2FF]/40 text-[#00C2FF] font-semibold text-[10px]">
                {selectedNode.sourceType || 'SIMULATED OPTICAL FEED'}
              </span>
            </div>

            {/* Live / Simulated Optical Sensor Feed */}
            <div className="space-y-2">
              <div className="text-[10px] text-slate-400 tracking-wider">OPTICAL SENSOR FEED</div>
              <LiveCameraCardFeed camera={selectedNode} heightClass="h-48" isDrawer />
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#081426] border border-slate-700/60 rounded text-xs">
              <div>
                <span className="text-[9px] text-slate-500 block">UPTIME</span>
                <span className="text-white font-bold">99.98%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">OPTICAL MTF</span>
                <span className="text-[#22C55E] font-bold">0.92 PASS</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">SECTOR</span>
                <span className="text-slate-200">{selectedNode.sector}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">BACKHAUL PING</span>
                <span className="text-[#00C2FF] font-bold">{selectedNode.latencyMs}ms</span>
              </div>
            </div>

            {/* Recent ANPR Readings */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-white tracking-wider">
                RECENT ANPR PASSAGES
              </div>
              <div className="space-y-1.5 text-[11px]">
                {[
                  { plate: 'RJ14 AB 1234', time: '1m ago', speed: '43.8 km/h', match: '94.6%' },
                  { plate: 'UP16 BX 4099', time: '4m ago', speed: '48.2 km/h', match: '98.1%' },
                  { plate: 'DL08 CE 7120', time: '9m ago', speed: '39.0 km/h', match: '91.4%' },
                  { plate: 'MH12 KL 8831', time: '14m ago', speed: '52.7 km/h', match: '96.8%' },
                  { plate: 'KA03 MP 1192', time: '21m ago', speed: '45.1 km/h', match: '97.2%' },
                ].map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-[#081426] border border-slate-800 text-[10px]"
                  >
                    <div>
                      <span className="font-bold text-[#00C2FF] mr-2">{d.plate}</span>
                      <span className="text-slate-400">{d.speed}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#22C55E] font-semibold">{d.match}</span>
                      <span className="text-slate-500 block text-[8px]">{d.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Node Action */}
            <div className="pt-2 border-t border-[#00C2FF]/20 space-y-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleTestNode}
                disabled={isTesting}
                className="w-full"
                icon={<RotateCw size={14} className={isTesting ? 'animate-spin' : ''} />}
              >
                {isTesting ? 'RUNNING OPTICAL TELEMETRY CHECK...' : 'TEST NODE DIAGNOSTICS'}
              </Button>

              {testResult && (
                <div className="p-2.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/40 text-[10px] text-[#22C55E] flex items-center gap-2">
                  <CheckCircle2 size={14} className="flex-shrink-0" />
                  <span>{testResult}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Camera Modal */}
      <AddCameraModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRegisterCamera={handleRegisterCamera}
      />
    </div>
  );
};
