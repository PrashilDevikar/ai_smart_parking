import { cookies, headers } from 'next/headers';
import { verifyJWT, SessionUser } from './auth';
import { NextRequest, NextResponse } from 'next/server';

export const COOKIE_NAME = 'auth_token';

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value || cookieStore.get('parking_token')?.value;

    if (token) {
      const user = await verifyJWT(token);
      if (user) return user;
    }

    const headerList = await headers();
    const authHeader = headerList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7);
      return await verifyJWT(bearerToken);
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function getRequestUser(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const user = await verifyJWT(token);
    if (user) return user;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    return await verifyJWT(bearerToken);
  }

  return null;
}