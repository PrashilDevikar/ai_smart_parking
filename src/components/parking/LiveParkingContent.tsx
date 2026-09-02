'use client';
import React from 'react';
import { AIFeedViewer } from '@/components/parking/AIFeedViewer';
import { Sparkles } from 'lucide-react';

export default function LiveParkingContent() {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Computer Vision Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Live AI Parking & Vehicle Detection
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time YOLO vehicle bounding boxes and geometric parking slot occupancy evaluation.
        </p>
      </div>
      <AIFeedViewer />
    </div>
  );
}
