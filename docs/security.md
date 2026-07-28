# Security

## Threat mitigations

| Threat | Control |
|--------|---------|
| SQL injection | Prisma parameterized queries only |
| XSS | React escaping + sanitize rich text; CSP headers |
| CSRF | SameSite cookies + Auth.js CSRF; Server Actions origin checks |
| Broken access control | Server-side permission checks on every mutation/query |
| IDOR | Ownership + role checks before load |
| Unrestricted uploads | MIME allowlist, size limits, virus-scan hook point, private storage |
| Brute-force login | Rate limits + generic error messages |
| Account enumeration | Identical responses for unknown/known emails on auth flows |
| Message spam | Rate limits + report/block |
| Privilege escalation | Role enums; admin routes middleware; no client-trusted role |
| Private verification docs | Signed short-lived URLs; admin-only |

## Auth requirements

- Secure password hashing (bcrypt cost ≥ 12)  
- Email verification before full access where configured  
- Password reset tokens single-use, expiring  
- Session rotation on privilege change  
- Audit logs for admin/moderator sensitive actions  

## Secrets

All secrets in environment variables. Never commit `.env`. See `.env.example`.

## Input validation

All external input validated with Zod schemas in `src/lib/validations`.
