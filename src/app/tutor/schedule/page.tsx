import { ScheduleForm } from "./schedule-form";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Schedule" };

export default async function TutorSchedulePage() {
  const session = await requireSession();
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: session.user.id },
    include: { availability: true },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Schedule</h2>
        <p className="text-sm text-muted-foreground">Set your general weekly availability.</p>
      </div>
      <ScheduleForm availability={tutorProfile?.availability ?? []} />
    </div>
  );
}
