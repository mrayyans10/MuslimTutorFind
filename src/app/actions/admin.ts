"use server";

import { revalidatePath } from "next/cache";
import type { ReportStatus, VerificationStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  approveTutor,
  auditLog,
  createProhibitedSubject,
  deactivateProhibitedSubject,
  listProhibitedSubjects,
  rejectTutor,
  requestTutorChanges,
  suspendUser,
  updateTutorVerificationStatus,
} from "@/lib/services/admin-service";
import { updateRequirementApplicationStatus } from "@/lib/services/requirement-service";
import { DEFAULT_MATCH_WEIGHTS } from "@/lib/matching/engine";

export type ActionState = {
  success?: boolean;
  message?: string;
};

async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (!session.user.role || !["MODERATOR", "ADMINISTRATOR"].includes(session.user.role)) {
    throw new Error("Not authorized.");
  }
  return session.user;
}

async function requireAdmin() {
  const user = await requireStaff();
  if (user.role !== "ADMINISTRATOR") throw new Error("Administrator access required.");
  return user;
}

export async function approveTutorAction(tutorProfileId: string, notes?: string): Promise<ActionState> {
  try {
    const user = await requireStaff();
    await approveTutor({ actorId: user.id, tutorProfileId, notes });
    revalidatePath("/admin/tutors");
    return { success: true, message: "Tutor approved." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to approve tutor." };
  }
}

export async function rejectTutorAction(
  tutorProfileId: string,
  reason: string,
): Promise<ActionState> {
  try {
    const user = await requireStaff();
    await rejectTutor({ actorId: user.id, tutorProfileId, reason });
    revalidatePath("/admin/tutors");
    return { success: true, message: "Tutor rejected." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to reject tutor." };
  }
}

export async function requestTutorChangesAction(
  tutorProfileId: string,
  changeRequestNotes: string,
): Promise<ActionState> {
  try {
    const user = await requireStaff();
    await requestTutorChanges({ actorId: user.id, tutorProfileId, changeRequestNotes });
    revalidatePath("/admin/tutors");
    return { success: true, message: "Change request sent." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to request changes." };
  }
}

export async function updateVerificationStatusAction(
  tutorProfileId: string,
  status: VerificationStatus,
  notes?: string,
  rejectionReason?: string,
): Promise<ActionState> {
  try {
    const user = await requireStaff();
    await updateTutorVerificationStatus({
      actorId: user.id,
      tutorProfileId,
      status,
      notes,
      rejectionReason,
    });
    revalidatePath("/admin/verifications");
    return { success: true, message: `Verification marked as ${status.toLowerCase()}.` };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update verification." };
  }
}

export async function suspendUserAction(userId: string, reason?: string): Promise<ActionState> {
  try {
    const user = await requireAdmin();
    await suspendUser(user.id, userId, reason);
    revalidatePath("/admin/users");
    return { success: true, message: "User suspended." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to suspend user." };
  }
}

export async function createProhibitedSubjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireStaff();
    await createProhibitedSubject({
      actorId: user.id,
      term: String(formData.get("term") || ""),
      aliases: String(formData.get("aliases") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      reason: String(formData.get("reason") || "") || null,
    });
    revalidatePath("/admin/prohibited-subjects");
    return { success: true, message: "Prohibited subject added." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to add prohibited subject." };
  }
}

export async function deactivateProhibitedSubjectAction(id: string): Promise<ActionState> {
  try {
    const user = await requireStaff();
    await deactivateProhibitedSubject(user.id, id);
    revalidatePath("/admin/prohibited-subjects");
    return { success: true, message: "Prohibited subject deactivated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to deactivate." };
  }
}

export async function updateReportStatusAction(
  reportId: string,
  status: ReportStatus,
): Promise<ActionState> {
  try {
    await requireStaff();
    await prisma.userReport.update({
      where: { id: reportId },
      data: { status },
    });
    revalidatePath("/admin/reports");
    return { success: true, message: `Report marked as ${status.toLowerCase()}.` };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update report." };
  }
}

export async function updateModerationCaseAction(
  caseId: string,
  status: string,
  resolution?: string,
): Promise<ActionState> {
  try {
    const user = await requireStaff();
    await prisma.moderationCase.update({
      where: { id: caseId },
      data: {
        status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED" | "CLOSED",
        resolution: resolution ?? null,
        assigneeId: user.id,
      },
    });
    revalidatePath("/admin/moderation");
    return { success: true, message: "Moderation case updated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update case." };
  }
}

export async function updateGuidelineAction(
  guidelineId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireStaff();
    await prisma.communityGuideline.update({
      where: { id: guidelineId },
      data: {
        title: String(formData.get("title") || "").trim(),
        body: String(formData.get("body") || "").trim(),
        isActive: formData.get("isActive") === "on",
      },
    });
    revalidatePath("/admin/community-guidelines");
    return { success: true, message: "Guideline updated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update guideline." };
  }
}

export async function createGuidelineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireStaff();
    const title = String(formData.get("title") || "").trim();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await prisma.communityGuideline.create({
      data: {
        title,
        slug,
        body: String(formData.get("body") || "").trim(),
        sortOrder: Number(formData.get("sortOrder") || 0),
      },
    });
    revalidatePath("/admin/community-guidelines");
    return { success: true, message: "Guideline created." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to create guideline." };
  }
}

export async function updateMatchingWeightsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireAdmin();
    const weights: Record<string, number> = { ...DEFAULT_MATCH_WEIGHTS };
    for (const key of Object.keys(DEFAULT_MATCH_WEIGHTS)) {
      const val = formData.get(key);
      if (val) weights[key] = Number(val);
    }

    await prisma.siteSetting.upsert({
      where: { key: "matching.weights" },
      create: { key: "matching.weights", value: weights },
      update: { value: weights },
    });

    await auditLog({
      actorId: user.id,
      action: "matching.weights_updated",
      targetType: "SiteSetting",
      metadata: weights,
    });

    revalidatePath("/admin/matching");
    return { success: true, message: "Matching weights saved." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to save weights." };
  }
}

export async function updateSiteSettingAction(
  key: string,
  value: unknown,
): Promise<ActionState> {
  try {
    const user = await requireAdmin();
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: value as object },
      update: { value: value as object },
    });
    await auditLog({
      actorId: user.id,
      action: "site_setting.updated",
      targetType: "SiteSetting",
      metadata: { key },
    });
    revalidatePath("/admin/settings");
    return { success: true, message: "Setting saved." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to save setting." };
  }
}

