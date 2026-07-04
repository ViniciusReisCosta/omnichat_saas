import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAccess } from '@/lib/access';

export async function GET(req: NextRequest) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const search = req.nextUrl.searchParams.get('search') || '';
    const status = req.nextUrl.searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (user.role !== 'super_admin') where.id = user.companyId;
    if (search) where.name = { contains: search };
    if (status === 'active') where.active = true;
    if (status === 'inactive') where.active = false;

    const companies = await prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        plan: true,
        active: true,
        paymentStatus: true,
        createdAt: true,
        _count: { select: { users: true, conversations: true, channels: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(companies);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;
    if (user.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await req.json();
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        email,
        phone: typeof data.phone === 'string' ? data.phone.trim() : null,
        address: typeof data.address === 'string' ? data.address.trim() : null,
        plan: typeof data.plan === 'string' ? data.plan : 'starter',
        paymentStatus: 'pending',
        active: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        plan: true,
        active: true,
        paymentStatus: true,
        createdAt: true,
        _count: { select: { users: true, conversations: true, channels: true } },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
