import type { ApplicationStatus, LearnerLevel, LearningGoal, Prisma, TutoringMode, Urgency } from "@prisma/client";
import { prisma } from "@/lib/db";
import { containsProhibitedSubject } from "@/lib/moderation/prohibited-subjects";

type RequirementInput = {
  studentProfileId?: string | null;
  parentProfileId?: string | null;
  childProfileId?: string | null;
  whoNeedsHelp: string;
  subjectId: string;
  topic?: string | null;
  learnerLevel: LearnerLevel;
  curriculum?: string | null;
  learningGoal?: LearningGoal | null;
  mode: TutoringMode;
  country?: string | null;
  city?: string | null;
  approximateArea?: string | null;
  preferredSchedule?: string | null;
  expectedFrequency?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency?: string;
  whenNeeded?: Urgency | null;
  description: string;
  additionalNeeds?: string | null;
};

type ApplyToRequirementInput = {
  requirementId: string;
  tutorProfileId: string;
  introduction: string;
  relevantExperience?: string | null;
  proposedHourlyRate: number;
  currency?: string;
  scheduleCompatibility?: string | null;
  teachingApproach?: string | null;
  messageToFamily?: string | null;
};

type UpdateApplicationStatusInput = {
  applicationId: string;
  status: ApplicationStatus;
  createReviewEligibility?: boolean;
  reviewEligibilityReason?: string;
};

const requirementIncludeForOwnership = {
  studentProfile: { select: { userId: true } },
  parentProfile: { select: { userId: true } },
} satisfies Prisma.TutoringRequirementInclude;

async function assertSecularRequirement(input: {
  subjectId: string;
  topic?: string | null;
  curriculum?: string | null;
  description?: string | null;
  additionalNeeds?: string | null;
}) {
  const subject = await prisma.subject.findUnique({
    where: { id: input.subjectId },
    select: { name: true, aliases: true },
  });
  if (!subject) throw new Error("Subject not found.");

  const prohibited = await containsProhibitedSubject(
    subject.name,
    subject.aliases.join(" "),
    input.topic,
    input.curriculum,
    input.description,
    input.additionalNeeds,
  );
  if (prohibited.prohibited) {
    throw new Error(`Religious instruction requirements are not allowed (${prohibited.matchedTerm}).`);
  }
}

function assertRequirementOwner(
  requirement: {
    studentProfile?: { userId: string } | null;
    parentProfile?: { userId: string } | null;
  },
  userId: string,
) {
  const ownerIds = [requirement.studentProfile?.userId, requirement.parentProfile?.userId].filter(Boolean);
  if (!ownerIds.includes(userId)) {
    throw new Error("You do not have permission to manage this requirement.");
  }
}

function expirationDate() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000);
}

export async function createTutoringRequirement(input: RequirementInput) {
  if (!input.studentProfileId && !input.parentProfileId) {
    throw new Error("A student or parent profile is required.");
  }

  await assertSecularRequirement(input);

  return prisma.tutoringRequirement.create({
    data: {
      studentProfileId: input.studentProfileId ?? null,
      parentProfileId: input.parentProfileId ?? null,
      childProfileId: input.childProfileId ?? null,
      whoNeedsHelp: input.whoNeedsHelp.trim(),
      subjectId: input.subjectId,
      topic: input.topic?.trim() || null,
      learnerLevel: input.learnerLevel,
      curriculum: input.curriculum?.trim() || null,
      learningGoal: input.learningGoal ?? null,
      mode: input.mode,
      country: input.country?.trim() || null,
      city: input.city?.trim() || null,
      approximateArea: input.approximateArea?.trim() || null,
      preferredSchedule: input.preferredSchedule?.trim() || null,
      expectedFrequency: input.expectedFrequency?.trim() || null,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      currency: input.currency ?? "CAD",
      whenNeeded: input.whenNeeded ?? null,
      description: input.description.trim(),
      additionalNeeds: input.additionalNeeds?.trim() || null,
      status: "DRAFT",
    },
  });
}

