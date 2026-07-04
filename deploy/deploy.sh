#!/usr/bin/env bash
# CberHunt deploy/update script for a VPS deployment.
# Run from the project root:
#   cd /var/www/omnichat_saas && ./deploy/deploy.sh
#
# Assumes: .env exists, Docker/Postgres is running or available through
# docker compose, Node 20 and pm2 are installed.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull --ff-only || echo "   (skip git pull: not a clean fast-forward)"

echo "==> Ensuring database containers are running"
docker compose up -d

echo "==> Installing dependencies"
npm ci --include=dev

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database migrations"
npm run db:deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "==> Seeding database because RUN_SEED=true"
  echo "    Do not enable this against production data."
  npm run db:seed
else
  echo "==> Skipping database seed"
fi

echo "==> Building Next.js"
npm run build

echo "==> (Re)starting app under pm2"
pm2 startOrReload ecosystem.config.js --env production
pm2 save

echo "==> Done. App is live on port 3000."
