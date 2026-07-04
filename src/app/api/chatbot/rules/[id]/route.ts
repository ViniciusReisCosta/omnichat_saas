import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureCompanyAccess, requireAccess } from '@/lib/access';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const existing = await prisma.chatbotRule.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    });

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const forbidden = ensureCompanyAccess(user, existing.companyId);
    if (forbidden) return forbidden;

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.keyword === 'string') data.keyword = body.keyword.trim();
    if (typeof body.response === 'string') data.response = body.response.trim();
    if (typeof body.active === 'boolean') data.active = body.active;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No allowed fields provided' }, { status: 400 });
    }

    const rule = await prisma.chatbotRule.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const existing = await prisma.chatbotRule.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    });

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const forbidden = ensureCompanyAccess(user, existing.companyId);
    if (forbidden) return forbidden;

    await prisma.chatbotRule.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
