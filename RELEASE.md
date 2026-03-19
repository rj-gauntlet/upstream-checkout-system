# Release Notes

> Deployed on 2026-03-18 | Platform: Railway

## Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | [https://frontend-production-1c67.up.railway.app](https://frontend-production-1c67.up.railway.app) |
| **Backend API** | [https://backend-production-7531.up.railway.app](https://backend-production-7531.up.railway.app) |
| **Database** | PostgreSQL 16 (Railway private network) |
| **GitHub Repo** | [https://github.com/rj-gauntlet/upstream-checkout-system](https://github.com/rj-gauntlet/upstream-checkout-system) |

## Deployment Architecture

- **Frontend**: React 19 + Vite 8 SPA built to static files, served by nginx in a Docker container
- **Backend**: Django 5.2 LTS + gunicorn in a Docker container, connected to Railway PostgreSQL via private network
- **Database**: Railway-managed PostgreSQL 16 with persistent volume

## Services Configuration

### Backend
- Docker image: `python:3.12-slim`
- Start: `migrate --noinput && gunicorn config.wsgi:application`
- Workers: 2
- Static files: WhiteNoise (CompressedStaticFilesStorage)

### Frontend
- Docker multi-stage build: `node:20-alpine` (build) + `nginx:alpine` (serve)
- Vite env vars baked at build time via Docker ARGs
- nginx template with dynamic `$PORT` substitution

## Environment Variables

### Backend (14 vars)
- `DATABASE_URL` — Railway Postgres reference
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`
- `PORT`

### Frontend (3 vars)
- `VITE_API_URL` — Backend production URL
- `VITE_STRIPE_PUBLIC_KEY` — Stripe publishable key
- `VITE_PAYPAL_CLIENT_ID` — PayPal sandbox client ID

## What's Deployed

### Features
- Product catalog with 15 literacy curriculum products across 4 categories
- Full shopping cart (guest + authenticated, merge on login)
- Stripe test mode payments (card: `4242 4242 4242 4242`)
- PayPal sandbox payments
- User registration and authentication (JWT)
- Order management with status tracking
- Analytics event tracking with dashboard API
- Django admin with Unfold theme
- Branded UI matching Upstream Education's visual identity

### Test Credentials
- **Admin**: Create via `python manage.py createsuperuser`
- **Stripe test card**: `4242 4242 4242 4242`, any future expiry, any CVC
- **PayPal sandbox buyer**: Use sandbox personal account from PayPal Developer Dashboard

## Post-Deployment Notes

- Railway trial: 7 days / $5 credit remaining at time of deployment
- Stripe webhook endpoint not configured for production (local dev only)
- Email backend is console-based (no SMTP configured)
- Seed data loads automatically on first deploy via management command
