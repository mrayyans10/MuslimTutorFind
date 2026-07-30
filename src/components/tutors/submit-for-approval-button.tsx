"use client";

import { useState, useTransition } from "react";

import { submitTutorForApprovalAction } from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";

export function SubmitForApprovalButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await submitTutorForApprovalAction();
            setSuccess(Boolean(result.success));
            setMessage(result.message ?? (result.success ? "Submitted." : "Submission failed."));
          });
        }}
      >
        {pending ? "Submitting…" : "Submit profile for approval"}
      </Button>
      {message ? (
        <p className={success ? "text-sm text-green-700" : "text-sm text-destructive"}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