export async function toggleSubjectAction(subjectId: string, isActive: boolean): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.subject.update({ where: { id: subjectId }, data: { isActive } });
    revalidatePath("/admin/subjects");
    return { success: true, message: `Subject ${isActive ? "activated" : "deactivated"}.` };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update subject." };
  }
}

export async function updateRequirementAdminAction(
  requirementId: string,
  status: string,
): Promise<ActionState> {
  try {
    await requireStaff();
    await prisma.tutoringRequirement.update({
      where: { id: requirementId },
      data: { status: status as "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED" | "REMOVED" },
    });
    revalidatePath("/admin/tutoring-requirements");
    return { success: true, message: "Requirement updated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update requirement." };
  }
}

export async function updateApplicationAdminAction(
  applicationId: string,
  status: string,
): Promise<ActionState> {
  try {
    await requireStaff();
    await updateRequirementApplicationStatus({
      applicationId,
      status: status as "SUBMITTED" | "VIEWED" | "SHORTLISTED" | "ACCEPTED" | "DECLINED" | "WITHDRAWN",
    });
    revalidatePath("/admin/applications");
    return { success: true, message: "Application updated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update application." };
  }
}

export async function removeReviewAction(reviewId: string): Promise<ActionState> {
  try {
    const user = await requireStaff();
    await prisma.review.update({
      where: { id: reviewId },
      data: { removedAt: new Date(), moderated: true },
    });
    await auditLog({
      actorId: user.id,
      action: "review.removed",
      targetType: "Review",
      targetId: reviewId,
    });
    revalidatePath("/admin/reviews");
    return { success: true, message: "Review removed." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to remove review." };
  }
}

export { listProhibitedSubjects };
