import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { signJWT } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, phone, vehicleNumber, role } = await req.json();
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email, and password required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if email already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .single();

    if (existingProfile) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // 2. Sign up user via Supabase Auth (stores password securely in auth.users)
    let authUserId = '';
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : null,
          vehicle_number: vehicleNumber ? vehicleNumber.toUpperCase().trim() : null,
          role: role === 'OPERATOR' ? 'OPERATOR' : 'USER',
        },
      },
    });

    if (authError) {
      // If user already exists in auth.users
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 400 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    authUserId = authData.user?.id || crypto.randomUUID();

    // 3. Upsert user into profiles table (only valid columns: id, email, full_name, phone, vehicle_number, role, status)
    const { data: newProfile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUserId,
        email: cleanEmail,
        full_name: fullName.trim(),
        phone: phone ? phone.trim() : null,
        vehicle_number: vehicleNumber ? vehicleNumber.toUpperCase().trim() : null,
        role: role === 'OPERATOR' ? 'OPERATOR' : 'USER',
        status: 'ACTIVE',
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileErr) {
      console.warn('Profile upsert warning:', profileErr);
    }

    const assignedRole = role === 'OPERATOR' ? 'OPERATOR' : 'USER';

    // 4. Issue JWT auth_token cookie
    const token = await signJWT({
      id: authUserId,
      email: cleanEmail,
      role: assignedRole,
      name: fullName.trim(),
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: authUserId,
        email: cleanEmail,
        fullName: fullName.trim(),
        role: assignedRole,
        phone: phone || '',
        vehicleNumber: vehicleNumber || '',
        status: 'ACTIVE',
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
    console.error('Registration error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
