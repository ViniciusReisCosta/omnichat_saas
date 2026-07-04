import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforceSameOrigin } from '@/lib/access';
import { getSessionCookieName, getSessionCookieOptions, hashPassword, serializeSessionUser, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const { name, email, password, companyName } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required to create your workspace' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = hashPassword(password);
    const company = await prisma.company.create({
      data: { name: companyName, email, active: false, paymentStatus: 'pending' },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: 'company_admin',
        companyId: company.id,
        online: true,
      },
      include: { company: true },
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
      companyId: user.companyId,
    });

    const response = NextResponse.json({
      nextStep: user.role === 'super_admin' || user.company?.paymentStatus === 'paid' ? 'dashboard' : 'payment',
      user: serializeSessionUser(user),
    }, { status: 201 });

    response.cookies.set(getSessionCookieName(), token, getSessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
