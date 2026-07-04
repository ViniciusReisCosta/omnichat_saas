import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureCompanyAccess, requireAccess } from '@/lib/access';

function sanitizeCompanyUpdate(data: Record<string, unknown>) {
  const nextData: Record<string, unknown> = {};

  if (typeof data.name === 'string') nextData.name = data.name;
  if (typeof data.email === 'string') nextData.email = data.email;
  if (typeof data.phone === 'string' || data.phone === null) nextData.phone = data.phone;
  if (typeof data.address === 'string' || data.address === null) nextData.address = data.address;
  if (typeof data.welcomeMessage === 'string') nextData.welcomeMessage = data.welcomeMessage;
  if (typeof data.businessHoursStart === 'string') nextData.businessHoursStart = data.businessHoursStart;
  if (typeof data.businessHoursEnd === 'string') nextData.businessHoursEnd = data.businessHoursEnd;

  return nextData;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const forbidden = ensureCompanyAccess(user, params.id);
    if (forbidden) return forbidden;

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        active: true,
        paymentStatus: true,
        phone: true,
        address: true,
        businessHoursStart: true,
        businessHoursEnd: true,
        welcomeMessage: true,
        createdAt: true,
        _count: { select: { users: true, conversations: true, channels: true } },
      },
    });

    if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(company);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;

    const forbidden = ensureCompanyAccess(user, params.id);
    if (forbidden) return forbidden;
    if (user.role !== 'super_admin' && user.role !== 'company_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    const updateData = sanitizeCompanyUpdate(data);
    if (user.role === 'super_admin') {
      if (typeof data.plan === 'string') updateData.plan = data.plan;
      if (typeof data.active === 'boolean') updateData.active = data.active;
      if (typeof data.paymentStatus === 'string' && ['pending', 'paid', 'failed', 'canceled'].includes(data.paymentStatus)) {
        updateData.paymentStatus = data.paymentStatus;
      }
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No allowed fields provided' }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        active: true,
        paymentStatus: true,
        phone: true,
        address: true,
        businessHoursStart: true,
        businessHoursEnd: true,
        welcomeMessage: true,
        createdAt: true,
        _count: { select: { users: true, conversations: true, channels: true } },
      },
    });
    return NextResponse.json(company);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireAccess(req);
    if ('error' in access) return access.error;
    const { user } = access;
    if (user.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.company.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
