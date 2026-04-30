import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);

  const where: Record<string, unknown> = {
    role: { in: ['agent', 'company_admin', 'admin'] },
  };
  if (user?.companyId) where.companyId = user.companyId;

  const agents = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, online: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(agents);
}
