import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'cberhunt-fallback-secret';
const SESSION_COOKIE_NAME = 'cber_session';

function getJwtSecret() {
  if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'cberhunt-fallback-secret') {
    throw new Error('JWT_SECRET must be configured in production');
  }

  return JWT_SECRET;
}

export type SessionUser = {
  id: string;
  name: string;
  role: string;
  hasActiveAccess: boolean;
  company: {
    id: string;
    name: string;
    plan: string;
    active: boolean;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'canceled';
  } | null;
};

export interface JwtPayload {
  userId: string;
  role: string;
  companyId: string | null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '12h' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE_NAME)?.value || null;
}

export function getUserFromRequest(req: NextRequest): JwtPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthenticatedUser(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    include: { company: true },
  });
}

export function hasActivePaymentAccess(user: Awaited<ReturnType<typeof getAuthenticatedUser>>) {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (!user.company) return false;
  return user.company.active && user.company.paymentStatus === 'paid';
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 12,
  };
}

export function serializeSessionUser(user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>): SessionUser {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    hasActiveAccess: hasActivePaymentAccess(user),
    company: user.company
      ? {
          id: user.company.id,
          name: user.company.name,
          plan: user.company.plan,
          active: user.company.active,
          paymentStatus: user.company.paymentStatus,
        }
      : null,
  };
}
