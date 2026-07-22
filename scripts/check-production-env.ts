const requiredVariables = [
  'APP_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_API_URL',
];

const missing = requiredVariables.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required production variables: ${missing.join(', ')}`);
  process.exit(1);
}

const appUrl = process.env.APP_URL || '';
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || '';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

if (!appUrl.startsWith('https://') || !publicAppUrl.startsWith('https://') || !apiUrl.startsWith('https://')) {
  console.error('APP_URL, NEXT_PUBLIC_APP_URL, and NEXT_PUBLIC_API_URL must use https:// in production.');
  process.exit(1);
}

if (appUrl !== publicAppUrl) {
  console.error('APP_URL and NEXT_PUBLIC_APP_URL must match for frontend canonical URLs.');
  process.exit(1);
}

console.log('Production environment check passed.');
