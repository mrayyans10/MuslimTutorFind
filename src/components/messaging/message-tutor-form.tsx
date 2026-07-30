"use client";

import { useActionState } from "react";

import {
  startMessageWithTutorAction,
  type ConnectActionState,
} from "@/app/actions/connect";
import { FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: ConnectActionState = {};

export function MessageTutorForm({
  tutorProfileId,
  tutorName,
  headline,
}: {
  tutorProfileId: string;
  tutorName: string;
  headline?: string | null;
}) {
  const [state, action, pending] = useActionState(startMessageWithTutorAction, initial);

  return (
    <form action={action} className="surface-card space-y-4 p-6">
      <input type="hidden" name="tutorProfileId" value={tutorProfileId} />
      <div>
        <p className="font-medium text-foreground">{tutorName}</p>
        {headline ? <p className="text-sm text-muted-foreground">{headline}</p> : null}
      </div>

      <FormError message={state.message} />

      <div className="space-y-2">
        <Label htmlFor="subject">Subject line</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="e.g. Grade 11 calculus help"
          defaultValue={`Inquiry for ${tutorName}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Your message</Label>
        <Textarea
          id="body"
          name="body"
          rows={6}
          required
          placeholder="Share the learner level, subject topic, online or in-person preference, and your goals."
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
