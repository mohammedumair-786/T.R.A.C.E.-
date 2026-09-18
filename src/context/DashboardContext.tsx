import React, { createContext, useContext, useState, useEffect } from 'react';
import { CAMERA_NODES, CameraNodeData, TARGET_VEHICLE } from '../utils/mockData';
import { smsService, SMSDispatchResult } from '../services/smsService';

export type DashboardViewType =
  | 'overview'
  | 'live-map'
  | 'cameras'
  | 'trajectories'
  | 'alerts'
  | 'analytics'
  | 'settings';

export interface AlertItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  camera: string;
  sector: string;
  timestamp: string;
  message: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  isNew?: boolean;
}

export interface DetectionItem {
  id: string;
  plate: string;
  confidence: number;
  vehicleType: string;
  camera: string;
  sector: string;
  timestamp: string;
  speed: string;
  isLive?: boolean;
}

interface DashboardContextType {
  currentView: DashboardViewType;
  setCurrentView: (view: DashboardViewType) => void;
  kpiData: {
    totalVehicles: number;
    vehiclesTrend: string;
    activeNodes: number;
    totalNodes: number;
    activeAlerts: number;
    congestionIndex: number;
    congestionTrend: string;
  };
  cameraNodes: CameraNodeData[];
  registerCameraNode: (newCam: CameraNodeData) => void;
  alerts: AlertItem[];
  recentDetections: DetectionItem[];
  addLiveDetection: (detection: DetectionItem) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  acknowledgeAllAlerts: () => void;
  resolveAllAlerts: () => void;
  selectedCameraId: string | null;
  setSelectedCameraId: (id: string | null) => void;
  selectedVehiclePlate: string;
  setSelectedVehiclePlate: (plate: string) => void;
  smsDispatches: SMSDispatchResult[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-1092',
    title: 'RAPID VELOCITY DEVIATION',
    severity: 'CRITICAL',
    camera: 'CAM-DEMO-09',
    sector: 'Financial Corridor South',
    timestamp: 'Just now',
    message: 'Vehicle speed disparity flagged: trajectory correlation variance > 32 km/h.',
    status: 'NEW',
    isNew: true
  },
  {
    id: 'ALT-1091',
    title: 'TRAFFIC ANOMALY DETECTED',
    severity: 'WARNING',
    camera: 'CAM-DEMO-12',
    sector: 'Harbor Expressway',
    timestamp: '2 min ago',
    message: 'Sudden deceleration cluster observed at Ramp 4B. Capacity ratio exceeded.',
    status: 'NEW',
    isNew: false
  },
  {
    id: 'ALT-1090',
    title: 'OPTICAL SENSOR RE-CALIBRATED',
    severity: 'INFO',
    camera: 'CAM-DEMO-07',
    sector: 'Main Transit Corridor',
    timestamp: '5 min ago',
    message: 'ANPR HDR contrast profile dynamically adjusted for low-light transition.',
    status: 'ACKNOWLEDGED',
    isNew: false
  },
  {
    id: 'ALT-1089',
    title: 'INTERSECTION OCCUPANCY SPIKE',
    severity: 'WARNING',
    camera: 'CAM-DEMO-05',
    sector: 'Central Crossway',
    timestamp: '11 min ago',
    message: 'Cycle duration exceeded baseline threshold by +14s.',
    status: 'RESOLVED',
    isNew: false
  },
  {
    id: 'ALT-1088',
    title: 'NODE LINK LATENCY NORMALIZED',
    severity: 'INFO',
    camera: 'CAM-DEMO-01',
    sector: 'Sector 4 North',
    timestamp: '18 min ago',
    message: 'Telemetry ping stabilized at 12ms over optical backhaul.',
    status: 'RESOLVED',
    isNew: false
  }
];

