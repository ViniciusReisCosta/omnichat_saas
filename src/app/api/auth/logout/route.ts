import { NextRequest, NextResponse } from 'next/server';
import { enforceSameOrigin } from '@/lib/access';
import { getSessionCookieName, getSessionCookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const originError = enforceSameOrigin(req);
  if (originError) return originError;

  const response = NextResponse.json({ success: true });
  response.cookies.set(getSessionCookieName(), '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
