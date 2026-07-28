import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

const requiredText = (label: string, max = 120) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

const secularOnlyPattern =
  /\b(qur'?an|tajweed|hadith|tafsir|fiqh|aqe?edah|islamic\s+(studies|jurisprudence|theology)|fatwa|religious\s+(counselling|counseling|instruction)|shariah?|sunnah\s+studies)\b/i;

const secularText = (label: string, max = 500) =>
  requiredText(label, max).refine((value) => !secularOnlyPattern.test(value), {
    message: "Community Tutors supports secular subjects only. Remove religious instruction terms.",
  });

const booleanConfirmation = z.literal(true, {
  errorMap: () => ({ message: "You must confirm this to continue." }),
});

const learnerLevelSchema = z.enum([
  "ELEMENTARY",
  "MIDDLE_SCHOOL",
  "HIGH_SCHOOL",
  "COLLEGE",
  "ADULT",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

const tutoringModeSchema = z.enum(["ONLINE", "IN_PERSON", "EITHER"]);

export const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  legalName: requiredText("Legal name"),
  displayName: requiredText("Display name"),
  role: z.enum(["STUDENT", "PARENT", "TUTOR"]),
  country: optionalText(80),
  city: optionalText(80),
  phone: optionalText(40),
  timezone: optionalText(80),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32, "Reset token is invalid."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const studentProfileSchema = z.object({
  ageBand: optionalText(40),
  schoolLevel: optionalText(80),
  preferredSubjects: z.array(secularText("Subject", 120)).max(12).default([]),
  preferredLanguage: optionalText(80),
  tutoringMode: tutoringModeSchema.optional(),
});

export const parentProfileSchema = z.object({
  phone: optionalText(40),
});

export const childProfileSchema = z.object({
  displayNickname: requiredText("Display nickname"),
  privateLegalName: optionalText(120),
  ageBand: requiredText("Age band", 40),
  gradeLevel: optionalText(80),
  subjects: z.array(secularText("Subject", 120)).max(12).default([]),
  curriculum: optionalText(120),
  learningGoals: optionalText(1_000),
  preferredLanguage: optionalText(80),
  accommodations: optionalText(1_000),
  allowPublicPhoto: z.boolean().default(false),
  photoUrl: optionalText(500),
  parentCanViewMessages: z.boolean().default(true),
});

export const tutorRegistrationAccountSchema = signUpSchema.extend({
  role: z.literal("TUTOR"),
});

export const tutorCommunityEligibilitySchema = z.object({
  communityAttested: booleanConfirmation,
  secularSubjectsOnly: booleanConfirmation,
  conductAgreed: booleanConfirmation,
  noReligiousInstruction: booleanConfirmation,
  termsAccepted: booleanConfirmation,
  guidelinesAccepted: booleanConfirmation,
});

export const tutorProfessionalSchema = z.object({
  headline: optionalText(160),
  biography: requiredText("Biography", 4_000),
  teachingApproach: optionalText(4_000),
  yearsExperience: z.coerce.number().int().min(0).max(80),
  currentOccupation: optionalText(160),
  educationSummary: optionalText(2_000),
  teachingStyles: z
    .array(
      z.enum([
        "PATIENT_ENCOURAGING",
        "STRUCTURED_ORGANIZED",
        "EXAM_FOCUSED",
        "PROJECT_BASED",
        "INTERACTIVE",
        "FLEXIBLE_ADAPTIVE",
      ]),
    )
    .max(6)
    .default([]),
  gender: optionalText(80),
  qualifications: z
    .array(
      z.object({
        title: requiredText("Qualification title", 160),
        institution: optionalText(160),
        year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
        description: optionalText(1_000),
      }),
    )
    .max(12)
    .default([]),
  certifications: z
    .array(
      z.object({
        name: requiredText("Certification name", 160),
        issuer: optionalText(160),
        year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
      }),
    )
    .max(12)
    .default([]),
  languages: z
    .array(
      z.object({
        language: requiredText("Language", 80),
        proficiency: requiredText("Proficiency", 80),
      }),
    )
    .max(12)
    .default([]),
});

export const tutorSubjectsSchema = z.object({
  subjectNote: optionalText(1_000).refine((value) => !value || !secularOnlyPattern.test(value), {
    message: "Community Tutors supports secular subjects only. Remove religious instruction terms.",
  }),
  subjects: z
    .array(
      z.object({
        subjectId: z.string().min(1, "Subject is required."),
        subjectName: secularText("Subject name", 160).optional(),
        specializationId: optionalText(80),
        specializationName: optionalText(160).refine((value) => !value || !secularOnlyPattern.test(value), {
          message: "Community Tutors supports secular subjects only. Remove religious instruction terms.",
        }),
        curriculumId: optionalText(80),
        minLevel: learnerLevelSchema,
        maxLevel: learnerLevelSchema,
        yearsExperience: z.coerce.number().int().min(0).max(80).default(0),
        onlineAvailable: z.boolean().default(true),
        inPersonAvailable: z.boolean().default(false),
        individualTutoring: z.boolean().default(true),
        homeworkGuidance: z.boolean().default(true),
        examPreparation: z.boolean().default(true),
        projectGuidance: z.boolean().default(false),
        hourlyRate: z.coerce.number().positive().max(10_000),
        currency: z.string().trim().length(3).default("CAD"),
      }),
    )
    .min(1, "Add at least one secular subject.")
    .max(20),
});

export const tutorScheduleSchema = z.object({
  availability: z
    .array(
      z.object({
        dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
        period: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
        timeRangeNote: optionalText(120),
      }),
    )
    .max(21)
    .default([]),
});

export const tutorLocationSchema = z.object({
  onlineAvailable: z.boolean().default(true),
  inPersonAvailable: z.boolean().default(false),
  tutorTravels: z.boolean().default(false),
  studentTravels: z.boolean().default(false),
  publicMeetingOk: z.boolean().default(true),
  travelRadiusKm: z.coerce.number().int().min(0).max(500).optional(),
  city: optionalText(80),
  region: optionalText(80),
  country: optionalText(80),
  approximateArea: optionalText(160),
  latitudeApprox: z.coerce.number().min(-90).max(90).optional(),
  longitudeApprox: z.coerce.number().min(-180).max(180).optional(),
  privateAddressNote: optionalText(500),
});

export const tutorVerificationSubmitSchema = z.object({
  documents: z
    .array(
      z.object({
        type: z.enum(["GOVERNMENT_ID", "DEGREE", "CERTIFICATION", "RESUME", "OTHER"]),
        fileName: requiredText("File name", 255),
        mimeType: requiredText("MIME type", 120),
        sizeBytes: z.coerce.number().int().positive(),
        storageKey: requiredText("Storage key", 500),
      }),
    )
    .min(1, "Upload at least one verification document."),
  submitForVerification: booleanConfirmation,
});

export const tutorFinalSubmitSchema = z.object({
  profileComplete: booleanConfirmation,
  secularPolicyConfirmed: booleanConfirmation,
  readyForReview: booleanConfirmation,
});

export const tutorRegistrationSchemas = {
  account: tutorRegistrationAccountSchema,
  communityEligibility: tutorCommunityEligibilitySchema,
  professional: tutorProfessionalSchema,
  subjects: tutorSubjectsSchema,
  schedule: tutorScheduleSchema,
  location: tutorLocationSchema,
  verificationSubmit: tutorVerificationSubmitSchema,
  finalSubmit: tutorFinalSubmitSchema,
};

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
