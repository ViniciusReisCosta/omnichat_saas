import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

function isProtectedPath(pathname: string) {
  return pathname.startsWith('/api/') || pathname.startsWith('/dashboard') || pathname.startsWith('/billing');
}

function shouldValidateOrigin(pathname: string) {
  return pathname.startsWith('/api/') && pathname !== '/api/payments/webhook';
}

export function middleware(req: NextRequest) {
  if (shouldValidateOrigin(req.nextUrl.pathname) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.get('origin');
    const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.nextUrl.origin;

    if (origin && origin !== req.nextUrl.origin && origin !== expectedOrigin) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }
  }

  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  if (isProtectedPath(req.nextUrl.pathname)) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
