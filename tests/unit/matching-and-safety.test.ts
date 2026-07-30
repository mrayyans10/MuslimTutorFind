import { describe, expect, it } from "vitest";
import {
  matchTutor,
  rankTutors,
  DEFAULT_MATCH_WEIGHTS,
  type MatchAnswers,
  type TutorCandidate,
} from "@/lib/matching/engine";
import { assertSecularSubjectSync, FALLBACK_PROHIBITED } from "@/lib/moderation/prohibited-subjects";
import { can, isAdmin, isStaff } from "@/lib/auth/permissions";

function baseTutor(overrides: Partial<TutorCandidate> = {}): TutorCandidate {
  return {
    id: "tutor-1",
    displayName: "Amina Rahman",
    headline: "Calculus tutor",
    biography: "Helps high-school learners with calculus.",
    yearsExperience: 8,
    isVerified: true,
    averageRating: 4.8,
    reviewCount: 12,
    teachingStyles: ["PATIENT_ENCOURAGING", "STRUCTURED_ORGANIZED"],
    subjects: [
      {
        subjectId: "subj-calc",
        subjectName: "Calculus",
        specializationName: "Differential calculus",
        curriculumName: "Ontario curriculum",
        minLevel: "HIGH_SCHOOL",
        maxLevel: "COLLEGE",
        onlineAvailable: true,
        inPersonAvailable: false,
        homeworkGuidance: true,
        examPreparation: true,
        projectGuidance: false,
        hourlyRate: 45,
        currency: "CAD",
        yearsExperience: 8,
      },
    ],
    languages: [{ language: "English", proficiency: "Fluent" }],
    qualifications: [{ title: "B.Sc. Mathematics" }],
    availability: [
      { dayOfWeek: "MONDAY", period: "EVENING" },
      { dayOfWeek: "WEDNESDAY", period: "EVENING" },
    ],
    location: {
      onlineAvailable: true,
      inPersonAvailable: false,
      city: "Toronto",
      country: "Canada",
    },
    ...overrides,
  };
}

function baseAnswers(overrides: Partial<MatchAnswers> = {}): MatchAnswers {
  return {
    subjectId: "subj-calc",
    topic: "Differential calculus",
    learnerLevel: "HIGH_SCHOOL",
    curriculum: "Ontario curriculum",
    learningGoal: "EXAM_PREP",
    mode: "ONLINE",
    budgetMin: 30,
    budgetMax: 50,
    currency: "CAD",
    scheduleDays: ["MONDAY"],
    schedulePeriods: ["EVENING"],
    preferredLanguage: "English",
    teachingStyles: ["PATIENT_ENCOURAGING"],
    ...overrides,
  };
}

describe("matching engine", () => {
  it("returns null when subject does not match", () => {
    const result = matchTutor(baseTutor(), baseAnswers({ subjectId: "other" }));
    expect(result).toBeNull();
  });

  it("returns null for unlisted in-person when only online requested ok but mode incompatible", () => {
    const tutor = baseTutor({
      subjects: [
        {
          ...baseTutor().subjects[0],
          onlineAvailable: false,
          inPersonAvailable: true,
        },
      ],
      location: {
        onlineAvailable: false,
        inPersonAvailable: true,
        city: "Toronto",
        country: "Canada",
      },
    });
    expect(matchTutor(tutor, baseAnswers({ mode: "ONLINE" }))).toBeNull();
  });

  it("scores approved-compatible tutors between 0 and 100 with explanation", () => {
    const result = matchTutor(baseTutor(), baseAnswers());
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
    expect(result!.explanation).toMatch(/% match/i);
    expect(result!.factors.length).toBeGreaterThan(0);
    expect(result!.factors.every((f) => f.weight > 0)).toBe(true);
  });

  it("ranks higher when topic and curriculum align", () => {
    const good = baseTutor({ id: "good" });
    const weaker = baseTutor({
      id: "weaker",
      isVerified: false,
      subjects: [
        {
          ...baseTutor().subjects[0],
          specializationName: "Unrelated topic",
          curriculumName: "CBSE",
          hourlyRate: 90,
        },
      ],
    });
    const ranked = rankTutors([weaker, good], baseAnswers(), DEFAULT_MATCH_WEIGHTS);
    expect(ranked[0].tutorId).toBe("good");
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
  });

  it("excludes tutors when verifiedOnly is set and tutor is not verified", () => {
    const tutor = baseTutor({ isVerified: false });
    expect(matchTutor(tutor, baseAnswers({ verifiedOnly: true }))).toBeNull();
  });
});

describe("prohibited religious subjects", () => {
  it("rejects Quran and related terms", () => {
    for (const term of ["Quran tutoring", "Tajweed lessons", "Hadith class", "Islamic studies"]) {
      const result = assertSecularSubjectSync(term, FALLBACK_PROHIBITED);
      expect(result.ok).toBe(false);
    }
  });

  it("allows secular academic subjects", () => {
    for (const term of ["Calculus", "Organic chemistry", "Python programming", "SAT mathematics"]) {
      expect(assertSecularSubjectSync(term, FALLBACK_PROHIBITED).ok).toBe(true);
    }
  });
});

describe("permissions", () => {
  it("allows guests to search and complete questionnaire", () => {
    expect(can(null, "search:tutors")).toBe(true);
    expect(can(null, "complete:find_your_tutor")).toBe(true);
    expect(can(null, "message:tutor")).toBe(false);
    expect(can(null, "admin:users")).toBe(false);
  });

  it("restricts admin and moderator capabilities", () => {
    expect(can("STUDENT", "moderate:content")).toBe(false);
    expect(can("MODERATOR", "moderate:content")).toBe(true);
    expect(can("MODERATOR", "admin:settings")).toBe(false);
    expect(can("ADMINISTRATOR", "admin:settings")).toBe(true);
    expect(isStaff("MODERATOR")).toBe(true);
    expect(isAdmin("MODERATOR")).toBe(false);
    expect(isAdmin("ADMINISTRATOR")).toBe(true);
  });

  it("only approved tutor workflow permissions for tutors", () => {
    expect(can("TUTOR", "apply:requirement")).toBe(true);
    expect(can("TUTOR", "post:requirement")).toBe(false);
    expect(can("PARENT", "manage:child_profiles")).toBe(true);
  });
});
