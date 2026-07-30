# Matching Engine

Deterministic, explainable scorer. **No AI / external ranking APIs.**

## Hard filters (must pass)

1. Tutor profile `APPROVED` and not soft-deleted/suspended  
2. Subject matches selected subject  
3. Learner level within tutor subject min/max  
4. Online / in-person mode compatible  
5. For in-person: country (+ city/area when provided) compatible  

Unapproved tutors never appear. Tutors who do not teach the subject never appear.

## Soft weighted factors (admin-configurable via SiteSetting)

Default weights (sum ≈ 100 contribution scale, normalized to 0–100):

| Factor | Default weight |
|--------|----------------|
| Topic / specialization | 18 |
| Curriculum | 12 |
| Learning goal | 10 |
| General schedule | 10 |
| Budget | 12 |
| Tutor language | 8 |
| Qualifications | 8 |
| Teaching style | 6 |
| Years of experience | 6 |
| Verification status | 5 |
| Rating | 5 |

Ratings alone must not dominate (capped weight).

## Output

- Score 0–100  
- Factor breakdown stored in `MatchFactor`  
- Human-readable explanation, e.g.  
  “92% match because this tutor teaches high-school calculus, supports the Ontario curriculum, offers online tutoring, fits your budget, and is generally available during weekday evenings.”  
- Important mismatches listed separately  

## Non-goals

- No sponsored placement hidden in organic results  
- No claim that scores are AI-generated  
- No availability-calendar matching  
- No booking side effects
