"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  reportTutorAction,
  type ConnectActionState,
} from "@/app/actions/connect";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initial: ConnectActionState = {};

export function ReportTutorForm({
  tutorProfileId,
  tutorName,
}: {
  tutorProfileId: string;
  tutorName: string;
}) {
  const [state, action, pending] = useActionState(reportTutorAction, initial);

  if (state.success) {
    return (
      <div className="surface-card space-y-4 p-6 text-center">
        <p className="font-medium text-foreground">Report submitted</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline">
          <Link href="/find-tutors">Back to tutors</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="surface-card space-y-4 p-6">
      <input type="hidden" name="tutorProfileId" value={tutorProfileId} />
      <p className="text-sm text-muted-foreground">Reporting: {tutorName}</p>
      <FormError message={state.message} />

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Select id="reason" name="reason" required defaultValue="">
          <option value="" disabled>
            Select a reason
          </option>
          <option value="Inappropriate communication">Inappropriate communication</option>
          <option value="Religious instruction offered">Religious instruction offered</option>
          <option value="False qualifications">False qualifications</option>
          <option value="Spam or scam">Spam or scam</option>
          <option value="Harassment">Harassment</option>
          <option value="Other">Other</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Textarea id="details" name="details" rows={5} placeholder="What happened?" />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}
