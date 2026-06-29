#!/usr/bin/env bash
# OmniConnect deploy/update script — run from the project root on the VPS.
#   cd /var/www/omnichat_saas && ./deploy/deploy.sh
# Assumes: .env already created, Docker (Postgres+pgAdmin) already up, Node 20 + pm2 installed.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull --ff-only || echo "   (skip git pull — not a clean fast-forward)"

echo "==> Ensuring database containers are running"
docker compose up -d

echo "==> Installing dependencies (incl. dev — needed for next build & prisma seed)"
npm ci --include=dev

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database migrations"
# Creates the initial migration on first run; applies existing ones afterwards.
if [ -d prisma/migrations ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  npx prisma migrate dev --name init --skip-seed
fi

echo "==> Seeding database (safe to re-run — seed resets demo data)"
npm run db:seed

echo "==> Building Next.js"
npm run build

echo "==> (Re)starting app under pm2"
pm2 startOrReload ecosystem.config.js --env production
pm2 save

echo "==> Done. App is live on port 3000 (behind nginx)."
