import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureCompanyAccess, requireAccess } from '@/lib/access';

export async function GET(req: NextRequest) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const requestedCompanyId = req.nextUrl.searchParams.get('companyId');
    const companyId = user.role === 'super_admin' ? requestedCompanyId || null : user.companyId;
    if (!companyId && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'No company available' }, { status: 400 });
    }
    if (companyId) {
      const forbidden = ensureCompanyAccess(user, companyId);
      if (forbidden) return forbidden;
    }
    const where = companyId ? { companyId } : {};

    const channels = await prisma.channel.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        _count: { select: { conversations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(channels);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const data = await req.json();
    const companyId = user.role === 'super_admin' && typeof data.companyId === 'string' ? data.companyId : user.companyId;
    if (!companyId) return NextResponse.json({ error: 'Company required' }, { status: 400 });
    const forbidden = ensureCompanyAccess(user, companyId);
    if (forbidden) return forbidden;

    const type = typeof data.type === 'string' ? data.type.trim() : '';
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!type || !name) {
      return NextResponse.json({ error: 'Type and name are required' }, { status: 400 });
    }

    const channel = await prisma.channel.create({
      data: {
        type,
        name,
        accountId: typeof data.accountId === 'string' ? data.accountId.trim() : null,
        connected: typeof data.connected === 'boolean' ? data.connected : false,
        companyId,
      },
      include: {
        company: { select: { id: true, name: true } },
        _count: { select: { conversations: true } },
      },
    });

    return NextResponse.json(channel, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
