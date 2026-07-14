import { NextRequest } from 'next/server';
import { enforceSameOrigin } from '@/lib/access';
import { proxyBackendRequest } from '@/lib/backend-api';

export async function POST(req: NextRequest) {
  const originError = enforceSameOrigin(req);
  if (originError) return originError;

  return proxyBackendRequest(req, '/auth/logout');
}
