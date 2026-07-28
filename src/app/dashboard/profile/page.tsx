import { redirect } from "next/navigation";

import { ProfileForm } from "./profile-form";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      legalName: true,
      email: true,
      phone: true,
      country: true,
      city: true,
      timezone: true,
      role: true,
      studentProfile: {
        select: { ageBand: true, schoolLevel: true, preferredLanguage: true },
      },
    },
  });

  if (!user) redirect("/sign-in");

  return <ProfileForm user={user} studentProfile={user.studentProfile} />;
}
