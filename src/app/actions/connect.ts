"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startConversation } from "@/lib/services/messaging-service";
import { reportUser, blockUser } from "@/lib/services/messaging-service";

export type ConnectActionState = {
  success?: boolean;
  message?: string;
  conversationId?: string;
};

export async function startMessageWithTutorAction(
  _prev: ConnectActionState,
  formData: FormData,
): Promise<ConnectActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Please sign in to message a tutor." };
  }

  const tutorProfileId = String(formData.get("tutorProfileId") || "");
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!tutorProfileId) return { message: "Tutor is required." };
  if (!body) return { message: "Please write a short introduction message." };

  try {
    const tutor = await prisma.tutorProfile.findFirst({
      where: {
        id: tutorProfileId,
        status: "APPROVED",
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        user: { select: { displayName: true, legalName: true } },
      },
    });

    if (!tutor) return { message: "This tutor is not available for messaging." };
    if (tutor.userId === session.user.id) {
      return { message: "You cannot message yourself." };
    }

    const conversation = await startConversation({
      initiatorId: session.user.id,
      participantIds: [tutor.userId],
      subject:
        subject ||
        `Inquiry for ${tutor.user.displayName ?? tutor.user.legalName ?? "tutor"}`,
    });

    // Seed the first message so the thread is useful immediately.
    const { sendMessage } = await import("@/lib/services/messaging-service");
    await sendMessage({
      conversationId: conversation.id,
      senderId: session.user.id,
      body,
    });

    revalidatePath("/dashboard/messages");
    revalidatePath("/tutor/messages");

    const role = session.user.role;
    const base = role === "TUTOR" ? "/tutor/messages" : "/dashboard/messages";
    redirect(`${base}/${conversation.id}`);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return {
      message: error instanceof Error ? error.message : "Could not start conversation.",
    };
  }
}

export async function reportTutorAction(
  _prev: ConnectActionState,
  formData: FormData,
): Promise<ConnectActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Please sign in to submit a report." };
  }

  const tutorProfileId = String(formData.get("tutorProfileId") || "");
  const reason = String(formData.get("reason") || "").trim();
  const details = String(formData.get("details") || "").trim();

  if (!tutorProfileId) return { message: "Tutor is required." };
  if (!reason) return { message: "Please provide a reason." };

  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { id: tutorProfileId },
      select: { userId: true },
    });
    if (!tutor) return { message: "Tutor not found." };
    if (tutor.userId === session.user.id) {
      return { message: "You cannot report yourself." };
    }

    await reportUser({
      reporterId: session.user.id,
      reportedId: tutor.userId,
      reason,
      details: details || null,
      targetType: "TutorProfile",
      targetId: tutorProfileId,
    });

    revalidatePath("/dashboard/safety");
    revalidatePath("/admin/reports");
    return { success: true, message: "Report submitted. Our moderators will review it." };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Could not submit report.",
    };
  }
}

export async function blockTutorAction(tutorProfileId: string): Promise<ConnectActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Please sign in to block a user." };
  }

  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { id: tutorProfileId },
      select: { userId: true },
    });
    if (!tutor) return { message: "Tutor not found." };
    await blockUser(session.user.id, tutor.userId);
    revalidatePath("/dashboard/safety");
    return { success: true, message: "User blocked." };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Could not block user.",
    };
  }
}
