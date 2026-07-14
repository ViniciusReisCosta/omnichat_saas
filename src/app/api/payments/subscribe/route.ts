import { NextRequest } from 'next/server';
import { proxyBackendRequest } from '@/lib/backend-api';

export async function POST(req: NextRequest) {
  return proxyBackendRequest(req, '/payments/subscribe');
}
