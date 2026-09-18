export interface CameraNodeData {
  id: string;
  name: string;
  code: string;
  sector: string;
  position: [number, number, number]; // [x, y, z] in 3D world space
  status: 'ONLINE' | 'ACTIVE' | 'CALIBRATING' | 'ALERT';
  fps: number;
  latencyMs: number;
  coverageAngle: number;
  connectedTo: string[]; // IDs of neighboring nodes for data links
  sourceType?: 'SIMULATED' | 'PHONE' | 'IP_CAMERA';
  streamUrl?: string;
  mediaStream?: MediaStream;
}


export interface VehicleData {
  id: string;
  type: string;
  color: string;
  status: string;
  speed: string;
  plate: string;
  confidence: number;
  heading: string;
  lastIntersection: string;
}

export interface TrajectoryPoint {
  nodeId: string;
  cameraName: string;
  sector: string;
  timestamp: string;
  speedKmh: number;
  plateMatch: boolean;
  position: [number, number, number];
}

export interface SystemMetrics {
  activeCameraNodes: number;
  vehiclesAnalyzed: number;
  activeAlerts: number;
  systemStatus: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  citywideCoverage: number; // percentage
  peakTrafficWindow: string;
  congestionIndex: string;
  networkLatency: number; // ms
}

export const MOCK_METRICS: SystemMetrics = {
  activeCameraNodes: 24,
  vehiclesAnalyzed: 12486,
  activeAlerts: 8,
  systemStatus: 'ONLINE',
  citywideCoverage: 98.4,
  peakTrafficWindow: '18:00 – 19:00',
  congestionIndex: 'MODERATE (54%)',
  networkLatency: 14.2
};

export const TARGET_VEHICLE: VehicleData = {
  id: 'VEH-48291',
  type: 'SUV (URBAN INTERCEPTOR)',
  color: 'OBSIDIAN METALLIC',
  status: 'ACTIVE TRACKING',
  speed: '43.8 KM/H',
  plate: 'RJ14 AB 1234',
  confidence: 94.6,
  heading: 'SSE 158°',
  lastIntersection: 'AVENUE 7 & 4TH CROSSWAY'
};

