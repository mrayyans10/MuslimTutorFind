import type { Prisma, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

type AuditLogInput = {
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
};

type TutorDecisionInput = {
  actorId: string;
  tutorProfileId: string;
  notes?: string | null;
};

type RejectTutorInput = TutorDecisionInput & {
  reason: string;
};

type RequestTutorChangesInput = TutorDecisionInput & {
  changeRequestNotes: string;
};

type VerificationStatusInput = {
  actorId: string;
  tutorProfileId: string;
  status: VerificationStatus;
  notes?: string | null;
  rejectionReason?: string | null;
};

type ProhibitedSubjectInput = {
  actorId: string;
  term: string;
  aliases?: string[];
  reason?: string | null;
  isActive?: boolean;
};

type UpdateProhibitedSubjectInput = {
  actorId: string;
  id: string;
  term?: string;
  aliases?: string[];
  reason?: string | null;
  isActive?: boolean;
};

function trimList(values?: string[]) {
  return values?.map((value) => value.trim()).filter(Boolean) ?? [];
}

export async function auditLog(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      metadata: input.metadata,
      ipAddress: input.ipAddress ?? null,
    },
  });
}

export async function approveTutor(input: TutorDecisionInput) {
  return prisma.$transaction(async (tx) => {
    const tutor = await tx.tutorProfile.update({
      where: { id: input.tutorProfileId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        rejectionReason: null,
        changeRequestNotes: null,
      },
    });

    await tx.tutorApplicationReview.create({
      data: {
        tutorProfileId: tutor.id,
        reviewerId: input.actorId,
        action: "APPROVED",
        notes: input.notes?.trim() || null,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "tutor.approved",
        targetType: "TutorProfile",
        targetId: tutor.id,
        metadata: { notes: input.notes ?? null },
      },
    });

    return tutor;
  });
}

export async function rejectTutor(input: RejectTutorInput) {
  return prisma.$transaction(async (tx) => {
    const tutor = await tx.tutorProfile.update({
      where: { id: input.tutorProfileId },
      data: {
        status: "REJECTED",
        rejectionReason: input.reason.trim(),
        changeRequestNotes: null,
      },
    });

    await tx.tutorApplicationReview.create({
      data: {
        tutorProfileId: tutor.id,
        reviewerId: input.actorId,
        action: "REJECTED",
        notes: input.notes?.trim() || input.reason.trim(),
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "tutor.rejected",
        targetType: "TutorProfile",
        targetId: tutor.id,
        metadata: { reason: input.reason, notes: input.notes ?? null },
      },
    });

    return tutor;
  });
}

export async function requestTutorChanges(input: RequestTutorChangesInput) {
  return prisma.$transaction(async (tx) => {
    const tutor = await tx.tutorProfile.update({
      where: { id: input.tutorProfileId },
      data: {
        status: "CHANGES_REQUESTED",
        changeRequestNotes: input.changeRequestNotes.trim(),
        rejectionReason: null,
      },
    });

    await tx.tutorApplicationReview.create({
      data: {
        tutorProfileId: tutor.id,
        reviewerId: input.actorId,
        action: "CHANGES_REQUESTED",
        notes: input.notes?.trim() || input.changeRequestNotes.trim(),
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "tutor.changes_requested",
        targetType: "TutorProfile",
        targetId: tutor.id,
        metadata: { notes: input.changeRequestNotes },
      },
    });

    return tutor;
  });
}

export async function updateTutorVerificationStatus(input: VerificationStatusInput) {
  return prisma.$transaction(async (tx) => {
    const verification = await tx.tutorVerification.upsert({
      where: { tutorProfileId: input.tutorProfileId },
      create: {
        tutorProfileId: input.tutorProfileId,
        status: input.status,
        notes: input.notes?.trim() || null,
        rejectionReason: input.rejectionReason?.trim() || null,
        reviewedById: input.actorId,
        reviewedAt: new Date(),
        submittedAt: input.status === "SUBMITTED" ? new Date() : null,
      },
      update: {
        status: input.status,
        notes: input.notes?.trim() || null,
        rejectionReason: input.rejectionReason?.trim() || null,
        reviewedById: input.actorId,
        reviewedAt: new Date(),
        submittedAt: input.status === "SUBMITTED" ? new Date() : undefined,
      },
    });

    await tx.tutorProfile.update({
      where: { id: input.tutorProfileId },
      data: { isVerified: input.status === "VERIFIED" },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "tutor.verification_status_updated",
        targetType: "TutorVerification",
        targetId: verification.id,
        metadata: { status: input.status, notes: input.notes ?? null, rejectionReason: input.rejectionReason ?? null },
      },
    });

    return verification;
  });
}

export async function suspendUser(actorId: string, userId: string, reason?: string | null) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED" },
    });

    await tx.tutorProfile.updateMany({
      where: { userId },
      data: { status: "SUSPENDED" },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "user.suspended",
        targetType: "User",
        targetId: userId,
        metadata: { reason: reason ?? null },
      },
    });

    return user;
  });
}

export async function createProhibitedSubject(input: ProhibitedSubjectInput) {
  const subject = await prisma.prohibitedSubject.create({
    data: {
      term: input.term.trim().toLowerCase(),
      aliases: trimList(input.aliases),
      reason: input.reason?.trim() || null,
      isActive: input.isActive ?? true,
    },
  });

  await auditLog({
    actorId: input.actorId,
    action: "prohibited_subject.created",
    targetType: "ProhibitedSubject",
    targetId: subject.id,
    metadata: { term: subject.term },
  });

  return subject;
}

export async function updateProhibitedSubject(input: UpdateProhibitedSubjectInput) {
  const subject = await prisma.prohibitedSubject.update({
    where: { id: input.id },
    data: {
      term: input.term?.trim().toLowerCase(),
      aliases: input.aliases ? trimList(input.aliases) : undefined,
      reason: input.reason === undefined ? undefined : input.reason?.trim() || null,
      isActive: input.isActive,
    },
  });

  await auditLog({
    actorId: input.actorId,
    action: "prohibited_subject.updated",
    targetType: "ProhibitedSubject",
    targetId: subject.id,
    metadata: { term: subject.term, isActive: subject.isActive },
  });

  return subject;
}

export async function deactivateProhibitedSubject(actorId: string, id: string) {
  return updateProhibitedSubject({ actorId, id, isActive: false });
}

export async function listProhibitedSubjects(includeInactive = false) {
  return prisma.prohibitedSubject.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { term: "asc" },
  });
}
