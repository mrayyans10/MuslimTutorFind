import { ReviewsClient } from "./reviews-client";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const session = await requireSession();

  const eligibilitiesRaw = await prisma.reviewEligibility.findMany({
    where: { studentUserId: session.user.id, usedAt: null },
  });

  const [tutorProfiles, reviews] = await Promise.all([
    prisma.tutorProfile.findMany({
      where: { id: { in: eligibilitiesRaw.map((e) => e.tutorProfileId) } },
      include: { user: { select: { displayName: true, legalName: true } } },
    }),
    prisma.review.findMany({
      where: { authorId: session.user.id, removedAt: null },
      include: {
        tutorProfile: {
          include: { user: { select: { displayName: true, legalName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const tutorMap = new Map(tutorProfiles.map((t) => [t.id, t]));
  const eligibilities = eligibilitiesRaw.map((e) => ({
    id: e.id,
    reason: e.reason,
    tutorProfile: {
      user: tutorMap.get(e.tutorProfileId)?.user ?? { displayName: null, legalName: null },
    },
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Reviews</h2>
        <p className="text-sm text-muted-foreground">
          Leave reviews for tutors after accepted applications.
        </p>
      </div>
      <ReviewsClient eligibilities={eligibilities} reviews={reviews} />
    </div>
  );
}
