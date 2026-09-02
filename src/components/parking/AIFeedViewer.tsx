'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AIDetectionResult } from '@/types';
import { STANDARD_NORMALIZED_POLYGONS } from '@/lib/slot-polygons';
import { Video, Upload, Sparkles, Cpu, CheckCircle2, Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIFeedViewer() {
  const [activeSample, setActiveSample] = useState<string>('sample_parking_1.jpg');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [autoSyncDb, setAutoSyncDb] = useState<boolean>(true);
  const [aiServiceStatus, setAiServiceStatus] = useState<{ online: boolean; model?: string }>({ online: true });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);

  const checkAiHealth = async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const json = await res.json();
        setAiServiceStatus(json);
      }
    } catch {
      setAiServiceStatus({ online: false });
    }
  };

  const runDetection = async (sampleName?: string, fileToUpload?: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (fileToUpload) {
        formData.append('file', fileToUpload);
        // Create an image object to draw user uploaded image onto canvas
        const img = new Image();
        img.src = URL.createObjectURL(fileToUpload);
        img.onload = () => {
          uploadedImageRef.current = img;
        };
      } else {
        uploadedImageRef.current = null;
        formData.append('sample_name', sampleName || activeSample);
      }

      if (autoSyncDb) {
        formData.append('sync_database', 'true');
      }

      const res = await fetch('/api/ai/detect', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setDetectionResult(data);
      }
    } catch (error) {
      console.error('AI Detection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAiHealth();
    runDetection(activeSample);
  }, []);

  const handleSelectSample = (sample: string) => {
    uploadedImageRef.current = null;
    setActiveSample(sample);
    runDetection(sample);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      runDetection(undefined, file);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !detectionResult) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    // Draw background or uploaded image
    if (uploadedImageRef.current && uploadedImageRef.current.complete) {
      ctx.drawImage(uploadedImageRef.current, 0, 0, width, height);
      // Dark overlay for HUD contrast
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, height);
    } else if (detectionResult.annotated_image) {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${detectionResult.annotated_image}`;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      return;
    } else {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 3;
      ctx.setLineDash([30, 30]);
      ctx.beginPath();
      ctx.moveTo(30, height * 0.5);
      ctx.lineTo(width - 30, height * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const slotStatus = detectionResult.slot_status || {};
    for (const [slotId, pts] of Object.entries(STANDARD_NORMALIZED_POLYGONS)) {
      const status = slotStatus[slotId] || 'AVAILABLE';
      const color = status === 'OCCUPIED' ? 'rgba(239, 68, 68, 0.40)' : status === 'RESERVED' ? 'rgba(250, 204, 21, 0.40)' : 'rgba(34, 197, 94, 0.40)';
      const borderColor = status === 'OCCUPIED' ? '#EF4444' : status === 'RESERVED' ? '#FACC15' : '#22C55E';
      const pxPts = pts.map(([x, y]) => [x * width, y * height]);

      if (showPolygons) {
        ctx.fillStyle = color;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pxPts[0][0], pxPts[0][1]);
        for (let i = 1; i < pxPts.length; i++) ctx.lineTo(pxPts[i][0], pxPts[i][1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      const cx = (pxPts[0][0] + pxPts[1][0]) / 2;
      const cy = (pxPts[0][1] + pxPts[2][1]) / 2;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(cx - 42, cy - 14, 84, 28);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 42, cy - 14, 84, 28);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${slotId}: ${status === 'OCCUPIED' ? 'BUSY' : status === 'RESERVED' ? 'RESV' : 'FREE'}`, cx, cy);
    }

    // Top HUD Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, 0, width, 58);
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 15px Poppins, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LIVE AI FEED — FASTAPI + YOLOV8 REAL-TIME INFERENCE', 24, 26);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`TOTAL: ${detectionResult.total_slots || 8} | OCCUPIED: ${detectionResult.occupied_slots || 0} | AVAILABLE: ${detectionResult.available_slots || 0} | RATE: ${detectionResult.occupancy_percentage || 0}%`, 24, 46);
  }, [detectionResult, showBoxes, showPolygons]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-heading">
              <Video className="w-5 h-5 text-blue-600" /> AI Computer Vision Camera Feed
            </h3>
            <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1', aiServiceStatus.online ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
              <span className={cn('w-2 h-2 rounded-full', aiServiceStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
              {aiServiceStatus.online ? 'FastAPI Microservice (Port 8000)' : 'Fallback Simulation'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Real-time YOLOv8 neural network vehicle detection and slot occupancy sync.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} leftIcon={<Upload className="w-4 h-4" />}>
            Upload Camera Media
          </Button>
          <Button size="sm" onClick={() => runDetection()} isLoading={isLoading} leftIcon={<Sparkles className="w-4 h-4" />}>
            Run AI Inference
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/80 p-2.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase px-2">Preset Feeds:</span>
          <button
            onClick={() => handleSelectSample('sample_parking_1.jpg')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', activeSample === 'sample_parking_1.jpg' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200')}
          >
            Scene 1: Standard Parking
          </button>
          <button
            onClick={() => handleSelectSample('sample_parking_2.jpg')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', activeSample === 'sample_parking_2.jpg' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200')}
          >
            Scene 2: Light Traffic
          </button>
          <button
            onClick={() => handleSelectSample('sample_parking_3.jpg')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', activeSample === 'sample_parking_3.jpg' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200')}
          >
            Scene 3: Rush Hour
          </button>
        </div>

        <div className="flex items-center gap-2 px-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSyncDb}
              onChange={(e) => setAutoSyncDb(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1 text-blue-700">
              <Zap className="w-3.5 h-3.5" /> Auto-Sync to Database
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl aspect-video flex items-center justify-center">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-xs font-semibold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 live-indicator" />
              <span>LIVE CAM-01 (GROUND FLOOR)</span>
            </div>

            {detectionResult?.inference_time_ms && (
              <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{detectionResult.inference_time_ms} ms</span>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
                <Cpu className="w-10 h-10 text-blue-400 animate-spin" />
                <span className="text-sm font-semibold tracking-wide">YOLOv8 Processing Frame & Syncing...</span>
              </div>
            )}
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>

          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPolygons} onChange={(e) => setShowPolygons(e.target.checked)} />
                <span>Slot Polygons</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showBoxes} onChange={(e) => setShowBoxes(e.target.checked)} />
                <span>Vehicle Boxes</span>
              </label>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Microservice: FastAPI (v1.0.0) + Ultralytics YOLOv8</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" /> Real-Time Telemetry
              </span>
              {detectionResult?.synced_with_database && (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synced to Supabase
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block font-medium">Vehicles Detected</span>
                <span className="text-xl font-bold text-slate-900 font-heading">{detectionResult?.total_vehicles_detected ?? 0}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block font-medium">Occupancy Rate</span>
                <span className="text-xl font-bold text-blue-600 font-heading">{detectionResult?.occupancy_percentage ?? 0}%</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 block font-medium">Available Slots</span>
                <span className="text-xl font-bold text-emerald-700 font-heading">{detectionResult?.available_slots ?? 0}</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="text-[11px] text-red-700 block font-medium">Occupied Slots</span>
                <span className="text-xl font-bold text-red-700 font-heading">{detectionResult?.occupied_slots ?? 0}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Ground Floor Slot Matrix</span>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(detectionResult?.slot_status || {}).map(([slot, status]) => (
                  <div
                    key={slot}
                    className={cn(
                      'p-2 rounded-xl text-center border text-xs font-bold transition-all',
                      status === 'AVAILABLE' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      status === 'OCCUPIED' && 'bg-red-50 text-red-700 border-red-200',
                      status === 'RESERVED' && 'bg-amber-50 text-amber-700 border-amber-200'
                    )}
                  >
                    <div className="font-heading">{slot}</div>
                    <div className="text-[9px] uppercase tracking-tight opacity-80">
                      {status === 'AVAILABLE' ? 'FREE' : status === 'OCCUPIED' ? 'BUSY' : 'RESV'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
