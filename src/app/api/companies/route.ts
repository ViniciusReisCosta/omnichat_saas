import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const search = req.nextUrl.searchParams.get('search') || '';
    const status = req.nextUrl.searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search };
    if (status === 'active') where.active = true;
    if (status === 'inactive') where.active = false;

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: { select: { users: true, conversations: true } },
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
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await req.json();
    const company = await prisma.company.create({
      data: { name: data.name, email: data.email, phone: data.phone, plan: data.plan || 'starter' },
    });

    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
