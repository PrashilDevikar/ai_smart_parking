import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search') || '';

    let query = supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });
    if (role && role !== 'ALL') query = query.eq('role', role);
    if (search) query = query.ilike('full_name', `%${search}%`);

    const { data: users, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formatted = (users || []).map((u: any) => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      vehicleNumber: u.vehicle_number,
      role: u.role,
      status: u.status,
      totalBookings: 1,
      createdAt: u.created_at,
    }));

    return NextResponse.json({ success: true, users: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, status } = await req.json();
    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
