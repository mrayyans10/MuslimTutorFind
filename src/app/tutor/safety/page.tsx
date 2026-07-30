import { SafetyClient } from "@/app/dashboard/safety/safety-client";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Safety" };

export default async function TutorSafetyPage() {
  const session = await requireSession();

  const [reports, blocks, conversations] = await Promise.all([
    prisma.userReport.findMany({
      where: { reporterId: session.user.id },
      include: { reported: { select: { displayName: true, legalName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userBlock.findMany({
      where: { blockerId: session.user.id },
      include: { blocked: { select: { id: true, displayName: true, legalName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.conversationParticipant.findMany({
      where: { userId: session.user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    legalName: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 50,
    }),
  ]);

  const contactMap = new Map<string, { id: string; label: string; role?: string | null }>();
  for (const row of conversations) {
    for (const participant of row.conversation.participants) {
      if (participant.userId === session.user.id) continue;
      contactMap.set(participant.userId, {
        id: participant.userId,
        label: participant.user.displayName ?? participant.user.legalName ?? "User",
        role: participant.user.role,
      });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Safety</h2>
        <p className="text-sm text-muted-foreground">Report concerns and manage blocked users.</p>
      </div>
      <SafetyClient
        reports={reports}
        blocks={blocks}
        contacts={[...contactMap.values()]}
      />
    </div>
  );
}