const INITIAL_DETECTIONS: DetectionItem[] = [
  {
    id: 'DET-9821',
    plate: 'RJ14 AB 1234',
    confidence: 94.6,
    vehicleType: 'SUV (Urban Interceptor)',
    camera: 'CAM-DEMO-07',
    sector: 'Main Transit Corridor',
    timestamp: 'Just now',
    speed: '43.8 km/h'
  },
  {
    id: 'DET-9820',
    plate: 'DL01 XY 9081',
    confidence: 97.2,
    vehicleType: 'Sedan (Executive)',
    camera: 'CAM-DEMO-05',
    sector: 'Central Crossway',
    timestamp: '14s ago',
    speed: '51.2 km/h'
  },
  {
    id: 'DET-9819',
    plate: 'MH02 TR 4490',
    confidence: 92.8,
    vehicleType: 'EV Hatchback',
    camera: 'CAM-DEMO-09',
    sector: 'Financial Corridor South',
    timestamp: '32s ago',
    speed: '38.0 km/h'
  },
  {
    id: 'DET-9818',
    plate: 'KA05 ZQ 3102',
    confidence: 96.1,
    vehicleType: 'Light Commercial Van',
    camera: 'CAM-DEMO-03',
    sector: 'Financial District N',
    timestamp: '58s ago',
    speed: '46.5 km/h'
  },
  {
    id: 'DET-9817',
    plate: 'GA08 CC 8821',
    confidence: 98.4,
    vehicleType: 'Coupe',
    camera: 'CAM-DEMO-12',
    sector: 'Harbor Expressway',
    timestamp: '1m 12s ago',
    speed: '62.1 km/h'
  }
];

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<DashboardViewType>('overview');
  const [totalVehicles, setTotalVehicles] = useState(14892);
  const [congestionIndex, setCongestionIndex] = useState(54);
  const [cameraNodes, setCameraNodes] = useState<CameraNodeData[]>(() =>
    CAMERA_NODES.map((cam) => ({ ...cam, sourceType: 'SIMULATED' }))
  );
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [recentDetections, setRecentDetections] = useState<DetectionItem[]>(INITIAL_DETECTIONS);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>('cam-07');
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>(TARGET_VEHICLE.plate);
  const [smsDispatches, setSmsDispatches] = useState<SMSDispatchResult[]>([]);

  // Subscribe to SMS service events
  useEffect(() => {
    return smsService.subscribe((result) => {
      setSmsDispatches((prev) => [result, ...prev.slice(0, 9)]);
    });
  }, []);

  // Trigger automated SMS alert on initial critical violation
  useEffect(() => {
    const criticalAlert = INITIAL_ALERTS.find((a) => a.severity === 'CRITICAL');
    if (criticalAlert) {
      smsService.sendViolationSMS({
        incidentId: criticalAlert.id,
        title: criticalAlert.title,
        severity: 'CRITICAL',
        camera: criticalAlert.camera,
        sector: criticalAlert.sector,
        plateNumber: TARGET_VEHICLE.plate,
        timestamp: criticalAlert.timestamp,
        speed: '82.4 km/h (Limit: 50)',
        message: criticalAlert.message
      });
    }
  }, []);

  // Register a new live camera node (Phone / Webcam or IP Camera)
  const registerCameraNode = (newCam: CameraNodeData) => {
    setCameraNodes((prev) => [newCam, ...prev]);
    setSelectedCameraId(newCam.id);
  };

  // Add real-time live detection from live optical pipeline
  const addLiveDetection = (detection: DetectionItem) => {
    setRecentDetections((prev) => [detection, ...prev.slice(0, 9)]);
    setTotalVehicles((prev) => prev + 1);

    // If confidence is high and speed > 60 km/h, automatically trigger violation alert & SMS
    const speedNum = parseFloat(detection.speed);
    if (speedNum > 60) {
      const newAlert: AlertItem = {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        title: 'SPEED THRESHOLD EXCEEDED',
        severity: 'CRITICAL',
        camera: detection.camera,
        sector: detection.sector,
        timestamp: 'Just now',
        message: `Target ${detection.plate} clocked at ${detection.speed}. Automated citation flagged.`,
        status: 'NEW',
        isNew: true
      };
      setAlerts((prev) => [newAlert, ...prev]);

      // Pluggable SMS trigger
      smsService.sendViolationSMS({
        incidentId: newAlert.id,
        title: newAlert.title,
        severity: 'CRITICAL',
        camera: newAlert.camera,
        sector: newAlert.sector,
        plateNumber: detection.plate,
        timestamp: newAlert.timestamp,
        speed: detection.speed,
        message: newAlert.message
      });
    }
  };

  // Real-time WebSocket connection to backend
  useEffect(() => {
    // Initial fetch of cameras
    fetch('http://localhost:8000/api/cameras')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedCams = data.map((cam: any) => ({
            id: cam.id,
            name: cam.name,
            lat: cam.lat,
            lng: cam.lng,
            status: cam.status === 'online' ? 'active' : 'offline',
            sourceType: cam.is_simulated ? 'SIMULATED' : 'PHONE',
            sector: cam.sector,
            fps: cam.fps,
            latency: 12 + Math.floor(Math.random() * 10)
          }));
          setCameraNodes(mappedCams);
        }
      })
      .catch(console.error);

    // Initial fetch of alerts
    fetch('http://localhost:8000/api/alerts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedAlerts = data.map((a: any) => ({
            id: a.id.toString(),
            title: a.title,
            severity: a.severity.toUpperCase(),
            camera: a.camera_id,
            sector: 'Unknown',
            timestamp: new Date(a.timestamp).toLocaleTimeString(),
            message: a.title,
            status: a.status.toUpperCase(),
            isNew: false
          }));
          setAlerts(mappedAlerts);
        }
      })
      .catch(console.error);

    // Connect WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'new_detection') {
          const d = msg.data;
          setTotalVehicles(prev => prev + 1);
          setRecentDetections(prev => [{
            id: `DET-${d.id}`,
            plate: d.plate,
            confidence: +(d.confidence * 100).toFixed(1),
            vehicleType: 'Unknown',
            camera: d.camera_id,
            sector: 'Unknown',
            timestamp: new Date(d.timestamp).toLocaleTimeString(),
            speed: `${parseFloat(d.speed).toFixed(1)} km/h`,
            isLive: false
          }, ...prev.slice(0, 9)]);
        } else if (msg.type === 'new_alert') {
          const a = msg.data;
          setAlerts(prev => [{
            id: a.id.toString(),
            title: a.title,
            severity: 'CRITICAL',
            camera: 'Unknown',
            sector: 'Unknown',
            timestamp: 'Just now',
            message: a.title,
            status: 'NEW',
            isNew: true
          }, ...prev]);
        }
      } catch (e) {
        console.error("WS Parse error", e);
      }
    };

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, []);

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED', isNew: false } : a))
    );
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED', isNew: false } : a))
    );
  };

  const acknowledgeAllAlerts = () => {
    setAlerts((prev) =>
      prev.map((a) => (a.status === 'NEW' ? { ...a, status: 'ACKNOWLEDGED', isNew: false } : a))
    );
  };

  const resolveAllAlerts = () => {
    setAlerts((prev) =>
      prev.map((a) => ({ ...a, status: 'RESOLVED', isNew: false }))
    );
  };

  const activeAlertsCount = alerts.filter((a) => a.status !== 'RESOLVED').length;

  return (
    <DashboardContext.Provider
      value={{
        currentView,
        setCurrentView,
        kpiData: {
          totalVehicles,
          vehiclesTrend: '+8.4% vs yesterday',
          activeNodes: cameraNodes.length,
          totalNodes: cameraNodes.length,
          activeAlerts: activeAlertsCount,
          congestionIndex,
          congestionTrend: '-2.1% vs peak'
        },
        cameraNodes,
        registerCameraNode,
        alerts,
        recentDetections,
        addLiveDetection,
        acknowledgeAlert,
        resolveAlert,
        acknowledgeAllAlerts,
        resolveAllAlerts,
        selectedCameraId,
        setSelectedCameraId,
        selectedVehiclePlate,
        setSelectedVehiclePlate,
        smsDispatches
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
