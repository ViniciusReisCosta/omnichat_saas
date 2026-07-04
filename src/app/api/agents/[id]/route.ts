import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canAccessCompany, requireAccess } from '@/lib/access';

function sanitizeAgentUpdate(data: Record<string, unknown>) {
  const nextData: Record<string, unknown> = {};

  if (typeof data.name === 'string') nextData.name = data.name;
  if (typeof data.email === 'string') nextData.email = data.email.trim().toLowerCase();
  if (typeof data.avatar === 'string' || data.avatar === null) nextData.avatar = data.avatar;
  if (typeof data.online === 'boolean') nextData.online = data.online;
  if (typeof data.role === 'string') nextData.role = data.role;

  return nextData;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const agent = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        online: true,
        avatar: true,
        companyId: true,
        company: { select: { id: true, name: true } },
        _count: { select: { assignedConversations: true, messages: true } },
      },
    });

    if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (agent.companyId && !canAccessCompany(user, agent.companyId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(agent);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const data = await req.json();
    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, companyId: true, role: true },
    });

    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (target.companyId && !canAccessCompany(user, target.companyId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (user.role !== 'super_admin' && target.role === 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData = sanitizeAgentUpdate(data);
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No allowed fields provided' }, { status: 400 });
    }
    if (updateData.role && user.role !== 'super_admin' && user.role !== 'company_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        online: true,
        avatar: true,
        companyId: true,
        company: { select: { id: true, name: true } },
        _count: { select: { assignedConversations: true, messages: true } },
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { companyId: true, role: true },
    });

    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (target.companyId && !canAccessCompany(user, target.companyId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (target.role === 'super_admin' || (user.role !== 'super_admin' && user.role !== 'company_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.conversation.updateMany({ where: { agentId: params.id }, data: { agentId: null } }),
      prisma.message.updateMany({ where: { senderId: params.id }, data: { senderId: null } }),
      prisma.user.delete({ where: { id: params.id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
