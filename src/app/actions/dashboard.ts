"use server";

import { revalidatePath } from "next/cache";
import type {
  ApplicationStatus,
  DayOfWeek,
  DocumentType,
  LearnerLevel,
  LearningGoal,
  RequirementStatus,
  TeachingStyle,
  TimePeriod,
  TutoringMode,
  Urgency,
} from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  applyToRequirement,
  createTutoringRequirement,
  publishTutoringRequirement,
  updateRequirementApplicationStatus,
} from "@/lib/services/requirement-service";
import {
  addTutorSubject,
  createTutorProfileDraft,
  submitTutorProfileForApproval,
  updateTutorProfileDraft,
} from "@/lib/services/tutor-service";
import { createReview, respondToReview } from "@/lib/services/review-service";
import { blockUser, reportUser, unblockUser } from "@/lib/services/messaging-service";
import { newStorageKey, storeLocalFile } from "@/lib/storage";

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  id?: string;
};

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  return session.user;
}

// ——— Learner profiles (parent) ———

export async function createLearnerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parent = await prisma.parentProfile.findUnique({ where: { userId: user.id } });
    if (!parent) return { message: "Parent profile not found." };

    const child = await prisma.childProfile.create({
      data: {
        displayNickname: String(formData.get("displayNickname") || "").trim(),
        privateLegalName: String(formData.get("privateLegalName") || "").trim() || null,
        ageBand: String(formData.get("ageBand") || "").trim(),
        gradeLevel: String(formData.get("gradeLevel") || "").trim() || null,
        curriculum: String(formData.get("curriculum") || "").trim() || null,
        learningGoals: String(formData.get("learningGoals") || "").trim() || null,
        preferredLanguage: String(formData.get("preferredLanguage") || "").trim() || null,
        accommodations: String(formData.get("accommodations") || "").trim() || null,
        parents: { create: { parentId: parent.id } },
      },
    });

    revalidatePath("/dashboard/learners");
    return { success: true, message: "Learner profile created.", id: child.id };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to create learner." };
  }
}

export async function updateLearnerAction(
  childId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parent = await prisma.parentProfile.findUnique({
      where: { userId: user.id },
      include: { children: { where: { childId } } },
    });
    if (!parent?.children.length) return { message: "Learner not found." };

    await prisma.childProfile.update({
      where: { id: childId },
      data: {
        displayNickname: String(formData.get("displayNickname") || "").trim(),
        privateLegalName: String(formData.get("privateLegalName") || "").trim() || null,
        ageBand: String(formData.get("ageBand") || "").trim(),
        gradeLevel: String(formData.get("gradeLevel") || "").trim() || null,
        curriculum: String(formData.get("curriculum") || "").trim() || null,
        learningGoals: String(formData.get("learningGoals") || "").trim() || null,
        preferredLanguage: String(formData.get("preferredLanguage") || "").trim() || null,
        accommodations: String(formData.get("accommodations") || "").trim() || null,
      },
    });

    revalidatePath("/dashboard/learners");
    return { success: true, message: "Learner profile updated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update learner." };
  }
}

export async function deleteLearnerAction(childId: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parent = await prisma.parentProfile.findUnique({
      where: { userId: user.id },
      include: { children: { where: { childId } } },
    });
    if (!parent?.children.length) return { message: "Learner not found." };

    await prisma.childProfile.update({
      where: { id: childId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/dashboard/learners");
    return { success: true, message: "Learner profile removed." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to remove learner." };
  }
}

// ——— Profile ———

export async function updateUserProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: String(formData.get("displayName") || "").trim() || null,
        legalName: String(formData.get("legalName") || "").trim() || null,
        phone: String(formData.get("phone") || "").trim() || null,
        country: String(formData.get("country") || "").trim() || null,
        city: String(formData.get("city") || "").trim() || null,
        timezone: String(formData.get("timezone") || "").trim() || null,
      },
    });

    if (user.role === "STUDENT") {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ageBand: String(formData.get("ageBand") || "").trim() || null,
          schoolLevel: String(formData.get("schoolLevel") || "").trim() || null,
          preferredLanguage: String(formData.get("preferredLanguage") || "").trim() || null,
        },
        update: {
          ageBand: String(formData.get("ageBand") || "").trim() || null,
          schoolLevel: String(formData.get("schoolLevel") || "").trim() || null,
          preferredLanguage: String(formData.get("preferredLanguage") || "").trim() || null,
        },
      });
    }

    revalidatePath("/dashboard/profile");
    revalidatePath("/tutor/profile");
    return { success: true, message: "Profile updated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update profile." };
  }
}

