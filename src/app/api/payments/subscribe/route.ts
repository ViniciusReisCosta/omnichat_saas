import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAccess } from '@/lib/access';
import { getAppUrl, stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const access = await requireAccess(req, { requirePayment: false });
    if ('error' in access) return access.error;

    const { user } = access;
    if (user.role !== 'company_admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only company admins can manage billing' }, { status: 403 });
    }

    const { planSlug } = await req.json();
    const targetCompanyId = user.companyId;

    if (!targetCompanyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    if (!plan.stripePriceId) {
      return NextResponse.json({ error: 'Stripe price is not configured for this plan' }, { status: 400 });
    }

    const company = user.company;
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    let stripeCustomerId = company.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: company.email || user.email,
        name: company.name,
        metadata: { companyId: company.id },
      });

      stripeCustomerId = customer.id;
      await prisma.company.update({
        where: { id: company.id },
        data: { stripeCustomerId },
      });
    }

    const appUrl = getAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      client_reference_id: company.id,
      metadata: {
        companyId: company.id,
        userId: user.id,
        planSlug: plan.slug,
      },
      success_url: `${appUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?checkout=canceled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 });
    }

    await prisma.company.update({
      where: { id: company.id },
      data: {
        paymentStatus: 'pending',
        active: false,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
