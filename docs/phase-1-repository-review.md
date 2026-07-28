# Phase 1: Repository Review

## Existing codebase

| Item | Status |
|------|--------|
| Application source | **None** — greenfield repository |
| `README.md` | Stub only (`# MuslimTutorFind`) — will be replaced |
| Package manager / lockfile | Not present |
| Next.js / React / TypeScript | Not present |
| Prisma / database | Not present |
| Auth, UI, tests, CI | Not present |
| Reusable components | None |

**Verdict:** Start from a clean Next.js App Router project. No existing application code to preserve beyond replacing the stub README.

## Missing dependencies (to be added)

- Next.js (App Router), React, TypeScript (strict)
- Tailwind CSS, shadcn/ui primitives, Lucide icons
- PostgreSQL + Prisma ORM
- Auth.js (NextAuth v5) with credentials + Google
- Zod, React Hook Form, `@hookform/resolvers`
- bcryptjs / argon2 for password hashing
- Resend (transactional email; demo mode when unset)
- Object storage client (S3-compatible; local filesystem fallback for demo)
- Vitest, Playwright, Testing Library
- ESLint, Prettier, Husky optional
- `tsx` for seed scripts

## Reusable code

Nothing reusable exists. All modules will be original.

## Proposed high-level architecture

```
Browser → Next.js App Router (RSC + Server Actions / Route Handlers)
       → Domain services (auth, matching, messaging, moderation)
       → Prisma → PostgreSQL (FTS)
       → Object storage (verification docs, attachments)
       → Email provider (Resend)
```

Layering:

1. **UI** — `app/`, `components/`
2. **Validation** — `lib/validations/` (Zod)
3. **Authorization** — `lib/auth/permissions.ts`
4. **Business logic** — `lib/services/`
5. **Data access** — `lib/db/` + Prisma
6. **Integrations** — email, storage, rate limiting

## Proposed file tree

```
/
├── .env.example
├── .github/workflows/ci.yml
├── README.md
├── docs/
│   ├── product-requirements.md
│   ├── architecture.md
│   ├── database-design.md
│   ├── find-your-tutor-workflow.md
│   ├── matching-engine.md
│   ├── security.md
│   ├── child-safety.md
│   ├── community-moderation.md
│   ├── deployment.md
│   ├── implementation-plan.md
│   └── phase-1-repository-review.md
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── config/
│   └── product.ts                 # PRODUCT_NAME = "Community Tutors"
├── src/
│   ├── app/
│   │   ├── (marketing)/           # public pages
│   │   ├── (auth)/                # sign-in, sign-up, etc.
│   │   ├── dashboard/             # student/parent
│   │   ├── tutor/                 # tutor area
│   │   ├── admin/                 # admin/moderator
│   │   ├── api/                   # auth, uploads, webhooks
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn
│   │   ├── layout/
│   │   ├── tutors/
│   │   ├── find-your-tutor/
│   │   ├── messaging/
│   │   ├── admin/
│   │   └── forms/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── email/
│   │   ├── storage/
│   │   ├── matching/
│   │   ├── moderation/
│   │   ├── rate-limit/
│   │   ├── services/
│   │   ├── validations/
│   │   └── utils/
│   └── types/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── playwright.config.ts
├── vitest.config.ts
└── package.json
```

## Manual configuration still required

- PostgreSQL connection string
- Auth.js `AUTH_SECRET` and Google OAuth credentials
- Resend API key (optional in demo mode)
- Object storage credentials (local fallback available)
- Production domain / HTTPS

## Next phase

Phase 2: product documentation, database design, route map, permission matrix, matching and security plans.
