"use client";

import { useActionState } from "react";

import { updateUserProfileAction, type ActionState } from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProfilePageClientProps = {
  user: {
    displayName: string | null;
    legalName: string | null;
    email: string;
    phone: string | null;
    country: string | null;
    city: string | null;
    timezone: string | null;
    role: string | null;
  };
  studentProfile?: {
    ageBand: string | null;
    schoolLevel: string | null;
    preferredLanguage: string | null;
  } | null;
};

const initialState: ActionState = {};

export function ProfileForm({ user, studentProfile }: ProfilePageClientProps) {
  const [state, formAction, pending] = useActionState(updateUserProfileAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message ? (
            <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {state.message}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" name="displayName" defaultValue={user.displayName ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal name</Label>
              <Input id="legalName" name="legalName" defaultValue={user.legalName ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={user.country ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={user.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" defaultValue={user.timezone ?? ""} />
            </div>
          </div>

          {user.role === "STUDENT" && studentProfile ? (
            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ageBand">Age band</Label>
                <Input id="ageBand" name="ageBand" defaultValue={studentProfile.ageBand ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolLevel">School level</Label>
                <Input id="schoolLevel" name="schoolLevel" defaultValue={studentProfile.schoolLevel ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredLanguage">Preferred language</Label>
                <Input
                  id="preferredLanguage"
                  name="preferredLanguage"
                  defaultValue={studentProfile.preferredLanguage ?? ""}
                />
              </div>
            </div>
          ) : null}

          <Button type="submit" disabled={pending}>
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
