"use client";

import { useActionState } from "react";

import { updateNotificationPrefsAction, type ActionState } from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Prefs = {
  emailMessages: boolean;
  emailApplications: boolean;
  emailReviews: boolean;
  emailMarketing: boolean;
} | null;

const initialState: ActionState = {};

export function SettingsForm({ prefs }: { prefs: Prefs }) {
  const [state, formAction, pending] = useActionState(updateNotificationPrefsAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message ? (
            <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {state.message}
            </p>
          ) : null}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <Checkbox name="emailMessages" defaultChecked={prefs?.emailMessages ?? true} />
              <Label>Email me about new messages</Label>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="emailApplications" defaultChecked={prefs?.emailApplications ?? true} />
              <Label>Email me about applications</Label>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="emailReviews" defaultChecked={prefs?.emailReviews ?? true} />
              <Label>Email me about reviews</Label>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="emailMarketing" defaultChecked={prefs?.emailMarketing ?? false} />
              <Label>Send marketing emails</Label>
            </label>
          </div>
          <Button type="submit" disabled={pending}>
            Save preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
