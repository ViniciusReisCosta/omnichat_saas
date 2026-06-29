# CberHunt — Production Deployment (cbersoftware.com.br)

Deploys the CberHunt Next.js app to an Ubuntu VPS (`187.77.36.5`) using:

| Layer | Tool | What it serves |
|-------|------|----------------|
| Web app (frontend + API) | **Next.js** under **pm2**, port `3000` | `cbersoftware.com.br`, `www.cbersoftware.com.br` |
| Database + DB admin | **PostgreSQL 16** + **pgAdmin 4** in **Docker** | pgAdmin at `pgadmin.cbersoftware.com.br` |
| Reverse proxy + TLS | **nginx** + Let's Encrypt (certbot) | all of the above over HTTPS |

> The app is a single Next.js app — the API lives inside it (`/api/*`) and the frontend calls it same-origin. There is **no separate backend service**, so no `api.` subdomain is used.

---

## 1. DNS records — set these at your domain registrar

Point everything at the VPS IP. (No `api.` record needed.)

| Type | Name / Host | Value | TTL |
|------|-------------|-------|-----|
| A | `@`  (cbersoftware.com.br) | `187.77.36.5` | 3600 |
| A | `www` | `187.77.36.5` | 3600 |
| A | `pgadmin` | `187.77.36.5` | 3600 |

If your registrar requires a full name instead of `@`, use `cbersoftware.com.br`.
Wait for propagation before running certbot — verify with:

```bash
dig +short cbersoftware.com.br
dig +short www.cbersoftware.com.br
dig +short pgadmin.cbersoftware.com.br
# each must return 187.77.36.5
```

---

## 2. Server prerequisites (run once on the VPS)

SSH in as a sudo user, then:

```bash
# System
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pm2 (global) + nginx + certbot
sudo npm install -g pm2
sudo apt install -y nginx
sudo apt install -y certbot python3-certbot-nginx

# Docker + Docker Compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # log out/in afterwards so docker runs without sudo
```

Firewall (if `ufw` is enabled):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 3. Get the code onto the server

```bash
sudo mkdir -p /var/www && sudo chown $USER:$USER /var/www
cd /var/www
git clone <your-repo-url> omnichat_saas
cd omnichat_saas
```

---

## 4. Configure environment

```bash
cp .env.example .env
nano .env
```

Fill in **real** values. Generate strong secrets:

```bash
openssl rand -base64 48   # use for JWT_SECRET
openssl rand -base64 24   # use for POSTGRES_PASSWORD (also update DATABASE_URL to match!)
```

> ⚠️ `POSTGRES_PASSWORD` and the password inside `DATABASE_URL` **must be identical**.
> Set `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` — that is your pgAdmin login.

---

## 5. Start the database (Docker)

```bash
docker compose up -d
docker compose ps        # postgres = healthy, pgadmin = running
```

This launches PostgreSQL (bound to `127.0.0.1:5432`) and pgAdmin (bound to `127.0.0.1:5050`).
Both are localhost-only; the public reaches pgAdmin through nginx + HTTPS.

---

## 6. Build & launch the app (pm2)

The helper script installs deps, runs Prisma migration + seed, builds, and starts pm2:

```bash
./deploy/deploy.sh
```

<details>
<summary>What that script runs (equivalent manual steps)</summary>

```bash
npm ci --include=dev
npx prisma generate
npx prisma migrate dev --name init --skip-seed   # first time (creates the Postgres migration)
npm run db:seed
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
```
</details>

Make pm2 start on boot:

```bash
pm2 startup systemd        # run the command it prints
pm2 save
```

Verify the app locally:

```bash
curl -I http://127.0.0.1:3000     # expect HTTP/1.1 200
```

---

## 7. nginx reverse proxy

# NOTE: this server's nginx includes only `sites-enabled/*.conf`, so the
# vhost filenames MUST end in `.conf` (a CloudPanel default.conf catch-all
# returns 444 for any host that doesn't match a loaded server block).

# Main site (cbersoftware.com.br + www)
sudo cp deploy/nginx/cbersoftware.com.br.conf /etc/nginx/sites-available/cbersoftware.com.br.conf
sudo ln -sf /etc/nginx/sites-available/cbersoftware.com.br.conf /etc/nginx/sites-enabled/

# pgAdmin
sudo cp deploy/nginx/pgadmin.cbersoftware.com.br.conf /etc/nginx/sites-available/pgadmin.cbersoftware.com.br.conf
sudo ln -sf /etc/nginx/sites-available/pgadmin.cbersoftware.com.br.conf /etc/nginx/sites-enabled/

sudo nginx -t && sudo systemctl reload nginx
```

---

## 8. HTTPS (Let's Encrypt)

After DNS has propagated (step 1), let certbot obtain certs and rewrite the nginx
configs to HTTPS automatically:

```bash
sudo certbot --nginx \
  -d cbersoftware.com.br -d www.cbersoftware.com.br \
  -d pgadmin.cbersoftware.com.br \
  --redirect --agree-tos -m admin@cbersoftware.com.br --no-eff-email

sudo systemctl reload nginx
```

Auto-renewal is installed by default; test it with:

```bash
sudo certbot renew --dry-run
```

---

## 9. Verify

- https://cbersoftware.com.br  → app loads (and `www` redirects/works)
- https://pgadmin.cbersoftware.com.br → pgAdmin login (use `PGADMIN_DEFAULT_EMAIL` / password)

**Connect pgAdmin to your database** (first login → *Add New Server*):

| Field | Value |
|-------|-------|
| Name | CberHunt |
| Host name/address | `cberhunt_postgres` (the container name — pgAdmin shares the Docker network) |
| Port | `5432` |
| Maintenance DB | `omniconnect` (your `POSTGRES_DB`) |
| Username | `omniconnect` (your `POSTGRES_USER`) |
| Password | your `POSTGRES_PASSWORD` |

> Use the host `cberhunt_postgres`, not `localhost` — inside the pgAdmin container, `localhost` is pgAdmin itself.

**Demo logins** (from the seed): `admin@cberhunt.com` / `admin123`.

---

## Day-2 operations

```bash
# Update / redeploy after pushing new code
cd /var/www/omnichat_saas && ./deploy/deploy.sh

# App logs / status
pm2 status
pm2 logs cberhunt

# Database containers
docker compose ps
docker compose logs -f postgres
docker compose restart pgadmin

# Database backup
docker exec -t cberhunt_postgres pg_dump -U omniconnect omniconnect > backup_$(date +%F).sql

# Restore
cat backup_YYYY-MM-DD.sql | docker exec -i cberhunt_postgres psql -U omniconnect -d omniconnect
```

---

## Architecture summary

```
                        ┌───────────────── Ubuntu VPS 187.77.36.5 ─────────────────┐
  Internet  ── 80/443 ──►  nginx (TLS via Let's Encrypt)                            │
                        │     ├─ cbersoftware.com.br / www  ──► 127.0.0.1:3000  (Next.js, pm2)
                        │     └─ pgadmin.cbersoftware.com.br ──► 127.0.0.1:5050  (pgAdmin, Docker)
                        │                                                          │
                        │   Next.js (pm2) ──► 127.0.0.1:5432 ──► PostgreSQL (Docker)
                        └───────────────────────────────────────────────────────────┘
```
