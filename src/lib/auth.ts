import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

export interface SessionUser {
  id: string;
  email: string;
  role: 'USER' | 'OPERATOR' | 'ADMIN' | string;
  name?: string;
  fullName?: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-smart-parking-jwt-key-2026-very-secure'
);

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export const comparePassword = verifyPassword;

export async function signJWT(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}
