import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    name: 'Starter',
    slug: 'starter',
    price: 149,
    maxAgents: 3,
    maxChannels: 2,
    maxMessages: 1000,
    features: ['Unified Inbox', '2 Channels', 'Basic Chatbot', 'Email Support'],
    stripePriceId: process.env.STRIPE_PRICE_STARTER || null,
  },
  {
    name: 'Professional',
    slug: 'professional',
    price: 399,
    maxAgents: 10,
    maxChannels: 5,
    maxMessages: 10000,
    features: ['Unified Inbox', 'All Channels', 'Advanced Chatbot', 'Auto Assignment', 'Analytics', 'Priority Support'],
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || null,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price: 999,
    maxAgents: 999,
    maxChannels: 10,
    maxMessages: 999999,
    features: ['Unlimited Agents', 'All Channels', 'AI Chatbot', 'Custom Integrations', 'Dedicated Support', 'SLA Guarantee'],
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || null,
  },
];

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        price: plan.price,
        maxAgents: plan.maxAgents,
        maxChannels: plan.maxChannels,
        maxMessages: plan.maxMessages,
        features: JSON.stringify(plan.features),
        ...(plan.stripePriceId ? { stripePriceId: plan.stripePriceId } : {}),
      },
      create: {
        name: plan.name,
        slug: plan.slug,
        price: plan.price,
        maxAgents: plan.maxAgents,
        maxChannels: plan.maxChannels,
        maxMessages: plan.maxMessages,
        features: JSON.stringify(plan.features),
        stripePriceId: plan.stripePriceId,
      },
    });
  }

  console.log('Production bootstrap completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
