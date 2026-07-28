import { redirect } from "next/navigation";

import { ensureTutorProfileAction } from "@/app/actions/dashboard";
import { TutorProfileForm } from "./tutor-profile-form";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Tutor profile" };

export default async function TutorProfilePage() {
  const session = await requireSession();
  let profile = await prisma.tutorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { displayName: true } } },
  });

  if (!profile) {
    await ensureTutorProfileAction();
    profile = await prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { displayName: true } } },
    });
  }

  if (!profile) redirect("/tutor/dashboard");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Tutor profile</h2>
        <p className="text-sm text-muted-foreground">Edit your public tutor profile.</p>
      </div>
      <TutorProfileForm profile={profile} />
    </div>
  );
}
