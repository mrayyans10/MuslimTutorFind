# Community Moderation

## Guidelines themes

Respectful communication; academic integrity; **no religious instruction**; no discriminatory harassment; no inappropriate adult-minor communication; no exam cheating; no tutors completing graded work; no false qualifications; no fake reviews; no spam; no public exact addresses; no abusive/unsafe conduct.

## Moderator capabilities

- Review reported profiles and messages  
- Moderate tutoring requirements and reviews  
- Enforce prohibited-subject rules  
- Suspend inappropriate content  
- Escalate to administrators  

## Administrator capabilities

All moderator powers plus: user management; tutor approval/verification; subjects & prohibited subjects; matching weights; community guideline CMS; site settings; audit log access; permanent bans.

## Workflows

1. User/report creates `UserReport` → `ModerationCase`  
2. Moderator investigates, adds internal notes  
3. Action: dismiss, warn, remove content, suspend, escalate  
4. `AuditLog` records actor, action, target, metadata  

## Prohibited subjects

`ProhibitedSubject` table + validation helpers reject matching terms on subject creation, tutor subjects, requirements, and search suggestions.
