import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

function resolvePaymentStatus(status: string | null | undefined): 'pending' | 'paid' | 'failed' | 'canceled' {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'paid':
      return 'paid';
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
      return 'failed';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'pending';
  }
}

async function updateCompanyBilling(companyId: string, data: { paymentStatus: 'pending' | 'paid' | 'failed' | 'canceled'; active: boolean; stripeCustomerId?: string | null; stripeSubscriptionId?: string | null; plan?: string; }) {
  await prisma.company.update({
    where: { id: companyId },
    data,
  });
}

function buildCompanyLookup(customerId?: string | null, subscriptionId?: string | null) {
  const conditions = [];

  if (customerId) conditions.push({ stripeCustomerId: customerId });
  if (subscriptionId) conditions.push({ stripeSubscriptionId: subscriptionId });

  return conditions.length > 0 ? { OR: conditions } : null;
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing Stripe webhook configuration' }, { status: 400 });
  }

  try {
    const payload = await req.text();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId = session.metadata?.companyId || session.client_reference_id;
        if (companyId) {
          await updateCompanyBilling(companyId, {
            paymentStatus: 'paid',
            active: true,
            stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
            plan: session.metadata?.planSlug,
          });
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId = session.metadata?.companyId || session.client_reference_id;
        if (companyId) {
          await updateCompanyBilling(companyId, { paymentStatus: 'canceled', active: false });
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
        const where = buildCompanyLookup(
          typeof invoice.customer === 'string' ? invoice.customer : null,
          typeof invoice.subscription === 'string' ? invoice.subscription : null
        );
        if (!where) break;

        const company = await prisma.company.findFirst({
          where,
        });

        if (company) {
          await updateCompanyBilling(company.id, { paymentStatus: 'paid', active: true });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
        const where = buildCompanyLookup(
          typeof invoice.customer === 'string' ? invoice.customer : null,
          typeof invoice.subscription === 'string' ? invoice.subscription : null
        );
        if (!where) break;

        const company = await prisma.company.findFirst({
          where,
        });

        if (company) {
          await updateCompanyBilling(company.id, { paymentStatus: 'failed', active: false });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const where = buildCompanyLookup(
          typeof subscription.customer === 'string' ? subscription.customer : null,
          subscription.id
        );
        if (!where) break;

        const company = await prisma.company.findFirst({
          where,
        });

        if (company) {
          const paymentStatus = resolvePaymentStatus(subscription.status);
          await updateCompanyBilling(company.id, {
            paymentStatus,
            active: paymentStatus === 'paid',
            stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : null,
            stripeSubscriptionId: subscription.id,
          });
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
