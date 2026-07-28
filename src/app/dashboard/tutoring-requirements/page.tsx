import { RequirementsClient } from "./requirements-client";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Tutoring requirements" };

export default async function TutoringRequirementsPage() {
  const session = await requireSession();

  const [requirements, subjects, parent] = await Promise.all([
    prisma.tutoringRequirement.findMany({
      where: {
        deletedAt: null,
        OR: [
          { studentProfile: { userId: session.user.id } },
          { parentProfile: { userId: session.user.id } },
        ],
      },
      include: { subject: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      include: { children: { include: { child: true } } },
    }),
  ]);

  const children =
    parent?.children
      .map((r) => r.child)
      .filter((c) => !c.deletedAt)
      .map((c) => ({ id: c.id, displayNickname: c.displayNickname })) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Tutoring requirements</h2>
        <p className="text-sm text-muted-foreground">
          Post and manage secular academic tutoring requirements.
        </p>
      </div>
      <RequirementsClient
        requirements={requirements}
        subjects={subjects}
        learners={children}
      />
    </div>
  );
}
