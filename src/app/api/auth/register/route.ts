import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, companyName, companyId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = hashPassword(password);
    let targetCompanyId = companyId;
    let role = 'agent';

    if (companyName) {
      const company = await prisma.company.create({
        data: { name: companyName, email },
      });
      targetCompanyId = company.id;
      role = 'company_admin';
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        companyId: targetCompanyId || null,
        online: true,
      },
      include: { company: true },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        company: user.company ? { id: user.company.id, name: user.company.name, plan: user.company.plan, active: user.company.active } : null,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
