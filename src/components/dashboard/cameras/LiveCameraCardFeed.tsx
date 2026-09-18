import React, { useEffect, useRef, useState } from 'react';
import { CameraNodeData } from '../../../utils/mockData';
import { ANPROpticalScanner, PlateDetectionResult } from '../../../services/anprService';
import { useDashboard } from '../../../context/DashboardContext';

interface LiveCameraCardFeedProps {
  camera: CameraNodeData;
  heightClass?: string;
  isDrawer?: boolean;
}

export const LiveCameraCardFeed: React.FC<LiveCameraCardFeedProps> = ({
  camera,
  heightClass = 'h-28',
  isDrawer = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<ANPROpticalScanner | null>(null);
  const { addLiveDetection } = useDashboard();
  const [personsCount, setPersonsCount] = useState<number>(0);
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  const [videoDims, setVideoDims] = useState({ w: 640, h: 480 });

  useEffect(() => {
    if (camera.sourceType === 'PHONE' && camera.mediaStream && videoRef.current) {
      videoRef.current.srcObject = camera.mediaStream;
      videoRef.current.play().catch(() => {});

      // Initialize ANPR Optical Scanner on live feed
      const scanner = new ANPROpticalScanner();
      scannerRef.current = scanner;

      scanner.setOnDetection((res: PlateDetectionResult) => {
        if (res.personsCount !== undefined) {
          setPersonsCount(res.personsCount);
        }
        
        if (res.objects) {
          setDetectedObjects(res.objects);
        }

        if (videoRef.current) {
          setVideoDims({ w: videoRef.current.videoWidth || 640, h: videoRef.current.videoHeight || 480 });
        }
        
        if (res.plate) {
          addLiveDetection({
            id: `LIVE-${Date.now().toString().slice(-4)}`,
            plate: res.plate,
            confidence: res.confidence,
            vehicleType: res.vehicleType,
            camera: camera.name,
            sector: camera.sector,
            timestamp: 'Just now',
            speed: res.speed,
            isLive: true
          });
        }
      });

      scanner.start(videoRef.current, camera.name, camera.sector);

      return () => {
        scanner.stop();
      };
    }
  }, [camera, addLiveDetection]);

  // If Phone or Webcam camera with active stream
  if (camera.sourceType === 'PHONE' && camera.mediaStream) {
    return (
      <div className={`relative ${heightClass} bg-[#050816] rounded border border-[#00C2FF]/60 overflow-hidden mb-3 flex items-center justify-center shadow-[0_0_15px_rgba(0,194,255,0.2)]`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Optical Scanning Line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-[#00C2FF] opacity-80 animate-scanline shadow-[0_0_8px_#00C2FF]" />

        {/* Optical HUD Target Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-16 h-12 border-2 border-dashed border-[#00C2FF]" />
        </div>

        {/* Detection Boxes Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ objectFit: 'cover' }}
          viewBox={`0 0 ${videoDims.w} ${videoDims.h}`}
          preserveAspectRatio="xMidYMid slice"
        >
          {detectedObjects.map((obj, i) => {
            let strokeColor = '#00C2FF'; // default cyan
            if (obj.class === 'person') strokeColor = '#F59E0B'; // orange
            else if (obj.class === 'car') strokeColor = '#22C55E'; // green
            else if (obj.class === 'number plate') strokeColor = '#EF4444'; // red

            return (
              <g key={i}>
                <rect
                  x={obj.bbox.x1}
                  y={obj.bbox.y1}
                  width={obj.bbox.x2 - obj.bbox.x1}
                  height={obj.bbox.y2 - obj.bbox.y1}
                  fill="transparent"
                  stroke={strokeColor}
                  strokeWidth="2"
                />
                <text
                  x={obj.bbox.x1}
                  y={obj.bbox.y1 - 5}
                  fill={strokeColor}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {obj.class.toUpperCase()} {obj.text ? `(${obj.text})` : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Badge and AI Telemetry */}
        <div className="absolute bottom-1.5 left-2 z-10 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0D1B2A]/85 border border-[#22C55E]/40 text-[8px] text-[#22C55E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span>LIVE WEBCAM AI</span>
          </div>
          {personsCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0D1B2A]/85 border border-[#F59E0B]/50 text-[9px] text-[#F59E0B] font-bold tracking-wider">
              <span>PERSONS DETECTED: {personsCount}</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-1 right-2 text-[8px] text-[#7DD3FC]">
          60 FPS · 4K UHD
        </div>
      </div>
    );
  }

  // If IP Camera
  if (camera.sourceType === 'IP_CAMERA') {
    return (
      <div className={`relative ${heightClass} bg-[#050816] rounded border border-[#7DD3FC]/50 overflow-hidden mb-3 flex flex-col justify-between p-2`}>
        <div className="flex items-center justify-between text-[8px] text-[#7DD3FC] z-10">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            IP STREAM CONNECTED
          </span>
          <span className="truncate max-w-[120px]">{camera.streamUrl || 'RTSP/MJPEG'}</span>
        </div>

        {/* Scanline */}
        <div className="absolute inset-x-0 top-0 h-1 bg-[#7DD3FC] opacity-40 animate-scanline" />

        <div className="text-center text-[9px] text-slate-400 tracking-wider">
          LIVE IP SURVEILLANCE FEED
        </div>

        <div className="flex items-center justify-between text-[8px] text-slate-500 z-10">
          <span>BITRATE: 18.4 MBPS</span>
          <span className="text-[#7DD3FC]">ANPR ACTIVE</span>
        </div>
      </div>
    );
  }

  // Default Simulated Camera Feed (100% Intact from original design)
  return (
    <div className={`relative ${heightClass} bg-[#050816] rounded border border-slate-700/60 overflow-hidden mb-3 flex items-center justify-center`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-[#00C2FF] opacity-40 animate-scanline" />
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="w-12 h-12 border border-[#00C2FF]/40 rounded-full" />
      </div>
      <span className="text-[9px] text-slate-500 tracking-widest uppercase">
        SIMULATED OPTICAL FEED
      </span>
      <div className="absolute bottom-1 right-2 text-[8px] text-[#7DD3FC]">
        {camera.fps} FPS
      </div>
    </div>
  );
};
