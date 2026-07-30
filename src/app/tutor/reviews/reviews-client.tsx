"use client";

import { useActionState } from "react";

import { respondToReviewAction, type ActionState } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Review = {
  id: string;
  overallRating: number;
  writtenReview: string;
  createdAt: Date;
  author: { displayName: string | null; legalName: string | null };
  response: { body: string } | null;
};

const initialState: ActionState = {};

function ResponseForm({ reviewId }: { reviewId: string }) {
  const boundAction = respondToReviewAction.bind(null, reviewId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="mt-3 space-y-2">
      {state.message ? (
        <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
          {state.message}
        </p>
      ) : null}
      <Textarea name="body" placeholder="Your response..." rows={3} required />
      <Button type="submit" size="sm" disabled={pending}>Post response</Button>
    </form>
  );
}

export function TutorReviewsClient({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {review.author.displayName ?? review.author.legalName ?? "Student"}
              </CardTitle>
              <Badge>{review.overallRating}/5</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{review.writtenReview}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
              {review.response ? (
                <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium">Your response</p>
                  <p>{review.response.body}</p>
                </div>
              ) : (
                <ResponseForm reviewId={review.id} />
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
