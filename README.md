# Community Tutors

Working product name for a tutoring marketplace that helps Muslim students, parents, and tutors connect for **secular academic education** only.

> Change the product name in [`config/product.ts`](config/product.ts).

Religious instruction (Quran, Tajweed, Hadith, Tafsir, Fiqh, Aqeedah, Islamic studies, fatwa services, etc.) is **not** offered and is rejected by validation and moderation.

## Features (MVP)

- Tutor, student, and parent registration (with child learner profiles)
- Tutor profiles, verification, and administrator approval
- Tutor search (online and in-person) with filters
- Tutoring requirements and tutor applications (no bookings or payments)
- Guided **Find Your Tutor** questionnaire with explainable match scores
- Messaging, reports, blocks, and eligibility-gated reviews
- Moderator and administrator dashboards
- Prohibited-subject enforcement and audit logs

**Not included:** lesson booking, calendars, payments/payouts, trial lessons, online classrooms, favourites, profile videos, or subscriptions.

Payments and lesson arrangements happen privately between tutors and families outside the platform. Tutors may display an hourly rate; banking and card data are never stored.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · shadcn-style UI · PostgreSQL · Prisma · Auth.js · Zod · React Hook Form · Vitest · Playwright

## Quick start

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 15+

### Setup

```bash
pnpm install
cp .env.example .env
# Edit DATABASE_URL and AUTH_SECRET in .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:4000](http://localhost:4000).

### Demo accounts

Password for all seeded users: `Password123!`

| Role | Email |
|------|-------|
| Administrator | `admin@example.com` |
| Moderator | `moderator@example.com` |
| Student | `student@example.com` |
| Parent | `parent@example.com` |
| Tutors | `tutor1@example.com` … `tutorN@example.com` |

### Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Local development server |
| `pnpm build` / `pnpm start` | Production build |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit + integration (Vitest) |
| `pnpm test:e2e` | Playwright end-to-end |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Load fictional demo data |

## Documentation

- [Product requirements](docs/product-requirements.md)
- [Architecture](docs/architecture.md)
- [Database design](docs/database-design.md)
- [Find Your Tutor workflow](docs/find-your-tutor-workflow.md)
- [Matching engine](docs/matching-engine.md)
- [Security](docs/security.md)
- [Child safety](docs/child-safety.md)
- [Community moderation](docs/community-moderation.md)
- [Deployment](docs/deployment.md)
- [Implementation plan](docs/implementation-plan.md)
- [Phase 1 repository review](docs/phase-1-repository-review.md)

## Environment

See [`.env.example`](.env.example). Demo mode logs emails to the console when `RESEND_API_KEY` is unset and stores uploads under `.uploads/` when `STORAGE_DRIVER=local`.

## Legal templates

Draft policy pages include: *“Draft template — obtain professional legal review before production use.”*
