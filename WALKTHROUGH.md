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

## Recent improvements

- Message tutor flow at `/messages/new`
- Report tutor flow at `/report`
- Session-aware header with Dashboard + Sign out
- Mobile dashboard navigation
- Tutor setup checklist at `/tutor/setup`
- Guest Find Your Tutor results claimed after sign-in/sign-up
- Home hero uses a real study-session visual
- Local demo signup activates immediately without Resend

## Demo logins

Password: `Password123!`  
`admin@example.com` · `student@example.com` · `parent@example.com` · `tutor1@example.com`
