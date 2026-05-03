import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role === 'super_admin') {
      const [companies, agents, conversations, messages] = await Promise.all([
        prisma.company.count(),
        prisma.user.count({ where: { role: { not: 'super_admin' } } }),
        prisma.conversation.count(),
        prisma.message.count(),
      ]);

      const byStatus = await prisma.conversation.groupBy({ by: ['status'], _count: true });
      const byChannel = await prisma.conversation.groupBy({ by: ['channel'], _count: true });

      const recent = await prisma.conversation.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: { agent: { select: { name: true } }, company: { select: { name: true } } },
      });

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      const recentMessages = await prisma.message.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      });

      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const messagesPerDay = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000);
        const count = recentMessages.filter((m) => m.createdAt.toDateString() === d.toDateString()).length;
        return { day: days[d.getDay()], count };
      });

      return NextResponse.json({
        totalCompanies: companies,
        totalAgents: agents,
        totalConversations: conversations,
        totalMessages: messages,
        conversationsByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
        conversationsByChannel: Object.fromEntries(byChannel.map((c) => [c.channel, c._count])),
        recentConversations: recent,
        messagesPerDay,
      });
    }

    const companyId = user.companyId;
    if (!companyId) return NextResponse.json({ error: 'No company' }, { status: 400 });

    const [conversations, messages, agents] = await Promise.all([
      prisma.conversation.count({ where: { companyId } }),
      prisma.message.count({ where: { conversation: { companyId } } }),
      prisma.user.count({ where: { companyId, role: { not: 'super_admin' } } }),
    ]);

    const byStatus = await prisma.conversation.groupBy({ by: ['status'], where: { companyId }, _count: true });
    const byChannel = await prisma.conversation.groupBy({ by: ['channel'], where: { companyId }, _count: true });

    const recent = await prisma.conversation.findMany({
      where: { companyId },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { agent: { select: { name: true } } },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const recentMessages = await prisma.message.findMany({
      where: { conversation: { companyId }, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const messagesPerDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      const count = recentMessages.filter((m) => m.createdAt.toDateString() === d.toDateString()).length;
      return { day: days[d.getDay()], count };
    });

    return NextResponse.json({
      totalConversations: conversations,
      totalMessages: messages,
      totalAgents: agents,
      conversationsByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      conversationsByChannel: Object.fromEntries(byChannel.map((c) => [c.channel, c._count])),
      recentConversations: recent,
      messagesPerDay,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
