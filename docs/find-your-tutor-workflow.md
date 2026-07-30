# Find Your Tutor Workflow

Guided, mobile-first questionnaire. Guests may complete it; registration is required only to message a tutor. Progress is saved (session cookie for guests; DB for authenticated users).

## Steps

| # | Question | Notes |
|---|----------|-------|
| 1 | Who needs tutoring? | Myself / My child / Another family member |
| 2 | Subject | Searchable secular subject picker + popular shortcuts |
| 3 | Topic / specialization | Options depend on subject |
| 4 | Current learner level | School bands + beginner/intermediate/advanced |
| 5 | Curriculum | Provincial, IB, AP, GCSE, etc. / Not sure |
| 6 | Learning goal | Grades, concepts, homework, exam, catch up, etc. |
| 7 | When needed | ASAP → flexible |
| 8 | Online or in-person | If in-person/either: country, city, area, travel prefs — no exact address |
| 9 | Preferred schedule | Days, periods, sessions/week, duration — descriptive only |
| 10 | Budget | Min/max + currency + allow slightly higher toggle |
| 11 | Tutor preferences | Optional: experience, language, qualifications, verified-only, teaching style, optional gender (jurisdiction-configurable) |
| 12 | Results | Ranked matches with score, reasons, mismatches |

## UX rules

- Progress indicator; back/forward navigation  
- One clear question per step on mobile  
- Secular subjects only; prohibited terms rejected  
- No booking, calendar, favourites, compare, trial, or video CTAs on results  

## Persistence

`FindTutorQuestionnaire` stores step, answers JSON, and completedAt. Matching writes `TutorMatch` rows with `MatchFactor` breakdowns for explainability.
