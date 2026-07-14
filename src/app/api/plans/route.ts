import { proxyBackendGet } from '@/lib/backend-api';

export async function GET() {
  return proxyBackendGet('/plans');
}
