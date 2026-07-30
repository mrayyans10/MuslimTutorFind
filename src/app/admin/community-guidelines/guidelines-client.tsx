"use client";

import { useActionState } from "react";

import {
  createGuidelineAction,
  updateGuidelineAction,
  type ActionState,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Guideline = {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  sortOrder: number;
};

const initialState: ActionState = {};

function GuidelineEditForm({ guideline }: { guideline: Guideline }) {
  const boundAction = updateGuidelineAction.bind(null, guideline.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.message ? (
        <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
          {state.message}
        </p>
      ) : null}
      <Input name="title" defaultValue={guideline.title} />
      <Textarea name="body" defaultValue={guideline.body} rows={4} />
      <label className="flex items-center gap-2">
        <Checkbox name="isActive" defaultChecked={guideline.isActive} />
        <Label>Active</Label>
      </label>
      <Button type="submit" size="sm" disabled={pending}>Save</Button>
    </form>
  );
}

export function GuidelinesClient({ guidelines }: { guidelines: Guideline[] }) {
  const [state, formAction, pending] = useActionState(createGuidelineAction, initialState);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Add guideline</CardTitle></CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.message ? (
              <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <Input name="title" placeholder="Title" required />
            <Textarea name="body" placeholder="Body" rows={4} required />
            <Input name="sortOrder" type="number" defaultValue={0} />
            <Button type="submit" disabled={pending}>Create</Button>
          </form>
        </CardContent>
      </Card>

      {guidelines.map((g) => (
        <Card key={g.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{g.title}</CardTitle>
            <Badge variant={g.isActive ? "default" : "secondary"}>
              {g.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardHeader>
          <CardContent>
            <GuidelineEditForm guideline={g} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
