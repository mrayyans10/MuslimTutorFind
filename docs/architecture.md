# Architecture — Community Tutors

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js App Router + TypeScript (strict) |
| UI | React, Tailwind CSS, shadcn/ui |
| Auth | Auth.js (NextAuth v5) — credentials + Google |
| Validation | Zod + React Hook Form |
| Database | PostgreSQL + Prisma ORM + full-text search |
| Email | Resend (demo console fallback) |
| Files | S3-compatible storage (local demo fallback) |
| Tests | Vitest (unit/integration), Playwright (e2e) |
| Lint/format | ESLint, Prettier |

## Application structure

```
src/app          Routes (marketing, auth, dashboards, admin, API)
src/components   Presentational UI
src/lib/services Domain use-cases
src/lib/db       Prisma client + repositories
src/lib/auth     Session, roles, permissions
src/lib/matching Deterministic matching engine
src/lib/validations  Zod schemas
config/          Product name and feature defaults
prisma/          Schema, migrations, seed
```

## Request flow

1. Page or Server Action receives input.  
2. Zod validates.  
3. Session + role permission check (server-side).  
4. Service executes business rules (secular subject checks, minor safety).  
5. Prisma persists; audit log for sensitive admin actions.  
6. Optional email / signed upload URL.

## Auth model

- Email/password with hashed passwords (bcrypt).  
- Email verification, password reset tokens.  
- Google OAuth.  
- Role selection during onboarding.  
- Session cookies (httpOnly, secure in production).  
- Rate limiting on auth and messaging endpoints.  
- Account deactivation and soft deletion with data-retention flags.

## Route groups

| Group | Path prefix | Audience |
|-------|-------------|----------|
| Marketing | `/`, `/find-tutors`, `/subjects`, legal, etc. | Public |
| Auth | `/sign-in`, `/sign-up`, … | Public |
| Learner dashboard | `/dashboard/*` | Student, Parent |
| Tutor | `/tutor/*` | Tutor |
| Admin | `/admin/*` | Moderator (subset), Administrator |

Middleware enforces authenticated routes; fine-grained checks live in services.

## Role-permission matrix (summary)

| Capability | Guest | Student | Parent | Tutor | Mod | Admin |
|------------|-------|---------|--------|-------|-----|-------|
| Search tutors | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View public profiles | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Complete Find Your Tutor | ✓ | ✓ | ✓ | — | — | — |
| Message tutors | — | ✓ | ✓ | ✓ | — | — |
| Post requirements | — | ✓ | ✓ | — | — | — |
| Apply to requirements | — | — | — | ✓* | — | — |
| Manage child profiles | — | — | ✓ | — | — | — |
| Submit verification | — | — | — | ✓ | — | — |
| Moderate reports | — | — | — | — | ✓ | ✓ |
| Approve tutors / settings | — | — | — | — | — | ✓ |

\* Approved, active tutors only.

## Matching

Deterministic weighted scorer in `src/lib/matching`. Hard filters first (approved, active, subject, level, mode, location), then weighted soft factors. Scores and factor breakdowns stored on `TutorMatch` / `MatchFactor`. No AI APIs.

## Observability & audit

Sensitive admin/moderator actions write `AuditLog` rows. Application logs avoid secrets and verification document contents.

## Deployment shape

Single Next.js app + managed PostgreSQL + object storage + Resend. See `docs/deployment.md`.