// ——— Requirements ———

export async function createRequirementAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const [studentProfile, parentProfile] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId: user.id } }),
      prisma.parentProfile.findUnique({ where: { userId: user.id } }),
    ]);

    const requirement = await createTutoringRequirement({
      studentProfileId: studentProfile?.id ?? null,
      parentProfileId: parentProfile?.id ?? null,
      childProfileId: String(formData.get("childProfileId") || "") || null,
      whoNeedsHelp: String(formData.get("whoNeedsHelp") || ""),
      subjectId: String(formData.get("subjectId") || ""),
      topic: String(formData.get("topic") || "") || null,
      learnerLevel: String(formData.get("learnerLevel") || "HIGH_SCHOOL") as LearnerLevel,
      curriculum: String(formData.get("curriculum") || "") || null,
      learningGoal: (String(formData.get("learningGoal") || "") || null) as LearningGoal | null,
      mode: String(formData.get("mode") || "ONLINE") as TutoringMode,
      country: String(formData.get("country") || "") || null,
      city: String(formData.get("city") || "") || null,
      approximateArea: String(formData.get("approximateArea") || "") || null,
      preferredSchedule: String(formData.get("preferredSchedule") || "") || null,
      expectedFrequency: String(formData.get("expectedFrequency") || "") || null,
      budgetMin: formData.get("budgetMin") ? Number(formData.get("budgetMin")) : null,
      budgetMax: formData.get("budgetMax") ? Number(formData.get("budgetMax")) : null,
      whenNeeded: (String(formData.get("whenNeeded") || "") || null) as Urgency | null,
      description: String(formData.get("description") || ""),
      additionalNeeds: String(formData.get("additionalNeeds") || "") || null,
    });

    revalidatePath("/dashboard/tutoring-requirements");
    return { success: true, message: "Requirement draft created.", id: requirement.id };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to create requirement." };
  }
}

export async function publishRequirementAction(requirementId: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    await publishTutoringRequirement(requirementId, user.id);
    revalidatePath("/dashboard/tutoring-requirements");
    return { success: true, message: "Requirement published." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to publish requirement." };
  }
}

export async function updateRequirementStatusAction(
  requirementId: string,
  status: RequirementStatus,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const requirement = await prisma.tutoringRequirement.findUnique({
      where: { id: requirementId },
      include: {
        studentProfile: { select: { userId: true } },
        parentProfile: { select: { userId: true } },
      },
    });
    if (!requirement) return { message: "Requirement not found." };
    const ownerIds = [requirement.studentProfile?.userId, requirement.parentProfile?.userId].filter(Boolean);
    if (!ownerIds.includes(user.id)) return { message: "Not authorized." };

    await prisma.tutoringRequirement.update({
      where: { id: requirementId },
      data: { status },
    });

    revalidatePath("/dashboard/tutoring-requirements");
    return { success: true, message: `Requirement marked as ${status.toLowerCase()}.` };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update requirement." };
  }
}

// ——— Applications ———

export async function updateApplicationStatusAction(
  applicationId: string,
  status: ApplicationStatus,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const application = await prisma.tutorRequirementApplication.findUnique({
      where: { id: applicationId },
      include: {
        requirement: {
          include: {
            studentProfile: { select: { userId: true } },
            parentProfile: { select: { userId: true } },
          },
        },
        tutorProfile: { select: { userId: true } },
      },
    });
    if (!application) return { message: "Application not found." };

    const ownerIds = [
      application.requirement.studentProfile?.userId,
      application.requirement.parentProfile?.userId,
    ].filter(Boolean);

    const isOwner = ownerIds.includes(user.id);
    const isTutor = application.tutorProfile.userId === user.id;

    if (!isOwner && !isTutor) return { message: "Not authorized." };
    if (isTutor && status !== "WITHDRAWN") return { message: "Tutors can only withdraw applications." };

    await updateRequirementApplicationStatus({
      applicationId,
      status,
      createReviewEligibility: status === "ACCEPTED" && isOwner,
      reviewEligibilityReason: "Requirement application accepted.",
    });

    revalidatePath("/dashboard/applications");
    revalidatePath("/tutor/applications");
    return { success: true, message: `Application ${status.toLowerCase()}.` };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update application." };
  }
}

