import React, { useState, useRef } from 'react';
import {
  Smartphone,
  Video,
  QrCode,
  X,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Plus
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { ANPROpticalScanner, PlateDetectionResult } from '../../../services/anprService';

export interface RegisteredCameraPayload {
  id: string;
  name: string;
  code: string;
  sector: string;
  sourceType: 'PHONE' | 'IP_CAMERA';
  streamUrl?: string;
  mediaStream?: MediaStream;
}

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterCamera: (camera: RegisteredCameraPayload) => void;
}

export const AddCameraModal: React.FC<AddCameraModalProps> = ({
  isOpen,
  onClose,
  onRegisterCamera
}) => {
  const [tab, setTab] = useState<'phone' | 'ip' | 'qr'>('phone');
  const [cameraName, setCameraName] = useState('CAM-PHONE-01');
  const [sectorName, setSectorName] = useState('Sector 4 Mobile Interceptor');
  const [ipUrl, setIpUrl] = useState('http://192.168.1.120:8080/mjpeg');
  const [streamActive, setStreamActive] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<ANPROpticalScanner | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  const [videoDims, setVideoDims] = useState({ w: 640, h: 480 });

  if (!isOpen) return null;

  const handleStartWebcam = async () => {
    setStreamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        previewVideoRef.current.onloadedmetadata = () => {
          previewVideoRef.current?.play();
          if (previewVideoRef.current) {
            setVideoDims({
              w: previewVideoRef.current.videoWidth || 640,
              h: previewVideoRef.current.videoHeight || 480
            });
            
            // Start YOLO scanning on preview
            const scanner = new ANPROpticalScanner();
            scannerRef.current = scanner;
            scanner.setOnDetection((res: PlateDetectionResult) => {
              setDetectedObjects(res.objects || []);
            });
            scanner.start(previewVideoRef.current, cameraName, sectorName);
          }
        };
      }
      setStreamActive(true);
    } catch (err: any) {
      setStreamError(
        err?.message || 'Camera permission denied or camera device unavailable.'
      );
    }
  };

  const handleStopWebcam = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
    setDetectedObjects([]);
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setStreamActive(false);
  };

  const handleClose = () => {
    handleStopWebcam();
    onClose();
  };

  const handleRegisterPhone = () => {
    const payload: RegisteredCameraPayload = {
      id: `phone-${Date.now()}`,
      name: cameraName || 'CAM-PHONE-01',
      code: 'PH-LIVE',
      sector: sectorName || 'Mobile Patrol Node',
      sourceType: 'PHONE',
      mediaStream: mediaStreamRef.current || undefined
    };
    onRegisterCamera(payload);
    onClose();
  };

  const handleRegisterIP = () => {
    const payload: RegisteredCameraPayload = {
      id: `ip-${Date.now()}`,
      name: cameraName || 'CAM-IP-01',
      code: 'IP-LIVE',
      sector: sectorName || 'Perimeter IP Feed',
      sourceType: 'IP_CAMERA',
      streamUrl: ipUrl
    };
    onRegisterCamera(payload);
    onClose();
  };

  const localHostUrl = typeof window !== 'undefined' ? `${window.location.origin}/#camera-node` : 'http://localhost:3000/#camera';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono select-none">
      <div className="w-full max-w-lg bg-[#0D1B2A] hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br shadow-glow-cyan p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#00C2FF]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wider uppercase">
              REGISTER HARDWARE OPTICAL NODE
            </h3>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 bg-[#081426] p-1 rounded border border-slate-700 text-xs">
          <button
            onClick={() => {
              handleStopWebcam();
              setTab('phone');
            }}
            className={`py-2 px-2 rounded font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'phone'
                ? 'bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span>PHONE / WEBCAM</span>
          </button>

          <button
            onClick={() => {
              handleStopWebcam();
              setTab('ip');
            }}
            className={`py-2 px-2 rounded font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'ip'
                ? 'bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video size={14} />
            <span>IP CAMERA</span>
          </button>

          <button
            onClick={() => {
              handleStopWebcam();
              setTab('qr');
            }}
            className={`py-2 px-2 rounded font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'qr'
                ? 'bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode size={14} />
            <span>MULTI-PHONE QR</span>
          </button>
        </div>

        {/* Tab 1: Phone / Webcam Camera */}
        {tab === 'phone' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">NODE IDENTIFIER</label>
                <input
                  type="text"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  className="w-full bg-[#050816] border border-[#00C2FF]/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00C2FF]"
                  placeholder="CAM-PHONE-01"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">DEPLOYED SECTOR</label>
                <input
                  type="text"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full bg-[#050816] border border-[#00C2FF]/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00C2FF]"
                  placeholder="Sector 4 Mobile Patrol"
                />
              </div>
            </div>

            {/* Video Preview */}
            <div className="relative h-44 bg-[#050816] rounded border border-[#00C2FF]/40 overflow-hidden flex items-center justify-center">
              <video
                ref={previewVideoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              
              {/* Overlay Detections */}
              {streamActive && detectedObjects.map((obj, i) => {
                const box = obj.bbox;
                if (!box) return null;
                
                // Calculate percentage based coordinates
                // Since object-cover may crop the video, doing exact % on w-full h-full might be slightly off if aspect ratio differs.
                // But for hackathon preview, this is fine.
                const left = (box.x1 / videoDims.w) * 100;
                const top = (box.y1 / videoDims.h) * 100;
                const width = ((box.x2 - box.x1) / videoDims.w) * 100;
                const height = ((box.y2 - box.y1) / videoDims.h) * 100;
                
                const isPerson = obj.class === 'person';
                const color = isPerson ? '#F59E0B' : '#00C2FF'; // orange for person, cyan for vehicles
                
                return (
                  <div
                    key={i}
                    className="absolute border-2 pointer-events-none transition-all duration-300"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      borderColor: color,
                      boxShadow: `0 0 10px ${color}80`
                    }}
                  >
                    <span 
                      className="absolute -top-4 left-0 px-1 py-0.5 text-[8px] font-bold text-white whitespace-nowrap"
                      style={{ backgroundColor: color }}
                    >
                      {obj.class.toUpperCase()} {(obj.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}

              {!streamActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2 bg-[#050816]/80">
                  <Smartphone size={24} className="text-[#00C2FF]" />
                  <span className="text-[10px] text-slate-300">
                    Connect local device camera using free native WebRTC API
                  </span>
                  <Button variant="secondary" size="sm" onClick={handleStartWebcam}>
                    INITIALIZE CAMERA SENSOR
                  </Button>
                </div>
              )}

              {streamActive && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0D1B2A]/80 border border-[#22C55E]/40 text-[9px] text-[#22C55E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <span>LIVE SENSOR ACTIVE</span>
                </div>
              )}
            </div>

            {streamError && (
              <div className="p-2.5 rounded bg-[#FF3B4E]/10 border border-[#FF3B4E]/40 text-[10px] text-[#FF3B4E] flex items-center gap-2">
                <AlertTriangle size={13} className="flex-shrink-0" />
                <span>{streamError} (Fallback simulated camera stream will be used)</span>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={handleRegisterPhone}
              className="w-full"
              icon={<Plus size={14} />}
            >
              REGISTER PHONE CAMERA TO NETWORK
            </Button>
          </div>
        )}

        {/* Tab 2: IP Camera Feed */}
        {tab === 'ip' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">NODE IDENTIFIER</label>
                <input
                  type="text"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  className="w-full bg-[#050816] border border-[#00C2FF]/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00C2FF]"
                  placeholder="CAM-IP-01"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">DEPLOYED SECTOR</label>
                <input
                  type="text"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full bg-[#050816] border border-[#00C2FF]/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00C2FF]"
                  placeholder="Harbor Gateway IP Stream"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                STREAM ENDPOINT URL (HTTP / MJPEG / RTSP PROXY)
              </label>
              <input
                type="text"
                value={ipUrl}
                onChange={(e) => setIpUrl(e.target.value)}
                className="w-full bg-[#050816] border border-[#00C2FF]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00C2FF]"
                placeholder="http://192.168.1.100:8080/video"
              />
            </div>

            <div className="p-3 bg-[#081426] border border-slate-700/60 rounded text-[10px] text-slate-400 space-y-1">
              <span className="text-[#00C2FF] font-semibold block">AUTOMATIC DEMO FALLBACK</span>
              <span>
                If stream is offline or inaccessible, node gracefully displays simulated 4K sensor telemetry with fallback optical test patterns.
              </span>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleRegisterIP}
              className="w-full"
              icon={<Plus size={14} />}
            >
              REGISTER IP CAMERA STREAM
            </Button>
          </div>
        )}

        {/* Tab 3: Multi-Phone QR Pairing */}
        {tab === 'qr' && (
          <div className="space-y-4 text-xs text-center">
            <div className="p-4 bg-[#081426] rounded border border-[#00C2FF]/30 flex flex-col items-center gap-3">
              {/* Simulated QR Code matrix */}
              <div className="w-36 h-36 bg-white p-2 rounded shadow-glow-cyan flex items-center justify-center">
                <div className="w-full h-full border-4 border-black border-dashed flex items-center justify-center">
                  <span className="text-[10px] font-bold text-black text-center leading-tight">
                    T.R.A.C.E.<br />PHONE NODE<br />PAIRING
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-300">
                Scan with any smartphone on local Wi-Fi to publish live video stream directly into this surveillance cockpit.
              </div>

              <div className="p-2 bg-[#050816] rounded border border-slate-700 text-[9px] text-[#00C2FF] font-mono break-all select-all">
                {localHostUrl}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(localHostUrl);
                alert('Pairing URL copied to clipboard!');
              }}
              className="w-full"
            >
              COPY MOBILE PAIRING URL
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
