"use client";

import { useActionState } from "react";

import { updateTutorLocationAction, type ActionState } from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Location = {
  onlineAvailable: boolean;
  inPersonAvailable: boolean;
  tutorTravels: boolean;
  studentTravels: boolean;
  publicMeetingOk: boolean;
  travelRadiusKm: number | null;
  city: string | null;
  region: string | null;
  country: string | null;
  approximateArea: string | null;
};

const initialState: ActionState = {};

export function LocationForm({ location }: { location: Location | null }) {
  const [state, formAction, pending] = useActionState(updateTutorLocationAction, initialState);

  return (
    <Card>
      <CardHeader><CardTitle>Location preferences</CardTitle></CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message ? (
            <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {state.message}
            </p>
          ) : null}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <Checkbox name="onlineAvailable" defaultChecked={location?.onlineAvailable ?? true} />
              <Label>Online tutoring available</Label>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="inPersonAvailable" defaultChecked={location?.inPersonAvailable ?? false} />
              <Label>In-person tutoring available</Label>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="tutorTravels" defaultChecked={location?.tutorTravels ?? false} />
              <Label>I can travel to students</Label>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="studentTravels" defaultChecked={location?.studentTravels ?? false} />
              <Label>Students can come to me</Label>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="publicMeetingOk" defaultChecked={location?.publicMeetingOk ?? true} />
              <Label>Public meeting locations OK</Label>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={location?.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input id="region" name="region" defaultValue={location?.region ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={location?.country ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approximateArea">Approximate area</Label>
              <Input id="approximateArea" name="approximateArea" defaultValue={location?.approximateArea ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelRadiusKm">Travel radius (km)</Label>
              <Input id="travelRadiusKm" name="travelRadiusKm" type="number" defaultValue={location?.travelRadiusKm ?? ""} />
            </div>
          </div>
          <Button type="submit" disabled={pending}>Save location</Button>
        </form>
      </CardContent>
    </Card>
  );
}