// 24 camera nodes distributed across the procedural city
export const CAMERA_NODES: CameraNodeData[] = [
  { id: 'cam-01', name: 'CAM-DEMO-01', code: 'CAM-01', sector: 'Sector 4 North', position: [-25, 4, -30], status: 'ACTIVE', fps: 60, latencyMs: 12, coverageAngle: 110, connectedTo: ['cam-02', 'cam-05'] },
  { id: 'cam-02', name: 'CAM-DEMO-02', code: 'CAM-02', sector: 'Sector 4 East', position: [0, 4, -35], status: 'ONLINE', fps: 60, latencyMs: 14, coverageAngle: 90, connectedTo: ['cam-01', 'cam-03', 'cam-06'] },
  { id: 'cam-03', name: 'CAM-DEMO-03', code: 'CAM-03', sector: 'Financial District N', position: [25, 4, -30], status: 'ONLINE', fps: 59, latencyMs: 11, coverageAngle: 120, connectedTo: ['cam-02', 'cam-07'] },
  { id: 'cam-04', name: 'CAM-DEMO-04', code: 'CAM-04', sector: 'Port Gateway West', position: [-40, 4, -15], status: 'ONLINE', fps: 60, latencyMs: 15, coverageAngle: 85, connectedTo: ['cam-01', 'cam-08'] },
  { id: 'cam-05', name: 'CAM-DEMO-05', code: 'CAM-05', sector: 'Central Crossway', position: [-15, 4, -10], status: 'ACTIVE', fps: 60, latencyMs: 9, coverageAngle: 130, connectedTo: ['cam-01', 'cam-06', 'cam-09'] },
  { id: 'cam-06', name: 'CAM-DEMO-06', code: 'CAM-06', sector: 'Civic Center Plaza', position: [10, 4, -12], status: 'ONLINE', fps: 60, latencyMs: 13, coverageAngle: 100, connectedTo: ['cam-02', 'cam-05', 'cam-07', 'cam-10'] },
  { id: 'cam-07', name: 'CAM-DEMO-07', code: 'CAM-07', sector: 'Main Transit Corridor', position: [0, 4.5, 5], status: 'ACTIVE', fps: 60, latencyMs: 8, coverageAngle: 120, connectedTo: ['cam-05', 'cam-06', 'cam-09', 'cam-11'] },
  { id: 'cam-08', name: 'CAM-DEMO-08', code: 'CAM-08', sector: 'Industrial West Hub', position: [-35, 4, 10], status: 'ONLINE', fps: 58, latencyMs: 18, coverageAngle: 90, connectedTo: ['cam-04', 'cam-12'] },
  { id: 'cam-09', name: 'CAM-DEMO-09', code: 'CAM-09', sector: 'Financial Corridor South', position: [-10, 4, 20], status: 'ACTIVE', fps: 60, latencyMs: 10, coverageAngle: 115, connectedTo: ['cam-05', 'cam-07', 'cam-12', 'cam-13'] },
  { id: 'cam-10', name: 'CAM-DEMO-10', code: 'CAM-10', sector: 'Metro Station East', position: [25, 4, 10], status: 'ONLINE', fps: 60, latencyMs: 14, coverageAngle: 95, connectedTo: ['cam-06', 'cam-11', 'cam-14'] },
  { id: 'cam-11', name: 'CAM-DEMO-11', code: 'CAM-11', sector: 'Technology Boulevard', position: [18, 4, 25], status: 'ONLINE', fps: 60, latencyMs: 12, coverageAngle: 105, connectedTo: ['cam-07', 'cam-10', 'cam-15'] },
  { id: 'cam-12', name: 'CAM-DEMO-12', code: 'CAM-12', sector: 'Harbor Expressway', position: [5, 4, 38], status: 'ACTIVE', fps: 60, latencyMs: 11, coverageAngle: 125, connectedTo: ['cam-09', 'cam-11', 'cam-16'] },
  { id: 'cam-13', name: 'CAM-DEMO-13', code: 'CAM-13', sector: 'Aero Boulevard', position: [-25, 4, 35], status: 'ONLINE', fps: 59, latencyMs: 16, coverageAngle: 90, connectedTo: ['cam-09', 'cam-12', 'cam-17'] },
  { id: 'cam-14', name: 'CAM-DEMO-14', code: 'CAM-14', sector: 'High-Tech Zone C', position: [35, 4, 25], status: 'ONLINE', fps: 60, latencyMs: 13, coverageAngle: 85, connectedTo: ['cam-10', 'cam-18'] },
  { id: 'cam-15', name: 'CAM-DEMO-15', code: 'CAM-15', sector: 'Skyway Overpass', position: [22, 4, 45], status: 'ONLINE', fps: 60, latencyMs: 15, coverageAngle: 100, connectedTo: ['cam-11', 'cam-16', 'cam-19'] },
  { id: 'cam-16', name: 'CAM-DEMO-16', code: 'CAM-16', sector: 'Perimeter Ring South', position: [0, 4, 52], status: 'ONLINE', fps: 60, latencyMs: 12, coverageAngle: 110, connectedTo: ['cam-12', 'cam-15', 'cam-20'] },
  { id: 'cam-17', name: 'CAM-DEMO-17', code: 'CAM-17', sector: 'Logistics Depot SW', position: [-38, 4, 50], status: 'ONLINE', fps: 57, latencyMs: 19, coverageAngle: 80, connectedTo: ['cam-13', 'cam-21'] },
  { id: 'cam-18', name: 'CAM-DEMO-18', code: 'CAM-18', sector: 'Maritime Freight Yard', position: [42, 4, 5], status: 'ONLINE', fps: 60, latencyMs: 17, coverageAngle: 90, connectedTo: ['cam-14', 'cam-22'] },
  { id: 'cam-19', name: 'CAM-DEMO-19', code: 'CAM-19', sector: 'Coastal Gateway SE', position: [30, 4, 60], status: 'ONLINE', fps: 60, latencyMs: 14, coverageAngle: 105, connectedTo: ['cam-15', 'cam-23'] },
  { id: 'cam-20', name: 'CAM-DEMO-20', code: 'CAM-20', sector: 'South Terminal Junction', position: [-12, 4, 62], status: 'ONLINE', fps: 60, latencyMs: 13, coverageAngle: 115, connectedTo: ['cam-16', 'cam-21', 'cam-24'] },
  { id: 'cam-21', name: 'CAM-DEMO-21', code: 'CAM-21', sector: 'Outer Ring Freeway', position: [-45, 4, -2], status: 'ONLINE', fps: 58, latencyMs: 20, coverageAngle: 85, connectedTo: ['cam-08', 'cam-17'] },
  { id: 'cam-22', name: 'CAM-DEMO-22', code: 'CAM-22', sector: 'East Arterial Bridge', position: [45, 4, -20], status: 'ONLINE', fps: 60, latencyMs: 15, coverageAngle: 90, connectedTo: ['cam-03', 'cam-18'] },
  { id: 'cam-23', name: 'CAM-DEMO-23', code: 'CAM-23', sector: 'Waterfront Parkway', position: [15, 4, 70], status: 'ONLINE', fps: 59, latencyMs: 16, coverageAngle: 95, connectedTo: ['cam-19', 'cam-20'] },
  { id: 'cam-24', name: 'CAM-DEMO-24', code: 'CAM-24', sector: 'South Outer Tollway', position: [-25, 4, 75], status: 'ONLINE', fps: 60, latencyMs: 14, coverageAngle: 100, connectedTo: ['cam-20', 'cam-23'] },
];

