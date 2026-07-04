import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAccess } from '@/lib/access';
import { assignConversation } from '@/lib/assignment';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const channel = searchParams.get('channel');
  const search = searchParams.get('search');

  const access = await requireAccess(req);
  if ('error' in access) return access.error;
  const { user } = access;

  const where: Record<string, unknown> = {};
  if (user?.companyId) where.companyId = user.companyId;
  if (status) where.status = status;
  if (channel) where.channel = channel;
  if (search) where.customerName = { contains: search };

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      agent: { select: { id: true, name: true, role: true } },
      messages: {
        orderBy: { createdAt: 'desc' as const },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const access = await requireAccess(req);
  if ('error' in access) return access.error;
  const { user } = access;

  const body = await req.json();
  const { customerName, channel, customerPhone, customerEmail } = body;

  if (!customerName || !channel) {
    return NextResponse.json({ error: 'customerName and channel are required' }, { status: 400 });
  }

  const companyId = user.companyId;
  if (!companyId) return NextResponse.json({ error: 'No company available' }, { status: 400 });

  const agentId = await assignConversation(companyId);

  const conversation = await prisma.conversation.create({
    data: {
      customerName,
      channel,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      companyId,
      agentId,
    },
    include: {
      agent: { select: { id: true, name: true, role: true } },
      messages: true,
    },
  });

  await prisma.message.create({
    data: {
      content: `Conversa iniciada via ${channel.charAt(0).toUpperCase() + channel.slice(1)}`,
      senderType: 'system',
      conversationId: conversation.id,
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
