# CberHunt

Multi-channel customer communication SaaS built with Next.js App Router, API routes, Prisma, PostgreSQL, JWT sessions in HTTP-only cookies, and Stripe-ready billing fields.

The app is a single Next.js application. The frontend pages and backend API live together in this repository under `src/app` and `src/app/api`.

## Stack

| Area | Choice |
|------|--------|
| Framework | Next.js 14, React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS, Font Awesome CDN |
| Database | PostgreSQL through Prisma |
| Auth | JWT in HTTP-only `cber_session` cookie |
| Billing | Stripe checkout/webhook routes, backed by `Company` and `Plan` fields |

## Local Development

Requirements:

- Node.js 20.x
- npm
- Docker Desktop, if using the included local PostgreSQL service

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set local values:

```env
POSTGRES_USER=omniconnect
POSTGRES_PASSWORD=senha123
POSTGRES_DB=omniconnect
DATABASE_URL="postgresql://omniconnect:senha123@127.0.0.1:5432/omniconnect?schema=public"
JWT_SECRET="replace-with-a-long-local-secret"
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
PGADMIN_DEFAULT_EMAIL=admin@local.test
PGADMIN_DEFAULT_PASSWORD=admin123
```

3. Start PostgreSQL:

```bash
docker compose up -d postgres
```

4. Apply migrations and optionally load demo data:

```bash
npm run db:migrate
npm run db:seed
```

`npm run db:seed` resets demo data. Do not run it against production data.

5. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Model

Recommended deployment:

- Railway hosts the full Next.js app, including `/api/*` backend routes.
- Railway Postgres or another managed PostgreSQL provider stores production data.
- Hostinger is used only for domain/DNS, pointing the domain to Railway.

Do not split Hostinger frontend and Railway backend unless the app is intentionally refactored for cross-origin cookies and CORS. The current app expects same-origin frontend/API requests.

Required production variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

Run production migrations with:

```bash
npm run db:deploy
npm run db:bootstrap
```

Then build and start:

```bash
npm run build
npm run start
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build production app |
| `npm run start` | Start production server after build |
| `npm run lint` | Run Next.js lint command |
| `npm run postinstall` | Generate Prisma Client after dependency install |
| `npm run db:migrate` | Create/apply local Prisma dev migrations |
| `npm run db:deploy` | Apply existing Prisma migrations in production |
| `npm run db:bootstrap` | Upsert required production plans without deleting data |
| `npm run db:seed` | Reset and load demo data for local/dev |
| `npm run db:reset` | Destructive local database reset |
| `npm run db:studio` | Open Prisma Studio |
| `npm run prod:check-env` | Validate required production environment variables |
| `npm run prod:verify` | Validate env, Prisma Client/schema, and production build |

## Demo Accounts

After `npm run db:seed`:

| Email | Password | Role |
|-------|----------|------|
| `admin@cberhunt.com` | `admin123` | Super admin |
| `carlos@techbrasil.com` | `123456` | Company admin |
| `maria@techbrasil.com` | `123456` | Agent |

## Data Notes

Operational dashboard screens are wired to database-backed API routes where a Prisma model exists. Areas without a persistence model, such as notification preferences, API keys, and invoice history, are shown as unavailable instead of displaying fake records.

For production, run `npm run db:bootstrap` after migrations to create or update the required `Plan` records. This script uses upserts and does not delete companies, users, conversations, or messages.
