import { LocationForm } from "./location-form";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Location" };

export default async function TutorLocationPage() {
  const session = await requireSession();
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: session.user.id },
    include: { location: true },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Location</h2>
        <p className="text-sm text-muted-foreground">Where and how you offer tutoring.</p>
      </div>
      <LocationForm location={tutorProfile?.location ?? null} />
    </div>
  );
}
