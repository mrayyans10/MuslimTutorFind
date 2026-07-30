import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type CreateReviewInput = {
  eligibilityId: string;
  authorId: string;
  overallRating: number;
  subjectKnowledge?: number | null;
  communication?: number | null;
  reliability?: number | null;
  teachingClarity?: number | null;
  writtenReview: string;
  isPublic?: boolean;
};

type TutorResponseInput = {
  reviewId: string;
  tutorUserId: string;
  body: string;
};

type ReportReviewInput = {
  reporterId: string;
  reviewId: string;
  reason: string;
  details?: string | null;
};

function assertRating(rating: number, label: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error(`${label} must be an integer from 1 to 5.`);
  }
}

async function refreshTutorRating(tutorProfileId: string, tx: Prisma.TransactionClient) {
  const aggregate = await tx.review.aggregate({
    where: {
      tutorProfileId,
      removedAt: null,
      isPublic: true,
    },
    _avg: { overallRating: true },
    _count: { _all: true },
  });

  await tx.tutorProfile.update({
    where: { id: tutorProfileId },
    data: {
      averageRating: aggregate._avg.overallRating ?? 0,
      reviewCount: aggregate._count._all,
    },
  });
}

export async function createReview(input: CreateReviewInput) {
  assertRating(input.overallRating, "Overall rating");
  if (input.subjectKnowledge != null) assertRating(input.subjectKnowledge, "Subject knowledge rating");
  if (input.communication != null) assertRating(input.communication, "Communication rating");
  if (input.reliability != null) assertRating(input.reliability, "Reliability rating");
  if (input.teachingClarity != null) assertRating(input.teachingClarity, "Teaching clarity rating");

  return prisma.$transaction(async (tx) => {
    const eligibility = await tx.reviewEligibility.findUnique({
      where: { id: input.eligibilityId },
      select: { id: true, studentUserId: true, tutorProfileId: true, usedAt: true },
    });
    if (!eligibility || eligibility.usedAt) {
      throw new Error("Review eligibility is invalid or already used.");
    }
    if (eligibility.studentUserId !== input.authorId) {
      throw new Error("Only the eligible student or parent can create this review.");
    }

    const eligibilityUpdate = await tx.reviewEligibility.updateMany({
      where: { id: eligibility.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (eligibilityUpdate.count !== 1) {
      throw new Error("Review eligibility is already used.");
    }

    const review = await tx.review.create({
      data: {
        tutorProfileId: eligibility.tutorProfileId,
        authorId: input.authorId,
        overallRating: input.overallRating,
        subjectKnowledge: input.subjectKnowledge ?? null,
        communication: input.communication ?? null,
        reliability: input.reliability ?? null,
        teachingClarity: input.teachingClarity ?? null,
        writtenReview: input.writtenReview.trim(),
        isPublic: input.isPublic ?? true,
        editableUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1_000),
      },
    });

    await refreshTutorRating(eligibility.tutorProfileId, tx);
    return review;
  });
}

export async function respondToReview(input: TutorResponseInput) {
  const review = await prisma.review.findUnique({
    where: { id: input.reviewId },
    select: {
      id: true,
      removedAt: true,
      tutorProfile: { select: { userId: true } },
    },
  });
  if (!review || review.removedAt) throw new Error("Review not found.");
  if (review.tutorProfile.userId !== input.tutorUserId) {
    throw new Error("Only the reviewed tutor can respond.");
  }

  return prisma.reviewResponse.upsert({
    where: { reviewId: input.reviewId },
    create: {
      reviewId: input.reviewId,
      body: input.body.trim(),
    },
    update: {
      body: input.body.trim(),
    },
  });
}

export async function reportReview(input: ReportReviewInput) {
  const review = await prisma.review.findUnique({
    where: { id: input.reviewId },
    select: {
      id: true,
      authorId: true,
      tutorProfile: { select: { userId: true } },
    },
  });
  if (!review) throw new Error("Review not found.");

  const reportedId = review.authorId === input.reporterId ? review.tutorProfile.userId : review.authorId;

  return prisma.userReport.create({
    data: {
      reporterId: input.reporterId,
      reportedId,
      reason: input.reason.trim(),
      details: input.details?.trim() || null,
      targetType: "REVIEW",
      targetId: review.id,
    },
  });
}
