import type { LearnerLevel, TeachingStyle, TutoringMode } from "@prisma/client";

export const LEARNER_LEVELS: LearnerLevel[] = [
  "ELEMENTARY",
  "MIDDLE_SCHOOL",
  "HIGH_SCHOOL",
  "COLLEGE",
  "ADULT",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

export const TUTORING_MODES: TutoringMode[] = ["ONLINE", "IN_PERSON", "EITHER"];

export const TEACHING_STYLES: TeachingStyle[] = [
  "PATIENT_ENCOURAGING",
  "STRUCTURED_ORGANIZED",
  "EXAM_FOCUSED",
  "PROJECT_BASED",
  "INTERACTIVE",
  "FLEXIBLE_ADAPTIVE",
];

export const LEARNING_GOALS = [
  "IMPROVE_GRADES",
  "UNDERSTAND_CONCEPTS",
  "HOMEWORK_SUPPORT",
  "EXAM_PREP",
  "CATCH_UP",
  "GET_AHEAD",
  "PROJECT_GUIDANCE",
  "UNIVERSITY_PREP",
  "TECHNICAL_SKILL",
  "BUILD_CONFIDENCE",
  "OTHER",
] as const;

export const URGENCY_OPTIONS = [
  "ASAP",
  "FEW_DAYS",
  "TWO_WEEKS",
  "ONE_MONTH",
  "FLEXIBLE",
] as const;
