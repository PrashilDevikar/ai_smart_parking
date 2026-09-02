import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyJWT } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', payload.id as string)
      .single();

    if (error || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { count } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name || user.fullName,
        email: user.email,
        phone: user.phone || '',
        vehicleNumber: user.vehicle_number || user.vehicleNumber || '',
        role: user.role,
        status: user.status,
        createdAt: user.created_at || user.createdAt,
        totalBookings: count || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await req.json();
    const { fullName, phone, vehicleNumber } = body;

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (fullName) updatePayload.full_name = fullName.trim();
    if (phone !== undefined) updatePayload.phone = phone.trim();
    if (vehicleNumber !== undefined) updatePayload.vehicle_number = vehicleNumber.toUpperCase().trim();

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', payload.id as string)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        fullName: updated.full_name,
        email: updated.email,
        phone: updated.phone || '',
        vehicleNumber: updated.vehicle_number || '',
        role: updated.role,
        status: updated.status,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
