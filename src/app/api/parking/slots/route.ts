import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Fallback 24 slots if tables are awaiting SQL migration in Supabase
const DEFAULT_SLOTS = [
  // Ground Floor
  { id: 'slot-A1', slotNumber: 'A1', floor: 'Ground Floor', vehicleType: 'CAR', status: 'OCCUPIED', pricePerHour: 5.0 },
  { id: 'slot-A2', slotNumber: 'A2', floor: 'Ground Floor', vehicleType: 'CAR', status: 'OCCUPIED', pricePerHour: 5.0 },
  { id: 'slot-A3', slotNumber: 'A3', floor: 'Ground Floor', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-A4', slotNumber: 'A4', floor: 'Ground Floor', vehicleType: 'CAR', status: 'OCCUPIED', pricePerHour: 5.0 },
  { id: 'slot-A5', slotNumber: 'A5', floor: 'Ground Floor', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-A6', slotNumber: 'A6', floor: 'Ground Floor', vehicleType: 'CAR', status: 'OCCUPIED', pricePerHour: 5.0 },
  { id: 'slot-A7', slotNumber: 'A7', floor: 'Ground Floor', vehicleType: 'EV',  status: 'OCCUPIED', pricePerHour: 7.5 },
  { id: 'slot-A8', slotNumber: 'A8', floor: 'Ground Floor', vehicleType: 'BIKE', status: 'RESERVED', pricePerHour: 2.5 },
  // Floor 1
  { id: 'slot-B1', slotNumber: 'B1', floor: 'Floor 1', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-B2', slotNumber: 'B2', floor: 'Floor 1', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-B3', slotNumber: 'B3', floor: 'Floor 1', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-B4', slotNumber: 'B4', floor: 'Floor 1', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-B5', slotNumber: 'B5', floor: 'Floor 1', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-B6', slotNumber: 'B6', floor: 'Floor 1', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-B7', slotNumber: 'B7', floor: 'Floor 1', vehicleType: 'EV',  status: 'AVAILABLE', pricePerHour: 7.5 },
  { id: 'slot-B8', slotNumber: 'B8', floor: 'Floor 1', vehicleType: 'BIKE', status: 'AVAILABLE', pricePerHour: 2.5 },
  // Floor 2
  { id: 'slot-C1', slotNumber: 'C1', floor: 'Floor 2', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-C2', slotNumber: 'C2', floor: 'Floor 2', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-C3', slotNumber: 'C3', floor: 'Floor 2', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-C4', slotNumber: 'C4', floor: 'Floor 2', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-C5', slotNumber: 'C5', floor: 'Floor 2', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-C6', slotNumber: 'C6', floor: 'Floor 2', vehicleType: 'CAR', status: 'AVAILABLE', pricePerHour: 5.0 },
  { id: 'slot-C7', slotNumber: 'C7', floor: 'Floor 2', vehicleType: 'EV',  status: 'AVAILABLE', pricePerHour: 7.5 },
  { id: 'slot-C8', slotNumber: 'C8', floor: 'Floor 2', vehicleType: 'BIKE', status: 'AVAILABLE', pricePerHour: 2.5 },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const floor = searchParams.get('floor');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('parking_slots')
      .select('*')
      .order('slot_number', { ascending: true });

    if (floor && floor !== 'ALL') query = query.eq('floor', floor);
    if (status && status !== 'ALL') query = query.eq('status', status);

    const { data: slots, error } = await query;

    if (error || !slots || slots.length === 0) {
      // Return default slots filtered if tables pending in Supabase
      let result = DEFAULT_SLOTS;
      if (floor && floor !== 'ALL') result = result.filter((s) => s.floor === floor);
      if (status && status !== 'ALL') result = result.filter((s) => s.status === status);
      return NextResponse.json({ success: true, slots: result, source: 'default' });
    }

    const formatted = slots.map((s: any) => ({
      id: s.id,
      slotNumber: s.slot_number || s.slotNumber,
      floor: s.floor,
      vehicleType: s.vehicle_type || s.vehicleType || 'CAR',
      status: s.status,
      pricePerHour: parseFloat(s.price_per_hour || s.pricePerHour || 5.0),
      locationId: s.location_id || s.locationId,
      createdAt: s.created_at || s.createdAt,
    }));

    return NextResponse.json({ success: true, slots: formatted, source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ success: true, slots: DEFAULT_SLOTS });
  }
}
