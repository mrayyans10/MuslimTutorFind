"use client";

import { useActionState } from "react";

import { createReviewAction, type ActionState } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Eligibility = {
  id: string;
  reason: string;
  tutorProfile: {
    user: { displayName: string | null; legalName: string | null };
  };
};

type Review = {
  id: string;
  overallRating: number;
  writtenReview: string;
  createdAt: Date;
  tutorProfile: {
    user: { displayName: string | null; legalName: string | null };
  };
};

const initialState: ActionState = {};

function ReviewForm({ eligibility }: { eligibility: Eligibility }) {
  const [state, formAction, pending] = useActionState(createReviewAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Review{" "}
          {eligibility.tutorProfile.user.displayName ?? eligibility.tutorProfile.user.legalName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="eligibilityId" value={eligibility.id} />
          {state.message ? (
            <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {state.message}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor={`rating-${eligibility.id}`}>Overall rating (1–5)</Label>
            <Input
              id={`rating-${eligibility.id}`}
              name="overallRating"
              type="number"
              min={1}
              max={5}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`review-${eligibility.id}`}>Written review</Label>
            <Textarea id={`review-${eligibility.id}`} name="writtenReview" required rows={4} />
          </div>
          <Button type="submit" disabled={pending}>
            Submit review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ReviewsClient({
  eligibilities,
  reviews,
}: {
  eligibilities: Eligibility[];
  reviews: Review[];
}) {
  return (
    <div className="space-y-6">
      {eligibilities.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-medium">Pending reviews</h3>
          {eligibilities.map((e) => (
            <ReviewForm key={e.id} eligibility={e} />
          ))}
        </div>
      ) : null}

      <div className="space-y-4">
        <h3 className="font-medium">Your reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews submitted yet.</p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {review.tutorProfile.user.displayName ?? review.tutorProfile.user.legalName}
                </CardTitle>
                <Badge>{review.overallRating}/5</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{review.writtenReview}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
