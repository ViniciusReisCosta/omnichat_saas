import { NextRequest, NextResponse } from 'next/server';
import { enforceSameOrigin } from '@/lib/access';
import { proxyBackendRequest } from '@/lib/backend-api';

export async function POST(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    return proxyBackendRequest(req, '/auth/login');
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
