import { TutorReviewsClient } from "./reviews-client";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Reviews" };

export default async function TutorReviewsPage() {
  const session = await requireSession();
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: session.user.id },
  });

  const reviews = await prisma.review.findMany({
    where: { tutorProfileId: tutorProfile?.id, removedAt: null, isPublic: true },
    include: {
      author: { select: { displayName: true, legalName: true } },
      response: { select: { body: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Reviews</h2>
        <p className="text-sm text-muted-foreground">Reviews from students and parents.</p>
      </div>
      <TutorReviewsClient reviews={reviews} />
    </div>
  );
}
