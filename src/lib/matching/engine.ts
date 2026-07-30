import type { LearnerLevel, TeachingStyle, TutoringMode } from "@prisma/client";

export type MatchAnswers = {
  subjectId: string;
  subjectName?: string;
  topic?: string;
  specializationId?: string;
  learnerLevel: LearnerLevel;
  curriculum?: string;
  learningGoal?: string;
  whenNeeded?: string;
  mode: TutoringMode;
  country?: string;
  city?: string;
  approximateArea?: string;
  travelDistanceKm?: number;
  tutorComes?: boolean;
  learnerTravels?: boolean;
  publicMeeting?: boolean;
  scheduleDays?: string[];
  schedulePeriods?: string[];
  sessionsPerWeek?: number;
  sessionDurationMinutes?: number;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  allowSlightlyHigher?: boolean;
  preferredExperienceYears?: number;
  preferredLanguage?: string;
  requiredQualifications?: string[];
  verifiedOnly?: boolean;
  teachingStyles?: TeachingStyle[];
  genderPreference?: string | null;
};

export type TutorCandidate = {
  id: string;
  displayName: string;
  headline: string | null;
  biography: string | null;
  yearsExperience: number;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  teachingStyles: TeachingStyle[];
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    specializationName?: string | null;
    curriculumName?: string | null;
    minLevel: LearnerLevel;
    maxLevel: LearnerLevel;
    onlineAvailable: boolean;
    inPersonAvailable: boolean;
    homeworkGuidance: boolean;
    examPreparation: boolean;
    projectGuidance: boolean;
    hourlyRate: number;
    currency: string;
    yearsExperience: number;
  }>;
  languages: Array<{ language: string; proficiency: string }>;
  qualifications: Array<{ title: string }>;
  availability: Array<{ dayOfWeek: string; period: string }>;
  location: {
    onlineAvailable: boolean;
    inPersonAvailable: boolean;
    city?: string | null;
    region?: string | null;
    country?: string | null;
    travelRadiusKm?: number | null;
    tutorTravels?: boolean;
    studentTravels?: boolean;
    publicMeetingOk?: boolean;
  } | null;
};

export type MatchFactorResult = {
  factorKey: string;
  weight: number;
  score: number;
  reason: string;
};

export type MatchResult = {
  tutorId: string;
  score: number;
  explanation: string;
  mismatches: string[];
  factors: MatchFactorResult[];
};

/** Default weights — overridable via SiteSetting key `matching.weights` */
export const DEFAULT_MATCH_WEIGHTS: Record<string, number> = {
  topic: 18,
  curriculum: 12,
  learningGoal: 10,
  schedule: 10,
  budget: 12,
  language: 8,
  qualifications: 8,
  teachingStyle: 6,
  experience: 6,
  verification: 5,
  rating: 5,
};

