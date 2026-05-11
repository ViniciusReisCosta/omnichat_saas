import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
