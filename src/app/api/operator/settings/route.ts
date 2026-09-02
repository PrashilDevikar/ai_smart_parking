import { NextRequest, NextResponse } from 'next/server';

let systemSettings = {
  parkingName: 'AI Smart Parking Grand Terminal',
  pricePerHour: 5.0,
  floorsCount: 3,
  openingHour: '06:00',
  closingHour: '23:59',
  aiConfidenceThreshold: 0.30,
  autoReleaseMinutes: 15,
};

export async function GET() {
  return NextResponse.json({ success: true, settings: systemSettings });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    systemSettings = { ...systemSettings, ...body };
    return NextResponse.json({ success: true, settings: systemSettings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
