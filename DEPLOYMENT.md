# Production Deployment: Railway + Hostinger DNS

This project should be deployed as one Next.js application. The frontend and backend API routes are served by the same app and should share the same HTTPS origin.

Recommended setup:

- Railway: hosts the Next.js app and PostgreSQL.
- Hostinger: manages the domain DNS only.
- No separate `api.` backend is required for the current architecture.

## 1. Railway Services

Create a Railway project with:

- One PostgreSQL database service.
- One app service connected to this repository.

Configure these variables on the app service:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=replace-with-a-long-random-secret
APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PROFESSIONAL=
STRIPE_PRICE_ENTERPRISE=
```

Set Stripe variables only when billing checkout/webhooks are active.

## 2. Build And Start

Railway can use the standard npm scripts:

```bash
npm install
npm run build
npm run start
```

`npm install` runs `postinstall`, which generates the Prisma Client for the Railway environment.

If Railway asks for explicit commands:

```bash
# Build command
npm run build

# Start command
npm run start
```

## 3. Database Migrations

Apply migrations to production with:

```bash
npm run db:deploy
npm run db:bootstrap
```

Do not run:

```bash
npm run db:seed
```

The seed script deletes and recreates demo data. It is only for local development or disposable staging environments. Use `db:bootstrap` in production because it upserts required plans without deleting existing data.

## 4. Hostinger DNS

In Hostinger, point the production domain to Railway using the DNS target Railway gives you for the custom domain.

Typical flow:

1. Add the custom domain in Railway for the app service.
2. Railway provides the DNS record to create.
3. Add that DNS record in Hostinger.
4. Wait for DNS propagation.
5. Set `APP_URL` and `NEXT_PUBLIC_APP_URL` to the final HTTPS domain in Railway.

Keep frontend and API on the same domain. The app uses HTTP-only cookies and same-origin API calls.

## 5. Verification

After deploy:

```bash
npm run db:deploy
```

Then verify:

- `https://your-domain.com` loads the marketing site.
- `/register` creates a company and user in PostgreSQL.
- `/login` creates the `cber_session` cookie.
- `/dashboard` reads real database data.
- `/api/plans` returns plan records.
- Stripe checkout plans have real `stripePriceId` values if billing is enabled.
- Stripe webhook URL, if enabled, is `https://your-domain.com/api/payments/webhook`.

## 6. VPS Script

`deploy/deploy.sh` remains available for a VPS/pm2 deployment. It now skips seed by default. To seed an empty disposable environment, run:

```bash
RUN_SEED=true ./deploy/deploy.sh
```

Do not use `RUN_SEED=true` against production data.
