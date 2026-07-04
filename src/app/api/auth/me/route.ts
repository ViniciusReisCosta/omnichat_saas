import { NextRequest, NextResponse } from 'next/server';
import { requireAccess } from '@/lib/access';
import { serializeSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const access = await requireAccess(req, { requirePayment: false });
    if ('error' in access) return access.error;
    const { user } = access;

    return NextResponse.json(serializeSessionUser(user));
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
