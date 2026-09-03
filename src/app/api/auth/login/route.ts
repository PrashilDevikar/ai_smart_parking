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

    // 1. Built-in Demo Accounts
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

    // 2. Authenticate Registered Accounts via Supabase Auth (Gmail & Custom Users)
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authData?.user && !authError) {
        let profile: any = null;
        try {
          const { data } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
          profile = data;
        } catch {}

        if (!profile) {
          try {
            const { data } = await supabaseAdmin
              .from('profiles')
              .select('*')
              .eq('email', cleanEmail)
              .single();
            profile = data;
          } catch {}
        }

        const role = profile?.role || authData.user.user_metadata?.role || 'USER';
        const fullName = profile?.full_name || authData.user.user_metadata?.full_name || cleanEmail.split('@')[0];

        const token = await signJWT({
          id: authData.user.id,
          email: cleanEmail,
          role,
          name: fullName,
        });

        const res = NextResponse.json({
          success: true,
          user: {
            id: authData.user.id,
            email: cleanEmail,
            fullName,
            role,
            phone: profile?.phone || authData.user.user_metadata?.phone || '',
            vehicleNumber: profile?.vehicle_number || authData.user.user_metadata?.vehicle_number || '',
            status: profile?.status || 'ACTIVE',
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
    } catch (sbErr) {
      console.warn('Supabase Auth error:', sbErr);
    }

    // 3. Fallback check for bcrypt hash if present in database
    try {
      const { data: user } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (user) {
        const passwordHash = user.password_hash || (user as any).passwordHash;
        if (passwordHash && (await comparePassword(password, passwordHash))) {
          const token = await signJWT({
            id: user.id,
            email: user.email,
            role: user.role || 'USER',
            name: user.full_name,
          });

          const res = NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.full_name,
              role: user.role || 'USER',
              phone: user.phone || '',
              vehicleNumber: user.vehicle_number || '',
              status: user.status || 'ACTIVE',
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
      }
    } catch {}

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
