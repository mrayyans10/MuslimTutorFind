# Product Requirements — Community Tutors

> Working product name is stored in `config/product.ts` and can be changed in one place.

## Purpose

Community Tutors is a tutoring marketplace that helps Muslim students, parents, and tutors connect for **secular academic education** only. The platform supports Muslim communities by connecting Muslim tutors with Muslim students and families for school, college, and professional academic subjects.

**Religious instruction is prohibited.** The product must never offer Quran, Tajweed, Hadith, Tafsir, Fiqh, Aqeedah, Islamic studies, fatwa services, religious counselling, or any religious instruction.

## Scope boundary

### In scope (TeacherOn-style)

1. Tutor, student, and parent registration  
2. Tutor profiles (online and in-person)  
3. Tutor search and subject categories  
4. Tutoring requirement posts and tutor applications  
5. Tutor verification and admin approval  
6. Ratings and reviews (eligibility-gated)  
7. Messaging between tutors and students/parents  
8. Role dashboards: tutor, student, parent, admin/moderator  

### In scope (single Preply-inspired feature)

- Guided **Find Your Tutor** questionnaire and explainable matching workflow  

### Explicitly out of scope

Trial lessons, booking, calendars, online classroom, video lessons, favourites, compare, subscriptions, payments/payouts, Stripe Connect, lesson packages, attendance, whiteboard, file sharing for classrooms, assignment/essay/cheating services, group classes, webinars, profile videos, AI ranking.

Payments and lesson arrangements happen privately outside the platform. Tutors may display an hourly rate; no banking or card data is stored.

## Roles

| Role | Summary |
|------|---------|
| Guest | Browse, search, start Find Your Tutor (limited results until register to message) |
| Student | Profile, search, requirements, messages, reviews, reports/blocks |
| Parent | Profile, child profiles, search/match for children, requirements, messages with minor controls |
| Tutor | Profile, subjects, verification, apply to requirements, messages, review responses |
| Moderator | Reports, content moderation, prohibited subjects, escalate to admin |
| Administrator | Full user/tutor/subject/matching/settings/audit management |

## Secular subject policy

Allowed examples: Mathematics, English, Physics, Chemistry, Biology, Computer science, Programming, Statistics, Engineering, Economics, Accounting, Business, Geography, History, test prep, homework support, school/college/university subjects, professional/technical skills.

Prohibited examples must be blocked in: tutor registration, subject creation, profile submission, tutoring requests, search filters, community guidelines, terms, admin moderation, and content validation.

## MVP acceptance criteria

See root README. Core path: register → secular tutor profile → admin approve → search/match → requirement → application → message → eligible review → report/block → admin moderate; religious subjects rejected; minor safety enforced; tests pass.
