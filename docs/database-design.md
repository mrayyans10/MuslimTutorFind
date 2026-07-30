# Database Design — Community Tutors

## Overview

PostgreSQL via Prisma. Soft deletes where appropriate (`deletedAt`). Timestamps on all mutable entities. Enums for statuses. Currency as ISO 4217 strings + decimal amounts. Approximate location only for public fields.

## Core identity

- **User** — email, password hash, role, status, emailVerifiedAt, deactivatedAt, deletedAt  
- **Account / Session / VerificationToken** — Auth.js tables  
- **StudentProfile / ParentProfile / TutorProfile** — role-specific profiles  
- **ChildProfile + ParentChildRelationship** — parent-managed learners  

## Tutoring domain

- **SubjectCategory → Subject → Specialization** (+ aliases, curricula)  
- **TutorSubject** — rates, levels, modes, goals supported  
- **TutorQualification / TutorCertification / TutorLanguage**  
- **TutorGeneralAvailability** — descriptive only (days, periods)  
- **TutorLocation** — city/region/country + travel preferences (no public street address)  
- **TutorVerification + VerificationDocument** — private docs, review workflow  
- **TutorApplicationReview** — admin profile approval trail  

## Marketplace

- **TutoringRequirement** — student/parent posts  
- **TutorRequirementApplication** — tutor applications  

## Find Your Tutor

- **FindTutorQuestionnaire** — saved progress + answers JSON  
- **TutorMatch + MatchFactor** — score, breakdown, explanations  

## Communication & safety

- **Conversation / ConversationParticipant / Message / MessageAttachment**  
- **Review / ReviewResponse**  
- **UserReport / UserBlock / ModerationCase**  
- **Notification / NotificationPreference**  

## Platform config

- **AuditLog**  
- **CommunityGuideline**  
- **ProhibitedSubject**  
- **SiteSetting / FeatureFlag**  

## Status enums (selected)

| Entity | Statuses |
|--------|----------|
| TutorProfile | DRAFT, SUBMITTED, UNDER_REVIEW, CHANGES_REQUESTED, APPROVED, REJECTED, SUSPENDED, DEACTIVATED |
| TutorVerification | NOT_SUBMITTED, SUBMITTED, UNDER_REVIEW, CHANGES_REQUESTED, VERIFIED, REJECTED, SUSPENDED |
| TutoringRequirement | DRAFT, PUBLISHED, PAUSED, CLOSED, EXPIRED, REMOVED |
| TutorRequirementApplication | SUBMITTED, VIEWED, SHORTLISTED, ACCEPTED, DECLINED, WITHDRAWN |
| User | ACTIVE, PENDING_VERIFICATION, SUSPENDED, BANNED, DEACTIVATED, DELETED |

## Indexes & search

- Unique: user email, tutor slug, subject slug  
- FTS: tutor display name, headline, biography; subject name/aliases  
- Composite indexes for search filters (subject, mode, country, rate, rating, verified)  

## Privacy notes

- Child full legal name, photo, school, exact address, phone, personal email are never public.  
- Verification documents accessible only to authorized admins via signed URLs.  
- Soft delete supports retention/export before hard purge.
