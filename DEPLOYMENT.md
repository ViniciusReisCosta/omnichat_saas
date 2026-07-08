# Production Deployment: Next.js Frontend + NestJS API

This project now uses a separate NestJS backend in `D:\nodeprojects\omnichat_backend`. The frontend calls that API through `NEXT_PUBLIC_API_URL`.

Recommended setup:

- Railway, Heroku, VPS, or another Node host: hosts the Next.js frontend.
- Heroku, Railway, VPS, or another Node host: hosts the NestJS backend.
- Managed PostgreSQL: stores backend data.
- Hostinger: manages the domain DNS only.

## 1. Services

Create services for:

- PostgreSQL.
- NestJS backend from `D:\nodeprojects\omnichat_backend`.
- Next.js frontend from this repository.

Frontend variables:

```env
APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

Backend variables:

```env
PORT=4000
FRONTEND_ORIGIN=https://your-domain.com
FRONTEND_ORIGIN_SUFFIXES=your-vercel-team.vercel.app
APP_URL=https://your-domain.com
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
SESSION_COOKIE_SAME_SITE=none
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PROFESSIONAL=
STRIPE_PRICE_ENTERPRISE=
```

Set Stripe variables only when billing checkout/webhooks are active.

## 2. Build And Start Frontend

Railway can use the standard npm scripts:

```bash
npm install
npm run build
npm run start
```

If Railway asks for explicit commands:

```bash
# Build command
npm run build

# Start command
npm run start
```

## 3. Backend Schema And Seed

The backend owns schema creation and seed. On Heroku this runs through the backend `Procfile` release phase. To run the same preparation manually:

```bash
cd D:\nodeprojects\omnichat_backend
npm run db:prepare
```

The seed upserts plans, channel types, and the super admin only. It does not create demo companies, contacts, conversations, or messages.

## 4. Hostinger DNS

In Hostinger, point the production domain to Railway using the DNS target Railway gives you for the custom domain.

Typical flow:

1. Add the custom domain in Railway for the app service.
2. Railway provides the DNS record to create.
3. Add that DNS record in Hostinger.
4. Wait for DNS propagation.
5. Set `APP_URL`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_API_URL` to the final HTTPS origins.
6. Set backend `FRONTEND_ORIGIN` to the frontend HTTPS origin.

## 5. Verification

After deploy, verify:

- `https://your-domain.com` loads the marketing site.
- `https://your-api-domain.com/api/health` returns `{ "status": "ok" }`.
- `/register` creates a company and user through the NestJS API.
- `/login` creates the `cber_session` cookie.
- `/dashboard` reads real database data.
- `https://your-api-domain.com/api/plans` returns plan records.
- Stripe checkout plans have real `stripePriceId` values if billing is enabled.
- Stripe webhook URL, if enabled, is `https://your-api-domain.com/api/payments/webhook`.

## 6. VPS Script

`deploy/deploy.sh` remains available for a VPS/pm2 frontend deployment. Backend deployment and database preparation are handled from `D:\nodeprojects\omnichat_backend`.
