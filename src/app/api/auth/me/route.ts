import { NextRequest } from 'next/server';
import { proxyBackendRequest } from '@/lib/backend-api';

export async function GET(req: NextRequest) {
  return proxyBackendRequest(req, '/auth/me');
}
