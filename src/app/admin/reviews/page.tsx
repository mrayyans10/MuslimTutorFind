import { removeReviewAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { removedAt: null },
    include: {
      author: { select: { displayName: true, email: true } },
      tutorProfile: { include: { user: { select: { displayName: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Reviews</h2>
        <p className="text-sm text-muted-foreground">Moderate public reviews.</p>
      </div>

      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">
                {review.author.displayName} → {review.tutorProfile.user.displayName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{review.author.email}</p>
            </div>
            <Badge>{review.overallRating}/5</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{review.writtenReview}</p>
            <form action={async () => { await removeReviewAction(review.id); }}>
              <Button type="submit" size="sm" variant="outline">Remove review</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
