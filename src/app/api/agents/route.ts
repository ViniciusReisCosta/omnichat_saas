import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureCompanyAccess, requireAccess } from '@/lib/access';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const requestedCompanyId = req.nextUrl.searchParams.get('companyId');
    const where: Record<string, unknown> = {
      role: { in: ['agent', 'company_admin', 'admin'] },
    };

    if (user.role === 'super_admin' && requestedCompanyId) {
      where.companyId = requestedCompanyId;
    } else if (user.companyId) {
      where.companyId = user.companyId;
    }

    const agents = await prisma.user.findMany({
      where,
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
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(agents);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    if (user.role !== 'super_admin' && user.role !== 'company_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const companyId = user.role === 'super_admin' && typeof body.companyId === 'string' ? body.companyId : user.companyId;
    if (!companyId) return NextResponse.json({ error: 'Company required' }, { status: 400 });

    const forbidden = ensureCompanyAccess(user, companyId);
    if (forbidden) return forbidden;

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = typeof body.role === 'string' && ['agent', 'company_admin'].includes(body.role) ? body.role : 'agent';

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const agent = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        role,
        companyId,
      },
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

    return NextResponse.json(agent, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
