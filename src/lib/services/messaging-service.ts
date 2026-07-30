import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

type StartConversationInput = {
  initiatorId: string;
  participantIds: string[];
  subject?: string | null;
  relatedRequirementId?: string | null;
  involvesMinor?: boolean;
  childProfileId?: string | null;
};

type SendMessageInput = {
  conversationId: string;
  senderId: string;
  body: string;
};

type ReportUserInput = {
  reporterId: string;
  reportedId: string;
  reason: string;
  details?: string | null;
  targetType?: string;
  targetId?: string | null;
};

const MESSAGE_RATE_LIMIT = 20;
const MESSAGE_RATE_WINDOW_MS = 60 * 1_000;

function uniqueIds(ids: string[]) {
  return [...new Set(ids.filter(Boolean))];
}

function blockPairs(userIds: string[]) {
  const pairs: Array<{ blockerId: string; blockedId: string }> = [];
  for (const blockerId of userIds) {
    for (const blockedId of userIds) {
      if (blockerId !== blockedId) pairs.push({ blockerId, blockedId });
    }
  }
  return pairs;
}

async function assertNoBlocks(userIds: string[]) {
  const pairs = blockPairs(userIds);
  if (pairs.length === 0) return;

  const block = await prisma.userBlock.findFirst({
    where: { OR: pairs },
    select: { blockerId: true, blockedId: true },
  });

  if (block) {
    throw new Error("Conversation is not allowed because one participant has blocked another.");
  }
}

async function parentVisibilityUserIds(input: StartConversationInput) {
  const parentUserIds = new Set<string>();

  if (input.childProfileId) {
    const child = await prisma.childProfile.findUnique({
      where: { id: input.childProfileId },
      select: {
        parentCanViewMessages: true,
        parents: { select: { parent: { select: { userId: true } } } },
      },
    });
    if (child?.parentCanViewMessages) {
      child.parents.forEach((relationship) => parentUserIds.add(relationship.parent.userId));
    }
  }

  if (input.relatedRequirementId) {
    const requirement = await prisma.tutoringRequirement.findUnique({
      where: { id: input.relatedRequirementId },
      select: {
        parentProfile: { select: { userId: true } },
        childProfile: {
          select: {
            parentCanViewMessages: true,
            parents: { select: { parent: { select: { userId: true } } } },
          },
        },
      },
    });

    if (requirement?.parentProfile?.userId) parentUserIds.add(requirement.parentProfile.userId);
    if (requirement?.childProfile?.parentCanViewMessages) {
      requirement.childProfile.parents.forEach((relationship) => parentUserIds.add(relationship.parent.userId));
    }
  }

  return [...parentUserIds];
}

export async function startConversation(input: StartConversationInput) {
  const includesMinor = Boolean(input.involvesMinor || input.childProfileId);
  const visibilityUserIds = includesMinor ? await parentVisibilityUserIds(input) : [];
  const participantIds = uniqueIds([input.initiatorId, ...input.participantIds, ...visibilityUserIds]);

  if (participantIds.length < 2) {
    throw new Error("A conversation requires at least two participants.");
  }

  await assertNoBlocks(participantIds);

  return prisma.conversation.create({
    data: {
      subject: input.subject?.trim() || null,
      relatedRequirementId: input.relatedRequirementId ?? null,
      involvesMinor: includesMinor,
      participants: {
        create: participantIds.map((userId) => ({ userId })),
      },
    },
    include: {
      participants: { include: { user: true } },
    },
  });
}

export async function sendMessage(input: SendMessageInput) {
  const limited = rateLimit(`message:${input.senderId}`, MESSAGE_RATE_LIMIT, MESSAGE_RATE_WINDOW_MS);
  if (!limited.ok) {
    throw new Error("Message rate limit exceeded. Please wait before sending more messages.");
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: input.conversationId },
    select: {
      id: true,
      participants: {
        select: { userId: true, user: { select: { status: true } } },
      },
    },
  });
  if (!conversation) throw new Error("Conversation not found.");

  const participant = conversation.participants.find((p) => p.userId === input.senderId);
  if (!participant) throw new Error("Sender is not a participant in this conversation.");
  if (participant.user.status !== "ACTIVE" && participant.user.status !== "PENDING_VERIFICATION") {
    throw new Error("Sender is not allowed to send messages.");
  }

  await assertNoBlocks(conversation.participants.map((p) => p.userId));

  return prisma.message.create({
    data: {
      conversationId: input.conversationId,
      senderId: input.senderId,
      body: input.body.trim(),
    },
  });
}

export async function reportUser(input: ReportUserInput) {
  if (input.reporterId === input.reportedId) {
    throw new Error("You cannot report yourself.");
  }

  return prisma.$transaction(async (tx) => {
    const report = await tx.userReport.create({
      data: {
        reporterId: input.reporterId,
        reportedId: input.reportedId,
        reason: input.reason.trim(),
        details: input.details?.trim() || null,
        targetType: input.targetType ?? "USER",
        targetId: input.targetId ?? null,
      },
    });

    await tx.moderationCase.create({
      data: {
        reportId: report.id,
        title: `Report: ${input.reason.trim()}`,
        status: "OPEN",
        internalNotes: input.details?.trim() || null,
      },
    });

    return report;
  });
}

export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) {
    throw new Error("You cannot block yourself.");
  }

  return prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    create: { blockerId, blockedId },
    update: {},
  });
}

export async function unblockUser(blockerId: string, blockedId: string) {
  await prisma.userBlock.deleteMany({
    where: { blockerId, blockedId },
  });
  return { blocked: false };
}