export async function applyToRequirementAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: user.id } });
    if (!tutorProfile) return { message: "Tutor profile not found." };

    const application = await applyToRequirement({
      requirementId: String(formData.get("requirementId") || ""),
      tutorProfileId: tutorProfile.id,
      introduction: String(formData.get("introduction") || ""),
      relevantExperience: String(formData.get("relevantExperience") || "") || null,
      proposedHourlyRate: Number(formData.get("proposedHourlyRate") || 0),
      scheduleCompatibility: String(formData.get("scheduleCompatibility") || "") || null,
      teachingApproach: String(formData.get("teachingApproach") || "") || null,
      messageToFamily: String(formData.get("messageToFamily") || "") || null,
    });

    revalidatePath("/tutor/applications");
    return { success: true, message: "Application submitted.", id: application.id };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to submit application." };
  }
}

// ——— Tutor profile ———

export async function updateTutorProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: user.id } });
    if (!tutorProfile) return { message: "Tutor profile not found." };

    const teachingStyles = formData.getAll("teachingStyles").map(String) as TeachingStyle[];

    await updateTutorProfileDraft(tutorProfile.id, {
      displayName: String(formData.get("displayName") || "") || undefined,
      headline: String(formData.get("headline") || "") || null,
      biography: String(formData.get("biography") || "") || null,
      teachingApproach: String(formData.get("teachingApproach") || "") || null,
      yearsExperience: formData.get("yearsExperience") ? Number(formData.get("yearsExperience")) : undefined,
      currentOccupation: String(formData.get("currentOccupation") || "") || null,
      educationSummary: String(formData.get("educationSummary") || "") || null,
      teachingStyles,
      communityAttested: formData.get("communityAttested") === "on",
      secularSubjectsOnly: formData.get("secularSubjectsOnly") === "on",
      conductAgreed: formData.get("conductAgreed") === "on",
      noReligiousInstruction: formData.get("noReligiousInstruction") === "on",
      termsAccepted: formData.get("termsAccepted") === "on",
      guidelinesAccepted: formData.get("guidelinesAccepted") === "on",
      gender: String(formData.get("gender") || "") || null,
    });

    revalidatePath("/tutor/profile");
    return { success: true, message: "Tutor profile updated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update tutor profile." };
  }
}

export async function updateTutorScheduleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: user.id } });
    if (!tutorProfile) return { message: "Tutor profile not found." };

    const days = formData.getAll("dayOfWeek").map(String) as DayOfWeek[];
    const periods = formData.getAll("period").map(String) as TimePeriod[];
    const availability = days.map((dayOfWeek, i) => ({
      dayOfWeek,
      period: periods[i] ?? "AFTERNOON",
      timeRangeNote: String(formData.get(`note_${dayOfWeek}_${periods[i]}`) || "") || null,
    }));

    await updateTutorProfileDraft(tutorProfile.id, { availability });

    revalidatePath("/tutor/schedule");
    return { success: true, message: "Schedule updated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update schedule." };
  }
}

export async function updateTutorLocationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: user.id } });
    if (!tutorProfile) return { message: "Tutor profile not found." };

    await updateTutorProfileDraft(tutorProfile.id, {
      location: {
        onlineAvailable: formData.get("onlineAvailable") === "on",
        inPersonAvailable: formData.get("inPersonAvailable") === "on",
        tutorTravels: formData.get("tutorTravels") === "on",
        studentTravels: formData.get("studentTravels") === "on",
        publicMeetingOk: formData.get("publicMeetingOk") === "on",
        travelRadiusKm: formData.get("travelRadiusKm") ? Number(formData.get("travelRadiusKm")) : null,
        city: String(formData.get("city") || "") || null,
        region: String(formData.get("region") || "") || null,
        country: String(formData.get("country") || "") || null,
        approximateArea: String(formData.get("approximateArea") || "") || null,
        privateAddressNote: String(formData.get("privateAddressNote") || "") || null,
      },
    });

    revalidatePath("/tutor/location");
    return { success: true, message: "Location preferences updated." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update location." };
  }
}

export async function addTutorSubjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: user.id } });
    if (!tutorProfile) return { message: "Tutor profile not found." };

    await addTutorSubject({
      tutorProfileId: tutorProfile.id,
      subjectId: String(formData.get("subjectId") || ""),
      specializationId: String(formData.get("specializationId") || "") || null,
      curriculumId: String(formData.get("curriculumId") || "") || null,
      minLevel: String(formData.get("minLevel") || "HIGH_SCHOOL") as LearnerLevel,
      maxLevel: String(formData.get("maxLevel") || "HIGH_SCHOOL") as LearnerLevel,
      yearsExperience: formData.get("yearsExperience") ? Number(formData.get("yearsExperience")) : 0,
      onlineAvailable: formData.get("onlineAvailable") === "on",
      inPersonAvailable: formData.get("inPersonAvailable") === "on",
      hourlyRate: Number(formData.get("hourlyRate") || 0),
      note: String(formData.get("note") || "") || null,
    });

    revalidatePath("/tutor/subjects");
    return { success: true, message: "Subject added." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to add subject." };
  }
}

