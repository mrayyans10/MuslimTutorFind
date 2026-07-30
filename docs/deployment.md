# Deployment

## Prerequisites

- Node.js 20+  
- PostgreSQL 15+  
- Object storage (S3-compatible) or local demo mode  
- Resend API key (or demo email mode)  
- Auth.js secret; optional Google OAuth credentials  

## Environment

Copy `.env.example` → `.env` and fill values. Never commit secrets.

## Database

```bash
pnpm prisma migrate deploy
pnpm prisma db seed
```

## Build & run

```bash
pnpm install
pnpm build
pnpm start
```

## Demo / local

```bash
pnpm dev
```

Local mode uses filesystem storage under `.uploads/` and logs emails to the console when Resend is unset.

## CI

GitHub Actions runs lint, typecheck, unit tests, and Playwright against a service Postgres.

## Production checklist

- [ ] TLS termination  
- [ ] Strong `AUTH_SECRET`  
- [ ] Managed Postgres backups  
- [ ] Private bucket for verification docs  
- [ ] Legal review of draft policies  
- [ ] Rate limiting at edge  
- [ ] Monitoring/alerting  
