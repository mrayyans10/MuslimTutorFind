"use client";

import { useState, useTransition } from "react";

import { updateVerificationStatusAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type VerificationRow = {
  id: string;
  tutorProfileId: string;
  status: string;
  documentsCount: number;
  tutorName: string;
  email: string;
};

export function AdminVerificationsClient({
  verifications,
}: {
  verifications: VerificationRow[];
}) {
  return (
    <div className="space-y-6">
      {verifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No verification submissions.</p>
      ) : (
        verifications.map((v) => <VerificationCard key={v.id} item={v} />)
      )}
    </div>
  );
}

function VerificationCard({ item }: { item: VerificationRow }) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const actionable = ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(item.status);

  const run = (fn: () => Promise<{ success?: boolean; message?: string }>) => {
    startTransition(async () => {
      const result = await fn();
      setSuccess(Boolean(result.success));
      setMessage(result.message ?? (result.success ? "Updated." : "Failed."));
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">{item.tutorName}</CardTitle>
          <p className="text-sm text-muted-foreground">{item.email}</p>
        </div>
        <Badge>{item.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{item.documentsCount} document(s) uploaded</p>
        {actionable ? (
          <>
            <Textarea
              rows={3}
              placeholder="Notes / rejection reason"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() =>
                  run(() => updateVerificationStatusAction(item.tutorProfileId, "VERIFIED"))
                }
              >
                Verify
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  run(() =>
                    updateVerificationStatusAction(
                      item.tutorProfileId,
                      "REJECTED",
                      undefined,
                      notes.trim() || "Documents insufficient",
                    ),
                  )
                }
              >
                Reject
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  run(() =>
                    updateVerificationStatusAction(
                      item.tutorProfileId,
                      "CHANGES_REQUESTED",
                      notes.trim() || "Please resubmit clearer documents",
                    ),
                  )
                }
              >
                Request changes
              </Button>
            </div>
          </>
        ) : null}
        {message ? (
          <p className={success ? "text-sm text-green-700" : "text-sm text-destructive"}>
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