export const TRAJECTORY_SEQUENCE: TrajectoryPoint[] = [
  { nodeId: 'cam-01', cameraName: 'CAM-DEMO-01', sector: 'Sector 4 North', timestamp: '00:42:15 UTC', speedKmh: 46.2, plateMatch: true, position: [-25, 1, -30] },
  { nodeId: 'cam-05', cameraName: 'CAM-DEMO-05', sector: 'Central Crossway', timestamp: '00:43:02 UTC', speedKmh: 44.5, plateMatch: true, position: [-15, 1, -10] },
  { nodeId: 'cam-07', cameraName: 'CAM-DEMO-07', sector: 'Main Transit Corridor', timestamp: '00:43:28 UTC', speedKmh: 43.8, plateMatch: true, position: [0, 1, 5] },
  { nodeId: 'cam-09', cameraName: 'CAM-DEMO-09', sector: 'Financial Corridor South', timestamp: '00:43:48 UTC', speedKmh: 42.1, plateMatch: true, position: [-10, 1, 20] },
  { nodeId: 'cam-12', cameraName: 'CAM-DEMO-12', sector: 'Harbor Expressway', timestamp: '00:44:31 UTC', speedKmh: 48.0, plateMatch: true, position: [5, 1, 38] },
];

export const SYSTEM_ALERTS = [
  {
    id: 'alt-01',
    level: 'warning' as const,
    title: 'TRAFFIC ANOMALY DETECTED',
    camera: 'CAM-DEMO-12',
    sector: 'Harbor Expressway',
    priority: 'MEDIUM',
    color: '#F59E0B',
    message: 'Sudden deceleration cluster observed at Ramp 4B. Congestion threshold exceeded by +28%.'
  },
  {
    id: 'alt-02',
    level: 'critical' as const,
    title: 'SYSTEM ALERT',
    camera: 'CAM-DEMO-09',
    sector: 'Financial Corridor South',
    priority: 'HIGH',
    color: '#FF3B4E',
    message: 'Vehicle speed disparity flagged: trajectory cross-correlation verification in progress.'
  }
];
