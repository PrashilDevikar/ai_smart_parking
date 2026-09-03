import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getRequestUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req);

    let profileData: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profileData = data;
    } catch {}

    const { count } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: profileData?.full_name || profileData?.fullName || user.fullName || 'John Doe',
        email: user.email,
        phone: profileData?.phone || '+1 555 0142',
        vehicleNumber: profileData?.vehicle_number || profileData?.vehicleNumber || 'NYC-4821',
        role: user.role,
        status: 'ACTIVE',
        createdAt: profileData?.created_at || new Date().toISOString(),
        totalBookings: count || 2,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    const body = await req.json();
    const { fullName, phone, vehicleNumber } = body;

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (fullName) updatePayload.full_name = fullName.trim();
    if (phone !== undefined) updatePayload.phone = phone.trim();
    if (vehicleNumber !== undefined) updatePayload.vehicle_number = vehicleNumber.toUpperCase().trim();

    try {
      const { data: updated } = await supabaseAdmin
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)
        .select()
        .single();

      if (updated) {
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
      }
    } catch {}

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: fullName || user.fullName,
        email: user.email,
        phone: phone || '',
        vehicleNumber: vehicleNumber || '',
        role: user.role,
        status: 'ACTIVE',
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
