import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('bookings')
      .select('*, slot:parking_slots(*), user:profiles(*)')
      .order('created_at', { ascending: false });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data: bookings, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formatted = (bookings || []).map((b: any) => ({
      id: b.id,
      userId: b.user_id,
      slotId: b.slot_id,
      vehicleNumber: b.vehicle_number,
      startTime: b.start_time,
      endTime: b.end_time,
      duration: b.duration,
      amount: parseFloat(b.amount || 0),
      status: b.status,
      paymentStatus: b.payment_status,
      qrCode: b.qr_code,
      createdAt: b.created_at,
      slot: b.slot ? {
        id: b.slot.id,
        slotNumber: b.slot.slot_number,
        floor: b.slot.floor,
        vehicleType: b.slot.vehicle_type,
        status: b.slot.status,
        pricePerHour: parseFloat(b.slot.price_per_hour || 5.0),
      } : null,
      user: b.user ? {
        id: b.user.id,
        fullName: b.user.full_name,
        email: b.user.email,
        phone: b.user.phone,
        vehicleNumber: b.user.vehicle_number,
      } : null,
    }));

    return NextResponse.json({ success: true, bookings: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { bookingId, status } = await req.json();

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (status === 'COMPLETED' || status === 'CANCELLED') {
      await supabaseAdmin
        .from('parking_slots')
        .update({ status: 'AVAILABLE', updated_at: new Date().toISOString() })
        .eq('id', booking.slot_id);
    }

    const { data: updated, error } = await supabaseAdmin
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select('*, slot:parking_slots(*), user:profiles(*)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, booking: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
