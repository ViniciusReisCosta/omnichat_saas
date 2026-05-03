import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const companyId = req.nextUrl.searchParams.get('companyId') || user.companyId;
    const where = companyId ? { companyId } : {};

    const channels = await prisma.channel.findMany({
      where,
      include: { _count: { select: { conversations: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(channels);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const channel = await prisma.channel.create({
      data: { type: data.type, name: data.name, accountId: data.accountId, companyId: data.companyId || user.companyId! },
    });

    return NextResponse.json(channel, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
