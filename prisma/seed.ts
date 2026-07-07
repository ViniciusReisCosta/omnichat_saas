import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: {
      name: 'Starter',
      price: 149,
      maxAgents: 3,
      maxChannels: 2,
      maxMessages: 1000,
      features: JSON.stringify(['Unified Inbox', '2 Channels', 'Basic Chatbot', 'Email Support']),
      stripePriceId: process.env.STRIPE_PRICE_STARTER || null,
    },
    create: {
      name: 'Starter',
      slug: 'starter',
      price: 149,
      maxAgents: 3,
      maxChannels: 2,
      maxMessages: 1000,
      features: JSON.stringify(['Unified Inbox', '2 Channels', 'Basic Chatbot', 'Email Support']),
      stripePriceId: process.env.STRIPE_PRICE_STARTER || null,
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'professional' },
    update: {
      name: 'Professional',
      price: 399,
      maxAgents: 10,
      maxChannels: 5,
      maxMessages: 10000,
      features: JSON.stringify(['Unified Inbox', 'All Channels', 'Advanced Chatbot', 'Auto Assignment', 'Analytics', 'Priority Support']),
      stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || null,
    },
    create: {
      name: 'Professional',
      slug: 'professional',
      price: 399,
      maxAgents: 10,
      maxChannels: 5,
      maxMessages: 10000,
      features: JSON.stringify(['Unified Inbox', 'All Channels', 'Advanced Chatbot', 'Auto Assignment', 'Analytics', 'Priority Support']),
      stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || null,
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'enterprise' },
    update: {
      name: 'Enterprise',
      price: 999,
      maxAgents: 999,
      maxChannels: 10,
      maxMessages: 999999,
      features: JSON.stringify(['Unlimited Agents', 'All Channels', 'AI Chatbot', 'Custom Integrations', 'Dedicated Support', 'SLA Guarantee']),
      stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || null,
    },
    create: {
      name: 'Enterprise',
      slug: 'enterprise',
      price: 999,
      maxAgents: 999,
      maxChannels: 10,
      maxMessages: 999999,
      features: JSON.stringify(['Unlimited Agents', 'All Channels', 'AI Chatbot', 'Custom Integrations', 'Dedicated Support', 'SLA Guarantee']),
      stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || null,
    },
  });

  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@cberhunt.com').trim().toLowerCase();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'super_admin' },
    create: {
      name: 'Super Admin',
      email: adminEmail,
      password: bcrypt.hashSync(adminPassword, 12),
      role: 'super_admin',
      online: false,
    },
  });
}

main()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

