import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { comparePassword, signJWT } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Try querying Supabase profiles table
    try {
      const { data: user, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (user && !error) {
        const passwordHash = user.password_hash || user.passwordHash;
        const isPasswordValid = passwordHash ? await comparePassword(password, passwordHash) : false;

        if (isPasswordValid) {
          const token = await signJWT({
            id: user.id,
            email: user.email,
            role: user.role || 'USER',
            name: user.full_name || user.fullName,
          });

          const response = NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.full_name || user.fullName,
              role: user.role || 'USER',
              phone: user.phone || '',
              vehicleNumber: user.vehicle_number || user.vehicleNumber || '',
              status: user.status || 'ACTIVE',
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
        }
      }
    } catch {
      // Fallback
    }

    // 2. Demo fallback accounts
    if (cleanEmail === 'operator@aiparking.com' && password === 'Operator@123') {
      const token = await signJWT({
        id: 'b0000000-0000-0000-0000-000000000001',
        email: cleanEmail,
        role: 'OPERATOR',
        name: 'Chief Operator Alex',
      });
      const res = NextResponse.json({
        success: true,
        user: {
          id: 'b0000000-0000-0000-0000-000000000001',
          email: cleanEmail,
          fullName: 'Chief Operator Alex',
          role: 'OPERATOR',
          status: 'ACTIVE',
        },
      });
      res.cookies.set('auth_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 86400,
      });
      return res;
    }

    if (cleanEmail === 'john@example.com' && password === 'User@123') {
      const token = await signJWT({
        id: 'b0000000-0000-0000-0000-000000000002',
        email: cleanEmail,
        role: 'USER',
        name: 'John Doe',
      });
      const res = NextResponse.json({
        success: true,
        user: {
          id: 'b0000000-0000-0000-0000-000000000002',
          email: cleanEmail,
          fullName: 'John Doe',
          role: 'USER',
          status: 'ACTIVE',
        },
      });
      res.cookies.set('auth_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 86400,
      });
      return res;
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}