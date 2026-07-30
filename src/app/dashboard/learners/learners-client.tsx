"use client";

import { useActionState, useTransition } from "react";

import {
  createLearnerAction,
  deleteLearnerAction,
  updateLearnerAction,
  type ActionState,
} from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Child = {
  id: string;
  displayNickname: string;
  privateLegalName: string | null;
  ageBand: string;
  gradeLevel: string | null;
  curriculum: string | null;
  learningGoals: string | null;
  preferredLanguage: string | null;
  accommodations: string | null;
};

const initialState: ActionState = {};

function LearnerForm({ child, onCancel }: { child?: Child; onCancel?: () => void }) {
  const action = child
    ? updateLearnerAction.bind(null, child.id)
    : createLearnerAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="displayNickname">Nickname</Label>
          <Input
            id="displayNickname"
            name="displayNickname"
            defaultValue={child?.displayNickname ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="privateLegalName">Legal name (private)</Label>
          <Input
            id="privateLegalName"
            name="privateLegalName"
            defaultValue={child?.privateLegalName ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ageBand">Age band</Label>
          <Input id="ageBand" name="ageBand" defaultValue={child?.ageBand ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gradeLevel">Grade level</Label>
          <Input id="gradeLevel" name="gradeLevel" defaultValue={child?.gradeLevel ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="curriculum">Curriculum</Label>
          <Input id="curriculum" name="curriculum" defaultValue={child?.curriculum ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredLanguage">Preferred language</Label>
          <Input
            id="preferredLanguage"
            name="preferredLanguage"
            defaultValue={child?.preferredLanguage ?? ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="learningGoals">Learning goals</Label>
        <Textarea id="learningGoals" name="learningGoals" defaultValue={child?.learningGoals ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accommodations">Accommodations</Label>
        <Textarea id="accommodations" name="accommodations" defaultValue={child?.accommodations ?? ""} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {child ? "Update learner" : "Add learner"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function DeleteLearnerButton({ childId }: { childId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => { void deleteLearnerAction(childId); })}
    >
      Remove
    </Button>
  );
}

export function LearnersClient({ learners }: { learners: Child[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add a learner</CardTitle>
        </CardHeader>
        <CardContent>
          <LearnerForm />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium">Your learners ({learners.length})</h3>
        {learners.length === 0 ? (
          <p className="text-sm text-muted-foreground">No learner profiles yet.</p>
        ) : (
          learners.map((child) => (
            <Card key={child.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">{child.displayNickname}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {child.ageBand}
                  </Badge>
                </div>
                <DeleteLearnerButton childId={child.id} />
              </CardHeader>
              <CardContent>
                <LearnerForm child={child} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
