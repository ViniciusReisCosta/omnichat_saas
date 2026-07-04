import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canAccessCompany, requireAccess } from '@/lib/access';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const access = await requireAccess(req);
  if ('error' in access) return access.error;
  const { user } = access;

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      agent: { select: { id: true, name: true, role: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!canAccessCompany(user, conversation.companyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(conversation);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const access = await requireAccess(req);
  if ('error' in access) return access.error;
  const { user } = access;

  const body = await req.json();
  const data: Record<string, unknown> = {};

  const existing = await prisma.conversation.findUnique({
    where: { id: params.id },
    select: { companyId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!canAccessCompany(user, existing.companyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (body.status !== undefined) data.status = body.status;
  if (body.agentId !== undefined) {
    const targetAgent = await prisma.user.findUnique({
      where: { id: body.agentId },
      select: { companyId: true, role: true },
    });

    if (!targetAgent || targetAgent.companyId !== existing.companyId) {
      return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
    }
    data.agentId = body.agentId;
  }

  const conversation = await prisma.conversation.update({
    where: { id: params.id },
    data,
    include: {
      agent: { select: { id: true, name: true, role: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });

  return NextResponse.json(conversation);
}
