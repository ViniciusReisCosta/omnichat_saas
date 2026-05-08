import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planSlug, companyId } = await req.json();
    const targetCompanyId = companyId || user.companyId;

    if (!targetCompanyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const company = await prisma.company.update({
      where: { id: targetCompanyId },
      data: { plan: planSlug, paymentStatus: 'active' },
    });

    return NextResponse.json({ company, plan });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
