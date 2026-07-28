# Community Tutors — MVP Walkthrough

## What was built

A production-oriented tutoring marketplace MVP named **Community Tutors** (configurable in `config/product.ts`) for Muslim communities, offering **secular academic tutoring only**.

## How to run locally

```bash
pnpm install
cp .env.example .env
pnpm db:migrate && pnpm db:seed
pnpm dev
```

Demo password: `Password123!`  
Accounts: `admin@example.com`, `moderator@example.com`, `student@example.com`, `parent@example.com`, `tutor1@example.com`, …

## Core flows verified

| Flow | Status |
|------|--------|
| Typecheck / lint / build | Pass |
| Unit + integration tests (17) | Pass |
| Playwright smoke (6) | Pass |
| Seed: 27 tutors, 43 subjects | Pass |

## Product highlights

- Multi-role auth (student, parent, tutor, moderator, admin)
- Tutor profiles, verification, admin approval
- Search + Find Your Tutor explainable matching
- Requirements + applications (no bookings/payments)
- Messaging, reviews (eligibility-gated), reports/blocks
- Prohibited religious-subject rejection
- Full docs under `docs/`

## Manual configuration still required for production

- Strong `AUTH_SECRET`, real Postgres, Resend API key, S3 credentials, Google OAuth
- Professional legal review of draft policies
