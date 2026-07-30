"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import {
  approveTutorAction,
  rejectTutorAction,
  requestTutorChangesAction,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type TutorRow = {
  id: string;
  slug: string;
  status: string;
  headline: string | null;
  changeRequestNotes: string | null;
  rejectionReason: string | null;
  user: {
    displayName: string | null;
    legalName: string | null;
    email: string;
  };
  subjects: Array<{ subject: { name: string } }>;
};

export function AdminTutorsClient({ tutors }: { tutors: TutorRow[] }) {
  return (
    <div className="space-y-6">
      {tutors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tutor profiles yet.</p>
      ) : (
        tutors.map((tutor) => <TutorModerationCard key={tutor.id} tutor={tutor} />)
      )}
    </div>
  );
}

function TutorModerationCard({ tutor }: { tutor: TutorRow }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState("");

  const actionable = ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(tutor.status);

  const run = (fn: () => Promise<{ success?: boolean; message?: string }>) => {
    startTransition(async () => {
      const result = await fn();
      setSuccess(Boolean(result.success));
      setMessage(result.message ?? (result.success ? "Done." : "Action failed."));
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">
            {tutor.user.displayName ?? tutor.user.legalName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{tutor.user.email}</p>
          {tutor.headline ? <p className="mt-1 text-sm">{tutor.headline}</p> : null}
        </div>
        <Badge>{tutor.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Subjects: {tutor.subjects.map((s) => s.subject.name).join(", ") || "None"}
        </p>
        {tutor.changeRequestNotes ? (
          <p className="text-sm text-amber-700">Changes requested: {tutor.changeRequestNotes}</p>
        ) : null}
        {tutor.rejectionReason ? (
          <p className="text-sm text-destructive">Rejected: {tutor.rejectionReason}</p>
        ) : null}

        {actionable ? (
          <>
            <Textarea
              rows={3}
              placeholder="Notes for reject / request changes (optional for approve)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => run(() => approveTutorAction(tutor.id, notes || undefined))}
              >
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  run(() =>
                    rejectTutorAction(tutor.id, notes.trim() || "Does not meet requirements"),
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
                    requestTutorChangesAction(
                      tutor.id,
                      notes.trim() || "Please update your profile",
                    ),
                  )
                }
              >
                Request changes
              </Button>
              <Button type="button" size="sm" variant="ghost" asChild>
                <Link href={`/tutors/${tutor.slug}`}>Open public profile</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href={`/tutors/${tutor.slug}`}>Open public profile</Link>
          </Button>
        )}

        {message ? (
          <p className={success ? "text-sm text-green-700" : "text-sm text-destructive"}>
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
