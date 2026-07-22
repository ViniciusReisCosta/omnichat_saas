# CberHunt

Multi-channel customer communication SaaS built with Next.js App Router. Runtime API calls should point to the NestJS backend through `NEXT_PUBLIC_API_URL`.

## Stack

| Area | Choice |
|------|--------|
| Framework | Next.js 14, React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS, Font Awesome CDN |
| Backend API | NestJS backend in `D:\nodeprojects\omnichat_backend` |
| Auth | JWT in HTTP-only `cber_session` cookie from the backend |
| Database | PostgreSQL through TypeORM in the backend |
| Billing | Stripe checkout/webhook routes in the backend |

## Local Development

Requirements:

- Node.js 20.x
- npm

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set local values:

```env
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. Configure and start the backend:

```bash
cd D:\nodeprojects\omnichat_backend
copy .env.example .env
npm run db:prepare:dev
npm run start:dev
```

4. Start the frontend development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Model

Recommended deployment:

- Deploy this Next.js frontend separately from the API.
- Deploy the NestJS backend in `D:\nodeprojects\omnichat_backend` as a separate API service.
- Use Railway Postgres, Heroku Postgres, or another managed PostgreSQL provider for backend data.
- Configure `NEXT_PUBLIC_API_URL` with the backend URL.
- Configure `FRONTEND_ORIGIN` in the backend with this frontend URL.

Required production variables:

```env
APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

Build and start:

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
| `npm run prod:check-env` | Validate required production environment variables |
| `npm run prod:verify` | Validate env and production build |

## Data Notes

Operational dashboard screens are wired to database-backed NestJS API routes. Notification preferences, API keys, invoice history, channel catalog, quick replies, and public metrics are backed by real endpoints.
