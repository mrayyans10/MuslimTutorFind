import type { LearnerLevel, Prisma, TeachingStyle, TutoringMode } from "@prisma/client";
import { prisma } from "@/lib/db";
import { DEFAULT_MATCH_WEIGHTS, type MatchAnswers, rankTutors, type TutorCandidate } from "@/lib/matching/engine";

type GenerateTutorMatchesInput = {
  questionnaireId: string;
  answers?: MatchAnswers;
  limit?: number;
};

function decimalToNumber(value: Prisma.Decimal | number) {
  return typeof value === "number" ? value : value.toNumber();
}

function isRecord(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function answersFromJson(value: Prisma.JsonValue): MatchAnswers {
  if (!isRecord(value)) {
    throw new Error("Questionnaire answers are invalid.");
  }

  const subjectId = value.subjectId;
  const learnerLevel = value.learnerLevel;
  const mode = value.mode;

  if (typeof subjectId !== "string" || typeof learnerLevel !== "string" || typeof mode !== "string") {
    throw new Error("Questionnaire answers must include subjectId, learnerLevel, and mode.");
  }

  return {
    ...(value as Record<string, unknown>),
    subjectId,
    learnerLevel: learnerLevel as LearnerLevel,
    mode: mode as TutoringMode,
  } as MatchAnswers;
}

function weightsFromJson(value: Prisma.JsonValue | undefined) {
  if (!value || !isRecord(value)) return DEFAULT_MATCH_WEIGHTS;

  const weights: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
      weights[key] = raw;
    }
  }

  return Object.keys(weights).length > 0 ? { ...DEFAULT_MATCH_WEIGHTS, ...weights } : DEFAULT_MATCH_WEIGHTS;
}

export async function loadApprovedTutors(): Promise<TutorCandidate[]> {
  const tutors = await prisma.tutorProfile.findMany({
    where: {
      status: "APPROVED",
      deletedAt: null,
      user: { status: "ACTIVE" },
      subjects: { some: {} },
    },
    include: {
      user: { select: { displayName: true, legalName: true } },
      subjects: {
        include: {
          subject: { select: { id: true, name: true } },
          specialization: { select: { name: true } },
          curriculum: { select: { name: true } },
        },
      },
      languages: { select: { language: true, proficiency: true } },
      qualifications: { select: { title: true } },
      availability: { select: { dayOfWeek: true, period: true } },
      location: true,
    },
  });

  return tutors.map((tutor) => ({
    id: tutor.id,
    displayName: tutor.user.displayName ?? tutor.user.legalName ?? "Tutor",
    headline: tutor.headline,
    biography: tutor.biography,
    yearsExperience: tutor.yearsExperience,
    isVerified: tutor.isVerified,
    averageRating: tutor.averageRating,
    reviewCount: tutor.reviewCount,
    teachingStyles: tutor.teachingStyles as TeachingStyle[],
    subjects: tutor.subjects.map((subject) => ({
      subjectId: subject.subject.id,
      subjectName: subject.subject.name,
      specializationName: subject.specialization?.name ?? null,
      curriculumName: subject.curriculum?.name ?? null,
      minLevel: subject.minLevel,
      maxLevel: subject.maxLevel,
      onlineAvailable: subject.onlineAvailable,
      inPersonAvailable: subject.inPersonAvailable,
      homeworkGuidance: subject.homeworkGuidance,
      examPreparation: subject.examPreparation,
      projectGuidance: subject.projectGuidance,
      hourlyRate: decimalToNumber(subject.hourlyRate),
      currency: subject.currency,
      yearsExperience: subject.yearsExperience,
    })),
    languages: tutor.languages,
    qualifications: tutor.qualifications,
    availability: tutor.availability,
    location: tutor.location
      ? {
          onlineAvailable: tutor.location.onlineAvailable,
          inPersonAvailable: tutor.location.inPersonAvailable,
          city: tutor.location.city,
          region: tutor.location.region,
          country: tutor.location.country,
          travelRadiusKm: tutor.location.travelRadiusKm,
          tutorTravels: tutor.location.tutorTravels,
          studentTravels: tutor.location.studentTravels,
          publicMeetingOk: tutor.location.publicMeetingOk,
        }
      : null,
  }));
}

export async function generateTutorMatches(input: GenerateTutorMatchesInput) {
  const questionnaire = await prisma.findTutorQuestionnaire.findUnique({
    where: { id: input.questionnaireId },
    select: { id: true, answers: true },
  });
  if (!questionnaire) throw new Error("Questionnaire not found.");

  const [tutors, weightsSetting] = await Promise.all([
    loadApprovedTutors(),
    prisma.siteSetting.findUnique({
      where: { key: "matching.weights" },
      select: { value: true },
    }),
  ]);

  const answers = input.answers ?? answersFromJson(questionnaire.answers);
  const weights = weightsFromJson(weightsSetting?.value);
  const ranked = rankTutors(tutors, answers, weights).slice(0, input.limit ?? 20);

  return prisma.$transaction(async (tx) => {
    await tx.tutorMatch.deleteMany({
      where: { questionnaireId: questionnaire.id },
    });

    const persisted = [];
    for (const [index, match] of ranked.entries()) {
      persisted.push(
        await tx.tutorMatch.create({
          data: {
            questionnaireId: questionnaire.id,
            tutorProfileId: match.tutorId,
            score: match.score,
            explanation: match.explanation,
            mismatches: match.mismatches,
            rank: index + 1,
            factors: {
              create: match.factors.map((factor) => ({
                factorKey: factor.factorKey,
                weight: factor.weight,
                score: factor.score,
                reason: factor.reason,
              })),
            },
          },
          include: { factors: true },
        }),
      );
    }

    return persisted;
  });
}
