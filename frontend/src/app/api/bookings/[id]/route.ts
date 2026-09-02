import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, parking_slots(*), profiles(*)')
      .eq('id', id)
      .single();

    if (error || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action } = await req.json();
    const supabase = await createClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (action === 'CANCEL') {
      await supabase
        .from('parking_slots')
        .update({ status: 'AVAILABLE' })
        .eq('id', booking.slot_id);

      const { data: updated, error: upErr } = await supabase
        .from('bookings')
        .update({ status: 'CANCELLED', payment_status: 'REFUNDED' })
        .eq('id', id)
        .select()
        .single();

      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      return NextResponse.json({ success: true, booking: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