export async function publishTutoringRequirement(requirementId: string, ownerUserId?: string) {
  const requirement = await prisma.tutoringRequirement.findUnique({
    where: { id: requirementId },
    include: {
      ...requirementIncludeForOwnership,
      subject: { select: { name: true, aliases: true } },
    },
  });
  if (!requirement || requirement.deletedAt) throw new Error("Requirement not found.");
  if (ownerUserId) assertRequirementOwner(requirement, ownerUserId);

  const prohibited = await containsProhibitedSubject(
    requirement.subject.name,
    requirement.subject.aliases.join(" "),
    requirement.topic,
    requirement.curriculum,
    requirement.description,
    requirement.additionalNeeds,
  );
  if (prohibited.prohibited) {
    throw new Error(`Religious instruction requirements are not allowed (${prohibited.matchedTerm}).`);
  }

  return prisma.tutoringRequirement.update({
    where: { id: requirement.id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      expiresAt: requirement.expiresAt ?? expirationDate(),
    },
  });
}

export async function applyToRequirement(input: ApplyToRequirementInput) {
  const [requirement, tutorProfile] = await Promise.all([
    prisma.tutoringRequirement.findUnique({
      where: { id: input.requirementId },
      select: { id: true, status: true, expiresAt: true, deletedAt: true },
    }),
    prisma.tutorProfile.findUnique({
      where: { id: input.tutorProfileId },
      select: { id: true, status: true, deletedAt: true, user: { select: { status: true } } },
    }),
  ]);

  if (!requirement || requirement.deletedAt || requirement.status !== "PUBLISHED") {
    throw new Error("Requirement is not open for applications.");
  }
  if (requirement.expiresAt && requirement.expiresAt <= new Date()) {
    throw new Error("Requirement has expired.");
  }
  if (!tutorProfile || tutorProfile.deletedAt || tutorProfile.status !== "APPROVED" || tutorProfile.user.status !== "ACTIVE") {
    throw new Error("Only active approved tutors can apply to requirements.");
  }

  const prohibited = await containsProhibitedSubject(
    input.introduction,
    input.relevantExperience,
    input.teachingApproach,
    input.messageToFamily,
  );
  if (prohibited.prohibited) {
    throw new Error(`Religious instruction offers are not allowed (${prohibited.matchedTerm}).`);
  }

  return prisma.tutorRequirementApplication.create({
    data: {
      requirementId: input.requirementId,
      tutorProfileId: input.tutorProfileId,
      introduction: input.introduction.trim(),
      relevantExperience: input.relevantExperience?.trim() || null,
      proposedHourlyRate: input.proposedHourlyRate,
      currency: input.currency ?? "CAD",
      scheduleCompatibility: input.scheduleCompatibility?.trim() || null,
      teachingApproach: input.teachingApproach?.trim() || null,
      messageToFamily: input.messageToFamily?.trim() || null,
      status: "SUBMITTED",
    },
  });
}

export async function updateRequirementApplicationStatus(input: UpdateApplicationStatusInput) {
  const application = await prisma.tutorRequirementApplication.findUnique({
    where: { id: input.applicationId },
    include: {
      requirement: {
        include: requirementIncludeForOwnership,
      },
    },
  });
  if (!application) throw new Error("Application not found.");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.tutorRequirementApplication.update({
      where: { id: application.id },
      data: { status: input.status },
    });

    if (input.status === "ACCEPTED" && input.createReviewEligibility) {
      const studentUserId = application.requirement.studentProfile?.userId ?? application.requirement.parentProfile?.userId;
      if (!studentUserId) {
        throw new Error("Cannot grant review eligibility without a student or parent owner.");
      }

      await tx.reviewEligibility.upsert({
        where: { applicationId: application.id },
        create: {
          applicationId: application.id,
          studentUserId,
          tutorProfileId: application.tutorProfileId,
          reason: input.reviewEligibilityReason ?? "Requirement application accepted.",
        },
        update: {},
      });
    }

    return updated;
  });
}
