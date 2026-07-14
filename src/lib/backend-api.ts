import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_BACKEND_URL = 'http://localhost:4000';

function backendBaseUrl() {
  return (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');
}

export function backendApiUrl(path: string) {
  const normalized = path.startsWith('/api/')
    ? path
    : path === '/api'
      ? path
      : `/api${path.startsWith('/') ? path : `/${path}`}`;

  const baseUrl = backendBaseUrl();
  if (baseUrl.endsWith('/api')) return `${baseUrl}${normalized.replace(/^\/api/, '')}`;
  return `${baseUrl}${normalized}`;
}

function responseHeadersFromBackend(res: Response) {
  const headers = new Headers();
  const contentType = res.headers.get('content-type');
  const setCookie = res.headers.get('set-cookie');

  if (contentType) headers.set('content-type', contentType);
  if (setCookie) headers.set('set-cookie', setCookie);

  return headers;
}

export async function proxyBackendRequest(req: NextRequest, path: string) {
  const headers = new Headers();
  const accept = req.headers.get('accept');
  const authorization = req.headers.get('authorization');
  const contentType = req.headers.get('content-type');
  const cookie = req.headers.get('cookie');
  const stripeSignature = req.headers.get('stripe-signature');

  if (accept) headers.set('accept', accept);
  if (authorization) headers.set('authorization', authorization);
  if (contentType) headers.set('content-type', contentType);
  if (cookie) headers.set('cookie', cookie);
  if (stripeSignature) headers.set('stripe-signature', stripeSignature);

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.text() : undefined;

  const backendRes = await fetch(backendApiUrl(path), {
    method: req.method,
    headers,
    body,
    cache: 'no-store',
    redirect: 'manual',
  });

  const responseBody = await backendRes.text();

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: responseHeadersFromBackend(backendRes),
  });
}

export async function proxyBackendGet(path: string) {
  const backendRes = await fetch(backendApiUrl(path), {
    cache: 'no-store',
  });

  const responseBody = await backendRes.text();

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: responseHeadersFromBackend(backendRes),
  });
}
