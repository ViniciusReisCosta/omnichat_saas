import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, getSessionCookieName, getSessionCookieOptions, serializeSessionUser, signToken } from '@/lib/auth';
import { enforceSameOrigin } from '@/lib/access';

export async function POST(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user || !comparePassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.company && !user.company.active && user.company.paymentStatus === 'paid' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Your company account is deactivated' }, { status: 403 });
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      companyId: user.companyId,
    });

    await prisma.user.update({ where: { id: user.id }, data: { online: true } });

    const response = NextResponse.json({
      nextStep: user.role === 'super_admin' || user.company?.paymentStatus === 'paid' ? 'dashboard' : 'payment',
      paymentRequired: user.role !== 'super_admin' && user.company?.paymentStatus !== 'paid',
      user: serializeSessionUser(user),
    });

    response.cookies.set(getSessionCookieName(), token, getSessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
