import { SubjectsClient } from "./subjects-client";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Subjects" };

export default async function TutorSubjectsPage() {
  const session = await requireSession();
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      subjects: { include: { subject: { select: { name: true } } } },
    },
  });

  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Subjects</h2>
        <p className="text-sm text-muted-foreground">Secular academic subjects you teach.</p>
      </div>
      <SubjectsClient subjects={subjects} tutorSubjects={tutorProfile?.subjects ?? []} />
    </div>
  );
}
