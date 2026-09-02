import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data: slots, error } = await supabaseAdmin.from('parking_slots').select('*').order('slot_number', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formatted = (slots || []).map((s: any) => ({
      id: s.id,
      slotNumber: s.slot_number,
      floor: s.floor,
      vehicleType: s.vehicle_type,
      pricePerHour: parseFloat(s.price_per_hour || 5.0),
      status: s.status,
      createdAt: s.created_at,
    }));

    return NextResponse.json({ success: true, slots: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slotNumber, floor, vehicleType, pricePerHour, status } = await req.json();
    const { data: loc } = await supabaseAdmin.from('parking_locations').select('id').limit(1).single();
    const locationId = loc?.id || 'a0000000-0000-0000-0000-000000000001';

    const { data: slot, error } = await supabaseAdmin
      .from('parking_slots')
      .insert({
        slot_number: slotNumber.toUpperCase().trim(),
        floor,
        vehicle_type: vehicleType || 'CAR',
        price_per_hour: parseFloat(pricePerHour) || 5.0,
        status: status || 'AVAILABLE',
        location_id: locationId,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, slot });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, slotNumber, floor, vehicleType, pricePerHour, status } = await req.json();
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (slotNumber) updatePayload.slot_number = slotNumber.toUpperCase().trim();
    if (floor) updatePayload.floor = floor;
    if (vehicleType) updatePayload.vehicle_type = vehicleType;
    if (pricePerHour !== undefined) updatePayload.price_per_hour = parseFloat(pricePerHour);
    if (status) updatePayload.status = status;

    const { data: updated, error } = await supabaseAdmin
      .from('parking_slots')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, slot: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Slot ID required' }, { status: 400 });

    const { error } = await supabaseAdmin.from('parking_slots').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
