import { VerificationClient } from "./verification-client";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Verification" };

export default async function TutorVerificationPage() {
  const session = await requireSession();
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      verification: {
        include: {
          documents: { where: { deletedAt: null }, orderBy: { uploadedAt: "desc" } },
        },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Verification</h2>
        <p className="text-sm text-muted-foreground">
          Upload identity and qualification documents for verification.
        </p>
      </div>
      <VerificationClient verification={tutorProfile?.verification ?? null} />
    </div>
  );
}
