import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hashPassword, signJWT } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, phone, vehicleNumber, role } = await req.json();
    if (!fullName || !email || !password) return NextResponse.json({ error: 'Full name, email, and password required' }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();
    const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('email', cleanEmail).single();
    if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });

    const hashedPassword = await hashPassword(password);
    const { data: newUser, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        full_name: fullName.trim(),
        email: cleanEmail,
        password_hash: hashedPassword,
        phone: phone ? phone.trim() : null,
        vehicle_number: vehicleNumber ? vehicleNumber.toUpperCase().trim() : null,
        role: role === 'OPERATOR' ? 'OPERATOR' : 'USER',
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error || !newUser) return NextResponse.json({ error: error?.message || 'Failed to create user' }, { status: 500 });

    const token = await signJWT({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.full_name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        phone: newUser.phone || '',
        vehicleNumber: newUser.vehicle_number || '',
        status: newUser.status,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
