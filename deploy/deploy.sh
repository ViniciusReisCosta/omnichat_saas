#!/usr/bin/env bash
# CberHunt deploy/update script for a VPS deployment.
# Run from the project root:
#   cd /var/www/omnichat_saas && ./deploy/deploy.sh
#
# Assumes: .env exists, the separate NestJS backend is deployed and reachable
# through NEXT_PUBLIC_API_URL, Node 20 and pm2 are installed.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull --ff-only || echo "   (skip git pull: not a clean fast-forward)"

echo "==> Installing dependencies"
npm ci --include=dev

echo "==> Building Next.js"
npm run build

echo "==> (Re)starting app under pm2"
pm2 startOrReload ecosystem.config.js --env production
pm2 save

echo "==> Done. App is live on port 3000."