export async function removeTutorSubjectAction(subjectId: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: user.id } });
    if (!tutorProfile) return { message: "Tutor profile not found." };

    await prisma.tutorSubject.deleteMany({
      where: { id: subjectId, tutorProfileId: tutorProfile.id },
    });

    revalidatePath("/tutor/subjects");
    return { success: true, message: "Subject removed." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to remove subject." };
  }
}

export async function submitTutorForApprovalAction(): Promise<ActionState> {
  try {
    const user = await requireUser();
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: user.id } });
    if (!tutorProfile) return { message: "Tutor profile not found." };

    await submitTutorProfileForApproval(tutorProfile.id);
    revalidatePath("/tutor/profile");
    revalidatePath("/tutor/dashboard");
    return { success: true, message: "Profile submitted for approval." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to submit profile." };
  }
}

export async function uploadVerificationDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: user.id },
      include: { verification: true },
    });
    if (!tutorProfile) return { message: "Tutor profile not found." };

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { message: "No file selected." };

    const buffer = Buffer.from(await file.arrayBuffer());
    const storageKey = newStorageKey(`verification/${tutorProfile.id}`, file.name);
    await storeLocalFile(storageKey, buffer, file.type);

    const verification = await prisma.tutorVerification.upsert({
      where: { tutorProfileId: tutorProfile.id },
      create: {
        tutorProfileId: tutorProfile.id,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      update: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    await prisma.verificationDocument.create({
      data: {
        verificationId: verification.id,
        type: (String(formData.get("documentType") || "OTHER")) as DocumentType,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        storageKey,
      },
    });

    revalidatePath("/tutor/verification");
    return { success: true, message: "Document uploaded." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to upload document." };
  }
}

// ——— Reviews ———

export async function createReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await createReview({
      eligibilityId: String(formData.get("eligibilityId") || ""),
      authorId: user.id,
      overallRating: Number(formData.get("overallRating") || 0),
      writtenReview: String(formData.get("writtenReview") || ""),
      isPublic: formData.get("isPublic") !== "off",
    });

    revalidatePath("/dashboard/reviews");
    return { success: true, message: "Review submitted." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to submit review." };
  }
}

export async function respondToReviewAction(
  reviewId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await respondToReview({
      reviewId,
      tutorUserId: user.id,
      body: String(formData.get("body") || ""),
    });

    revalidatePath("/tutor/reviews");
    return { success: true, message: "Response posted." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to post response." };
  }
}

// ——— Safety ———

export async function reportUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await reportUser({
      reporterId: user.id,
      reportedId: String(formData.get("reportedId") || ""),
      reason: String(formData.get("reason") || ""),
      details: String(formData.get("details") || "") || null,
      targetType: String(formData.get("targetType") || "USER"),
      targetId: String(formData.get("targetId") || "") || null,
    });

    revalidatePath("/dashboard/safety");
    revalidatePath("/tutor/safety");
    return { success: true, message: "Report submitted." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to submit report." };
  }
}

export async function blockUserAction(blockedId: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    await blockUser(user.id, blockedId);
    revalidatePath("/dashboard/safety");
    revalidatePath("/tutor/safety");
    return { success: true, message: "User blocked." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to block user." };
  }
}

export async function unblockUserAction(blockedId: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    await unblockUser(user.id, blockedId);
    revalidatePath("/dashboard/safety");
    revalidatePath("/tutor/safety");
    return { success: true, message: "User unblocked." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to unblock user." };
  }
}

// ——— Settings ———

export async function updateNotificationPrefsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailMessages: formData.get("emailMessages") === "on",
        emailApplications: formData.get("emailApplications") === "on",
        emailReviews: formData.get("emailReviews") === "on",
        emailMarketing: formData.get("emailMarketing") === "on",
      },
      update: {
        emailMessages: formData.get("emailMessages") === "on",
        emailApplications: formData.get("emailApplications") === "on",
        emailReviews: formData.get("emailReviews") === "on",
        emailMarketing: formData.get("emailMarketing") === "on",
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/tutor/settings");
    return { success: true, message: "Notification preferences saved." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to save preferences." };
  }
}

export async function ensureTutorProfileAction(): Promise<ActionState> {
  try {
    const user = await requireUser();
    if (user.role !== "TUTOR") return { message: "Not a tutor." };
    await createTutorProfileDraft({ userId: user.id });
    return { success: true };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to create profile." };
  }
}
