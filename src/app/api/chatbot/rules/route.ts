import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureCompanyAccess, requireAccess } from '@/lib/access';

function getTargetCompanyId(req: NextRequest, user: { role: string; companyId: string | null }) {
  const requestedCompanyId = req.nextUrl.searchParams.get('companyId');
  return user.role === 'super_admin' ? requestedCompanyId || user.companyId : user.companyId;
}

export async function GET(req: NextRequest) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const companyId = getTargetCompanyId(req, user);
    if (!companyId) return NextResponse.json({ error: 'Company required' }, { status: 400 });

    const forbidden = ensureCompanyAccess(user, companyId);
    if (forbidden) return forbidden;

    const rules = await prisma.chatbotRule.findMany({
      where: { companyId },
      orderBy: { keyword: 'asc' },
    });

    return NextResponse.json(rules);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const body = await req.json();
    const companyId = user.role === 'super_admin' && typeof body.companyId === 'string' ? body.companyId : user.companyId;
    if (!companyId) return NextResponse.json({ error: 'Company required' }, { status: 400 });

    const forbidden = ensureCompanyAccess(user, companyId);
    if (forbidden) return forbidden;

    const keyword = typeof body.keyword === 'string' ? body.keyword.trim() : '';
    const response = typeof body.response === 'string' ? body.response.trim() : '';
    if (!keyword || !response) {
      return NextResponse.json({ error: 'Keyword and response are required' }, { status: 400 });
    }

    const rule = await prisma.chatbotRule.create({
      data: {
        keyword,
        response,
        active: typeof body.active === 'boolean' ? body.active : true,
        companyId,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
