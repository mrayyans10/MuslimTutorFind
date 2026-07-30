"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { Flag, MessageSquare, Ban } from "lucide-react";

import { blockTutorAction } from "@/app/actions/connect";
import { Button } from "@/components/ui/button";

export function TutorProfileActions({
  tutorProfileId,
  signedIn,
}: {
  tutorProfileId: string;
  signedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/messages/new?tutor=${tutorProfileId}`}>
            <MessageSquare className="size-4" />
            Message
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/report?tutor=${tutorProfileId}`}>
            <Flag className="size-4" />
            Report
          </Link>
        </Button>
        {signedIn ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await blockTutorAction(tutorProfileId);
                setSuccess(Boolean(result.success));
                setMessage(result.message ?? null);
              })
            }
          >
            <Ban className="size-4" />
            {pending ? "Blocking…" : "Block"}
          </Button>
        ) : null}
      </div>
      {message ? (
        <p className={success ? "text-sm text-green-700" : "text-sm text-destructive"}>
          {message}
          {success ? (
            <>
              {" "}
              <Link href="/dashboard/safety" className="link-underline">
                Manage blocks
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
