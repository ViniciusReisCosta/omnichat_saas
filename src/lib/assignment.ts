import { prisma } from './prisma';

export async function assignConversation(companyId: string): Promise<string | null> {
  const agents = await prisma.user.findMany({
    where: {
      companyId,
      role: { in: ['agent', 'company_admin'] },
      online: true,
    },
    include: {
      _count: {
        select: {
          assignedConversations: {
            where: { status: { in: ['open', 'pending'] } },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (agents.length === 0) {
    const anyAgent = await prisma.user.findFirst({
      where: { companyId, role: { in: ['agent', 'company_admin'] } },
    });
    return anyAgent?.id || null;
  }

  const sorted = agents.sort(
    (a, b) => a._count.assignedConversations - b._count.assignedConversations
  );

  return sorted[0].id;
}
