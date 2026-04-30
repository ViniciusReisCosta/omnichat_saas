import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getChatbotReply } from '@/lib/chatbot';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { content, senderType } = body;

  if (!content || !senderType) {
    return NextResponse.json({ error: 'content and senderType are required' }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      content,
      senderType,
      conversationId: params.id,
      senderId: senderType === 'agent' ? conversation.agentId : null,
    },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  await prisma.conversation.update({
    where: { id: params.id },
    data: {
      updatedAt: new Date(),
      ...(senderType === 'customer' ? { unreadCount: { increment: 1 } } : {}),
    },
  });

  if (senderType === 'customer') {
    const botReply = await getChatbotReply(conversation.companyId, content);
    if (botReply) {
      await prisma.message.create({
        data: {
          content: botReply,
          senderType: 'bot',
          conversationId: params.id,
        },
      });
    }
  }

  return NextResponse.json(message, { status: 201 });
}
