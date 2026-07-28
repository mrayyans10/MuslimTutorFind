"use client";

import * as React from "react";
import { useActionState } from "react";

import {
  submitTutorForApprovalAction,
  updateTutorProfileAction,
  type ActionState,
} from "@/app/actions/dashboard";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TutorProfile = {
  status: string;
  headline: string | null;
  biography: string | null;
  teachingApproach: string | null;
  yearsExperience: number;
  currentOccupation: string | null;
  educationSummary: string | null;
  communityAttested: boolean;
  secularSubjectsOnly: boolean;
  conductAgreed: boolean;
  noReligiousInstruction: boolean;
  termsAcceptedAt: Date | null;
  guidelinesAcceptedAt: Date | null;
  changeRequestNotes: string | null;
  user: { displayName: string | null };
};

const initialState: ActionState = {};

export function TutorProfileForm({ profile }: { profile: TutorProfile }) {
  const [state, formAction, pending] = useActionState(updateTutorProfileAction, initialState);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge>{profile.status}</Badge>
        {profile.changeRequestNotes ? (
          <p className="text-sm text-amber-600">{profile.changeRequestNotes}</p>
        ) : null}
      </div>

      <SecularNotice />

      <Card>
        <CardHeader><CardTitle>Basic information</CardTitle></CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state.message ? (
              <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" name="displayName" defaultValue={profile.user.displayName ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" name="headline" defaultValue={profile.headline ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of experience</Label>
                <Input id="yearsExperience" name="yearsExperience" type="number" defaultValue={profile.yearsExperience} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentOccupation">Current occupation</Label>
                <Input id="currentOccupation" name="currentOccupation" defaultValue={profile.currentOccupation ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="biography">Biography</Label>
              <Textarea id="biography" name="biography" rows={4} defaultValue={profile.biography ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teachingApproach">Teaching approach</Label>
              <Textarea id="teachingApproach" name="teachingApproach" rows={3} defaultValue={profile.teachingApproach ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="educationSummary">Education summary</Label>
              <Textarea id="educationSummary" name="educationSummary" rows={3} defaultValue={profile.educationSummary ?? ""} />
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <p className="text-sm font-medium">Community eligibility</p>
              <label className="flex items-center gap-2">
                <Checkbox name="communityAttested" defaultChecked={profile.communityAttested} />
                <Label>I am part of the Muslim community</Label>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox name="secularSubjectsOnly" defaultChecked={profile.secularSubjectsOnly} />
                <Label>I will only teach secular academic subjects</Label>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox name="conductAgreed" defaultChecked={profile.conductAgreed} />
                <Label>I agree to the code of conduct</Label>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox name="noReligiousInstruction" defaultChecked={profile.noReligiousInstruction} />
                <Label>I will not provide religious instruction</Label>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox name="termsAccepted" defaultChecked={!!profile.termsAcceptedAt} />
                <Label>I accept the terms of service</Label>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox name="guidelinesAccepted" defaultChecked={!!profile.guidelinesAcceptedAt} />
                <Label>I accept the community guidelines</Label>
              </label>
            </div>

            <Button type="submit" disabled={pending}>Save profile</Button>
          </form>
        </CardContent>
      </Card>

      {["DRAFT", "CHANGES_REQUESTED", "REJECTED"].includes(profile.status) ? (
        <SubmitButton />
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => { void submitTutorForApprovalAction(); })}
    >
      Submit for approval
    </Button>
  );
}
