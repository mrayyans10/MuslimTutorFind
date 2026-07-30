"use server";

import type { Prisma } from "@prisma/client";
import { cookies } from "next/headers";

import { generateTutorMatches } from "@/lib/services/matching-service";
import type { MatchAnswers } from "@/lib/matching/engine";
import { prisma } from "@/lib/db";
import { mapTutorToCard } from "@/lib/tutors/mappers";

export type QuestionnaireAnswers = Partial<MatchAnswers> & {
  whoNeedsHelp?: string;
  step?: number;
};

const GUEST_COOKIE = "ct_guest_session";

async function guestSessionId() {
  const jar = await cookies();
  let id = jar.get(GUEST_COOKIE)?.value;
  if (!id) {
    id = crypto.randomUUID();
    jar.set(GUEST_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return id;
}

export async function saveQuestionnaireAnswers(
  questionnaireId: string | null,
  step: number,
  answers: QuestionnaireAnswers,
) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  const guestId = session?.user?.id ? null : await guestSessionId();

  if (questionnaireId) {
    const existing = await prisma.findTutorQuestionnaire.findUnique({
      where: { id: questionnaireId },
      select: { id: true, userId: true, guestSessionId: true },
    });
    if (!existing) throw new Error("Questionnaire not found.");
    if (session?.user?.id && existing.userId !== session.user.id) {
      throw new Error("Not authorized.");
    }
    if (guestId && existing.guestSessionId !== guestId) {
      throw new Error("Not authorized.");
    }
  }

  const data = {
    currentStep: step,
    answers: answers as Prisma.InputJsonValue,
    completedAt: step >= 12 ? new Date() : null,
  };

  if (questionnaireId) {
    return prisma.findTutorQuestionnaire.update({
      where: { id: questionnaireId },
      data,
      select: { id: true },
    });
  }

  return prisma.findTutorQuestionnaire.create({
    data: {
      ...data,
      userId: session?.user?.id ?? null,
      guestSessionId: guestId,
    },
    select: { id: true },
  });
}

export async function runMatching(questionnaireId: string) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  const guestId = session?.user?.id ? null : (await cookies()).get(GUEST_COOKIE)?.value;

  const questionnaire = await prisma.findTutorQuestionnaire.findUnique({
    where: { id: questionnaireId },
    select: { id: true, userId: true, guestSessionId: true, answers: true },
  });

  if (!questionnaire) throw new Error("Questionnaire not found.");
  if (session?.user?.id && questionnaire.userId !== session.user.id) {
    throw new Error("Not authorized.");
  }
  if (guestId && questionnaire.guestSessionId !== guestId) {
    throw new Error("Not authorized.");
  }

  const answers = questionnaire.answers as Record<string, unknown>;
  if (!answers.subjectId || !answers.learnerLevel || !answers.mode) {
    throw new Error("Complete all required steps before matching.");
  }

  const matches = await generateTutorMatches({
    questionnaireId,
    answers: answers as MatchAnswers,
    limit: 12,
  });

  const tutorIds = matches.map((m) => m.tutorProfileId);
  const tutors = await prisma.tutorProfile.findMany({
    where: { id: { in: tutorIds }, status: "APPROVED", deletedAt: null },
    include: {
      user: { select: { displayName: true, legalName: true, image: true } },
      subjects: { include: { subject: { select: { name: true } } } },
      location: true,
    },
  });

  const tutorMap = new Map(tutors.map((t) => [t.id, mapTutorToCard(t)]));

  return matches.map((match) => ({
    id: match.id,
    score: match.score,
    explanation: match.explanation,
    mismatches: match.mismatches,
    rank: match.rank,
    factors: match.factors,
    tutor: tutorMap.get(match.tutorProfileId) ?? null,
  }));
}

export async function getSubjectsForMatching() {
  try {
    return await prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        specializations: {
          where: { isActive: true },
          select: { id: true, name: true },
        },
      },
    });
  } catch {
    return [];
  }
}

export async function getCurriculaForMatching() {
  try {
    return await prisma.curriculum.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
  } catch {
    return [];
  }
}
