# OmniConnect

Multi-channel customer communication SaaS: unified inbox, team and company management, rule-based chatbot helpers, and subscription-oriented data models. Built as a [Next.js](https://nextjs.org/) App Router application with a Portuguese (pt-BR) marketing surface and JWT-based sessions.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 14 (App Router), React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS, PostCSS, Font Awesome (CDN) |
| Database | SQLite via [Prisma](https://www.prisma.io/) ORM |
| Auth | `jsonwebtoken`, `bcryptjs`; token stored client-side as `omni_token` |
| Payments (schema) | Stripe fields on `Company` / `Plan`; `stripe` package is listed for future checkout flows |

## Features (current app)

- **Marketing**: Home, pricing, about, contact (`src/app/…`).
- **Auth**: Register and login pages; `/api/auth/login`, `/api/auth/register`, `/api/auth/me`.
- **Dashboard** (authenticated): overview, inbox, channels, agents, companies (role-dependent), chatbot rules, settings.
- **REST API**: Companies, agents, conversations, and messages under `src/app/api/`.
- **Chatbot**: Keyword/response rules per company (`ChatbotRule` model, dashboard UI).

## Prerequisites

- **Node.js** 20.x (matches `@types/node` in the project; LTS is fine).
- **npm** (or compatible client using `package-lock.json`).

## Getting started

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd omnichat_saas
   npm install
   ```

2. **Environment**

   Create a `.env` file in the project root:

   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-long-random-secret"
   ```

   Use a strong `JWT_SECRET` in production. If it is omitted, the app falls back to a development default (see `src/lib/auth.ts`).

3. **Database**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   This applies Prisma migrations and loads demo companies, users, channels, conversations, messages, plans, and chatbot rules.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server (after `build`) |
| `npm run lint` | ESLint via Next.js |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:reset` | Reset database and re-run migrations (destructive) |
| `npm run db:studio` | Open Prisma Studio |

## Project layout

```
src/app/           # App Router pages and API route handlers
src/components/    # Shared UI (e.g. Header, Footer, Providers)
src/contexts/      # React context (Auth)
src/lib/           # Prisma client, auth helpers, API/chatbot utilities
prisma/            # schema.prisma, migrations, seed.ts
```

## API overview

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Register user (optional company) |
| POST | `/api/auth/login` | Login; returns JWT |
| GET | `/api/auth/me` | Current user (Bearer token) |
| GET, POST | `/api/companies` | List / create companies |
| GET, PATCH, DELETE | `/api/companies/[id]` | Single company |
| GET, POST | `/api/agents` | List / create agents |
| GET, PATCH, DELETE | `/api/agents/[id]` | Single agent |
| GET, POST | `/api/conversations` | List / create conversations |
| GET, PATCH, DELETE | `/api/conversations/[id]` | Single conversation |
| GET, POST | `/api/conversations/[id]/messages` | Messages for a conversation |

## Seed data (demo logins)

After `npm run db:seed`, you can sign in with accounts such as:

| Email | Password | Role |
|-------|----------|------|
| `admin@omniconnect.com` | `admin123` | Super admin |
| `carlos@techbrasil.com` | `123456` | Company admin (TechBrasil) |
| `maria@techbrasil.com` | `123456` | Agent |

Additional agents and a second company admin are defined in `prisma/seed.ts`.

## Production notes

- Point `DATABASE_URL` to your production database; SQLite is convenient for local development only.
- Set a secure `JWT_SECRET` and never rely on the fallback secret.
- Run `npm run build` then `npm run start` (or deploy on a platform that runs Next.js builds).

## License

Private project (`"private": true` in `package.json`). Add a license file if you intend to open-source or distribute the codebase.
