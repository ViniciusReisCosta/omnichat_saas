const requiredVariables = ['DATABASE_URL', 'JWT_SECRET', 'APP_URL', 'NEXT_PUBLIC_APP_URL'];

const missing = requiredVariables.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required production variables: ${missing.join(', ')}`);
  process.exit(1);
}

const appUrl = process.env.APP_URL || '';
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || '';

if (!appUrl.startsWith('https://') || !publicAppUrl.startsWith('https://')) {
  console.error('APP_URL and NEXT_PUBLIC_APP_URL must use https:// in production.');
  process.exit(1);
}

if (appUrl !== publicAppUrl) {
  console.error('APP_URL and NEXT_PUBLIC_APP_URL must match for same-origin cookies/API calls.');
  process.exit(1);
}

if ((process.env.STRIPE_SECRET_KEY || process.env.STRIPE_WEBHOOK_SECRET) && (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)) {
  console.error('Set both STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET when Stripe billing is enabled.');
  process.exit(1);
}

console.log('Production environment check passed.');
