"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMessage, startConversation } from "@/lib/services/messaging-service";

export type ActionState = {
  success?: boolean;
  message?: string;
  conversationId?: string;
};

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  return session.user;
}

export async function getConversations() {
  const user = await requireUser();
  return prisma.conversation.findMany({
    where: {
      participants: { some: { userId: user.id } },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, displayName: true, legalName: true, role: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getConversation(conversationId: string) {
  const user = await requireUser();
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: { some: { userId: user.id } },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, displayName: true, legalName: true, role: true } },
        },
      },
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, displayName: true, legalName: true } },
        },
      },
    },
  });

  if (conversation) {
    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId: user.id },
      data: { lastReadAt: new Date() },
    });
  }

  return conversation;
}

export async function sendMessageAction(
  conversationId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const body = String(formData.get("body") || "").trim();
    if (!body) return { message: "Message cannot be empty." };

    await sendMessage({ conversationId, senderId: user.id, body });

    revalidatePath("/dashboard/messages");
    revalidatePath("/tutor/messages");
    revalidatePath(`/dashboard/messages/${conversationId}`);
    revalidatePath(`/tutor/messages/${conversationId}`);
    return { success: true, message: "Message sent.", conversationId };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to send message." };
  }
}

export async function startConversationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const participantId = String(formData.get("participantId") || "");
    if (!participantId) return { message: "Participant required." };

    const conversation = await startConversation({
      initiatorId: user.id,
      participantIds: [participantId],
      subject: String(formData.get("subject") || "") || null,
      relatedRequirementId: String(formData.get("relatedRequirementId") || "") || null,
      involvesMinor: formData.get("involvesMinor") === "on",
      childProfileId: String(formData.get("childProfileId") || "") || null,
    });

    revalidatePath("/dashboard/messages");
    revalidatePath("/tutor/messages");
    return { success: true, conversationId: conversation.id };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to start conversation." };
  }
}

export async function getFlaggedMessages() {
  await requireUser();
  return prisma.message.findMany({
    where: { flagged: true, deletedAt: null },
    include: {
      sender: { select: { id: true, displayName: true, email: true } },
      conversation: {
        select: {
          id: true,
          subject: true,
          participants: {
            include: { user: { select: { id: true, displayName: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function flagMessageAction(messageId: string): Promise<ActionState> {
  try {
    await requireUser();
    await prisma.message.update({
      where: { id: messageId },
      data: { flagged: true },
    });
    revalidatePath("/admin/messages");
    return { success: true, message: "Message flagged." };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to flag message." };
  }
}
