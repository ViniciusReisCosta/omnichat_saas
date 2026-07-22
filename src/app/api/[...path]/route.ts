import { NextRequest } from 'next/server';
import { proxyBackendRequest } from '@/lib/backend-api';

type RouteContext = {
  params: { path: string[] };
};

async function proxy(req: NextRequest, context: RouteContext) {
  const { path } = context.params;
  return proxyBackendRequest(req, `/${path.join('/')}`);
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}
