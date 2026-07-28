import { SafetyClient } from "@/app/dashboard/safety/safety-client";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Safety" };

export default async function TutorSafetyPage() {
  const session = await requireSession();

  const [reports, blocks] = await Promise.all([
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
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Safety</h2>
        <p className="text-sm text-muted-foreground">Report concerns and manage blocked users.</p>
      </div>
      <SafetyClient reports={reports} blocks={blocks} />
    </div>
  );
}
