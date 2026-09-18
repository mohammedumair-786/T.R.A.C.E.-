/**
 * T.R.A.C.E. ANPR / OCR Optical Inference Pipeline
 * 
 * Performs client-side frame sampling and optical license plate recognition
 * on live Phone (Webcam) and IP Camera streams.
 */

export interface PlateDetectionResult {
  plate: string;
  confidence: number;
  vehicleType: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  timestamp: string;
  speed: string;
  isLive: boolean;
  cameraName: string;
  sector: string;
  personsCount?: number;
  objects?: any[];
}

export class ANPROpticalScanner {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private isScanning: boolean = false;
  private scanTimer: number | null = null;
  private onDetectionCallback: ((result: PlateDetectionResult) => void) | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  public setOnDetection(callback: (result: PlateDetectionResult) => void) {
    this.onDetectionCallback = callback;
  }

  /**
   * Start optical inference loop on a live HTMLVideoElement
   */
  public start(videoElement: HTMLVideoElement, cameraName: string, sector: string) {
    if (this.isScanning) return;
    this.isScanning = true;

    const sampleLoop = () => {
      if (!this.isScanning) return;
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
        this.processFrame(videoElement, cameraName, sector);
      }
      this.scanTimer = window.setTimeout(sampleLoop, 1200);
    };

    sampleLoop();
  }

  public stop() {
    this.isScanning = false;
    if (this.scanTimer !== null) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
  }

  /**
   * Samples a video frame and extracts license plate candidates
   */
  private async processFrame(video: HTMLVideoElement, cameraName: string, sector: string) {
    if (!this.ctx) return;

    this.canvas.width = video.videoWidth || 640;
    this.canvas.height = video.videoHeight || 480;
    this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);

    const frameB64 = this.canvas.toDataURL('image/jpeg');

    try {
      const response = await fetch('http://localhost:8000/api/anpr/process-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera_id: cameraName,
          frame_b64: frameB64
        })
      });
      const data = await response.json();
      
      if (this.onDetectionCallback) {
        this.onDetectionCallback({
          plate: data.plate || '',
          confidence: (data.confidence || 0) * 100, // backend returns 0-1
          vehicleType: 'Unknown',
          boundingBox: { x: 0, y: 0, width: 0, height: 0 },
          timestamp: 'Just now',
          speed: '0 km/h',
          isLive: true,
          cameraName,
          sector,
          personsCount: data.persons || 0,
          objects: data.objects || []
        });
      }
    } catch (e) {
      console.error("Failed to process frame:", e);
    }
  }
}
