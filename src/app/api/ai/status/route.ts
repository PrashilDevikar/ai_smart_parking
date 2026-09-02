import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const aiBase = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const res = await fetch(`${aiBase}/status`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        online: true,
        ...data,
      });
    }
  } catch (err: any) {
    // Offline
  }

  return NextResponse.json({
    online: false,
    model: 'yolov8n.pt (Offline Fallback)',
    mode: 'simulation',
  });
}