const LEVEL_ORDER: LearnerLevel[] = [
  "ELEMENTARY",
  "MIDDLE_SCHOOL",
  "HIGH_SCHOOL",
  "COLLEGE",
  "ADULT",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

function levelInRange(
  level: LearnerLevel,
  min: LearnerLevel,
  max: LearnerLevel,
): boolean {
  // School-band levels
  const school = ["ELEMENTARY", "MIDDLE_SCHOOL", "HIGH_SCHOOL", "COLLEGE", "ADULT"];
  if (school.includes(level) && school.includes(min) && school.includes(max)) {
    return school.indexOf(level) >= school.indexOf(min) && school.indexOf(level) <= school.indexOf(max);
  }
  // Skill levels map loosely onto experience bands
  if (["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(level)) {
    return true;
  }
  return LEVEL_ORDER.includes(level);
}

function modeCompatible(
  requested: TutoringMode,
  online: boolean,
  inPerson: boolean,
): boolean {
  if (requested === "ONLINE") return online;
  if (requested === "IN_PERSON") return inPerson;
  return online || inPerson;
}

function locationCompatible(answers: MatchAnswers, tutor: TutorCandidate): boolean {
  if (answers.mode === "ONLINE") return true;
  const loc = tutor.location;
  if (!loc?.inPersonAvailable) {
    // If either mode and tutor is online-only, still ok via online
    return answers.mode === "EITHER" && (loc?.onlineAvailable ?? tutor.subjects.some((s) => s.onlineAvailable));
  }
  if (answers.country && loc.country && answers.country.toLowerCase() !== loc.country.toLowerCase()) {
    return false;
  }
  if (answers.city && loc.city && answers.city.toLowerCase() !== loc.city.toLowerCase()) {
    // Soft: allow if approximate area or same country — hard fail only when cities clearly differ and no travel
    if (!loc.tutorTravels && !loc.studentTravels) return false;
  }
  return true;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function matchTutor(
  tutor: TutorCandidate,
  answers: MatchAnswers,
  weights: Record<string, number> = DEFAULT_MATCH_WEIGHTS,
): MatchResult | null {
  const subjectRows = tutor.subjects.filter((s) => s.subjectId === answers.subjectId);
  if (subjectRows.length === 0) return null;

  const subject =
    subjectRows.find((s) =>
      levelInRange(answers.learnerLevel, s.minLevel, s.maxLevel),
    ) ?? null;
  if (!subject) return null;

  const online = subject.onlineAvailable || Boolean(tutor.location?.onlineAvailable);
  const inPerson = subject.inPersonAvailable || Boolean(tutor.location?.inPersonAvailable);
  if (!modeCompatible(answers.mode, online, inPerson)) return null;
  if (!locationCompatible(answers, tutor)) return null;
  if (answers.verifiedOnly && !tutor.isVerified) return null;

  const factors: MatchFactorResult[] = [];
  const mismatches: string[] = [];
  let weightedSum = 0;
  let weightTotal = 0;

  const add = (factorKey: string, score: number, reason: string) => {
    const weight = weights[factorKey] ?? 0;
    if (weight <= 0) return;
    weightTotal += weight;
    weightedSum += weight * clamp(score);
    factors.push({ factorKey, weight, score: clamp(score), reason });
  };

  // Topic / specialization
  const topic = (answers.topic ?? "").toLowerCase();
  const spec = (subject.specializationName ?? "").toLowerCase();
  if (!topic) {
    add("topic", 70, "Subject matches; no specific topic was requested.");
  } else if (spec && (spec.includes(topic) || topic.includes(spec))) {
    add("topic", 100, `Specialization aligns with “${answers.topic}”.`);
  } else if (subject.subjectName.toLowerCase().includes(topic) || topic.includes(subject.subjectName.toLowerCase())) {
    add("topic", 80, `Topic relates to ${subject.subjectName}.`);
  } else {
    add("topic", 40, "Subject matches, but specialization may differ.");
    mismatches.push("Topic/specialization may not be an exact match.");
  }

  // Curriculum
  const cur = (answers.curriculum ?? "").toLowerCase();
  const tutorCur = (subject.curriculumName ?? "").toLowerCase();
  if (!cur || cur === "not sure" || cur === "other") {
    add("curriculum", 75, "Curriculum preference was flexible.");
  } else if (tutorCur && (tutorCur.includes(cur) || cur.includes(tutorCur))) {
    add("curriculum", 100, `Supports the ${answers.curriculum} curriculum.`);
  } else if (!tutorCur) {
    add("curriculum", 55, "Tutor did not list a specific curriculum.");
    mismatches.push("Curriculum support is not explicitly listed.");
  } else {
    add("curriculum", 35, "Listed curriculum differs from your preference.");
    mismatches.push(`Tutor curriculum (${subject.curriculumName}) differs from ${answers.curriculum}.`);
  }

  // Learning goal
  const goal = answers.learningGoal ?? "";
  let goalScore = 70;
  let goalReason = "Can support general academic goals.";
  if (goal === "HOMEWORK_SUPPORT" && subject.homeworkGuidance) {
    goalScore = 100;
    goalReason = "Offers homework guidance.";
  } else if (goal === "EXAM_PREP" && subject.examPreparation) {
    goalScore = 100;
    goalReason = "Offers exam preparation.";
  } else if (goal === "PROJECT_GUIDANCE" && subject.projectGuidance) {
    goalScore = 100;
    goalReason = "Offers project guidance.";
  } else if (goal) {
    goalScore = 80;
    goalReason = "Teaching options align with common learning goals.";
  }
  add("learningGoal", goalScore, goalReason);

  // Schedule
  const days = answers.scheduleDays ?? [];
  const periods = answers.schedulePeriods ?? [];
  if (days.length === 0 && periods.length === 0) {
    add("schedule", 70, "Schedule preference was flexible.");
  } else {
    const hits = tutor.availability.filter(
      (a) =>
        (days.length === 0 || days.includes(a.dayOfWeek)) &&
        (periods.length === 0 || periods.includes(a.period)),
    ).length;
    if (hits > 0) {
      add("schedule", Math.min(100, 60 + hits * 10), "General availability overlaps your preferred times.");
    } else if (tutor.availability.length === 0) {
      add("schedule", 50, "Tutor has not listed detailed availability.");
      mismatches.push("Schedule overlap could not be confirmed.");
    } else {
      add("schedule", 25, "Listed availability may not overlap your preferences.");
      mismatches.push("Preferred schedule may not overlap.");
    }
  }

  // Budget
  const rate = subject.hourlyRate;
  const max = answers.budgetMax;
  const min = answers.budgetMin ?? 0;
  if (max == null) {
    add("budget", 70, "No maximum budget was set.");
  } else {
    const ceiling = answers.allowSlightlyHigher ? max * 1.15 : max;
    if (rate >= min && rate <= max) {
      add("budget", 100, "Hourly rate fits your budget.");
    } else if (rate <= ceiling) {
      add("budget", 75, "Hourly rate is slightly above budget but within your flexibility.");
    } else if (rate < min) {
      add("budget", 85, "Hourly rate is below your minimum (often a positive).");
    } else {
      add("budget", 20, "Hourly rate is above your budget.");
      mismatches.push(`Rate (${rate} ${subject.currency}) exceeds budget.`);
    }
  }

  // Language
  const lang = (answers.preferredLanguage ?? "").toLowerCase();
  if (!lang) {
    add("language", 70, "No language preference set.");
  } else if (tutor.languages.some((l) => l.language.toLowerCase() === lang)) {
    add("language", 100, `Speaks ${answers.preferredLanguage}.`);
  } else {
    add("language", 30, "Preferred language not listed.");
    mismatches.push(`Preferred language (${answers.preferredLanguage}) not listed.`);
  }

  // Qualifications
  const required = answers.requiredQualifications ?? [];
  if (required.length === 0) {
    add("qualifications", tutor.qualifications.length > 0 ? 80 : 60, "Qualifications reviewed.");
  } else {
    const matched = required.filter((q) =>
      tutor.qualifications.some((tq) => tq.title.toLowerCase().includes(q.toLowerCase())),
    ).length;
    const ratio = matched / required.length;
    add(
      "qualifications",
      Math.round(ratio * 100),
      matched ? `Matched ${matched}/${required.length} requested qualifications.` : "Requested qualifications not clearly listed.",
    );
    if (matched < required.length) mismatches.push("Some requested qualifications were not found.");
  }

  // Teaching style
  const styles = answers.teachingStyles ?? [];
  if (styles.length === 0) {
    add("teachingStyle", 70, "No teaching-style preference set.");
  } else {
    const overlap = styles.filter((s) => tutor.teachingStyles.includes(s)).length;
    if (overlap > 0) {
      add("teachingStyle", Math.min(100, 60 + overlap * 20), "Teaching style preferences overlap.");
    } else {
      add("teachingStyle", 40, "Teaching style preference may differ.");
    }
  }

  // Experience
  const years = Math.max(tutor.yearsExperience, subject.yearsExperience);
  const want = answers.preferredExperienceYears ?? 0;
  if (!want) {
    add("experience", clamp(40 + years * 5), `${years} years of tutoring experience.`);
  } else if (years >= want) {
    add("experience", 100, `Meets preferred experience (${years} years).`);
  } else {
    add("experience", clamp(100 * (years / want)), `Has ${years} years; you preferred ${want}+.`);
    mismatches.push("Years of experience below preferred minimum.");
  }

  // Verification
  add(
    "verification",
    tutor.isVerified ? 100 : 45,
    tutor.isVerified ? "Verified tutor." : "Not yet verified.",
  );

  // Rating (capped influence via weight)
  if (tutor.reviewCount === 0) {
    add("rating", 55, "No reviews yet.");
  } else {
    add("rating", clamp((tutor.averageRating / 5) * 100), `Rated ${tutor.averageRating.toFixed(1)} from ${tutor.reviewCount} reviews.`);
  }

  const score = weightTotal === 0 ? 0 : Math.round(weightedSum / weightTotal);

  const highlights = factors
    .filter((f) => f.score >= 80)
    .slice(0, 4)
    .map((f) => f.reason.replace(/\.$/, ""));

  const explanation =
    highlights.length > 0
      ? `${score}% match because ${highlights.join("; ").toLowerCase()}.`
      : `${score}% match based on subject fit and your preferences.`;

  return {
    tutorId: tutor.id,
    score,
    explanation,
    mismatches,
    factors,
  };
}

export function rankTutors(
  tutors: TutorCandidate[],
  answers: MatchAnswers,
  weights: Record<string, number> = DEFAULT_MATCH_WEIGHTS,
): MatchResult[] {
  return tutors
    .map((t) => matchTutor(t, answers, weights))
    .filter((m): m is MatchResult => m !== null)
    .sort((a, b) => b.score - a.score)
    .map((m, i) => ({ ...m, rank: i + 1 }) as MatchResult & { rank?: number });
}
