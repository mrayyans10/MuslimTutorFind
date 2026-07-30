"use client";

import { useActionState, useTransition } from "react";

import {
  createRequirementAction,
  publishRequirementAction,
  updateRequirementStatusAction,
  type ActionState,
} from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Subject = { id: string; name: string };
type Child = { id: string; displayNickname: string };
type Requirement = {
  id: string;
  whoNeedsHelp: string;
  status: string;
  description: string;
  subject: { name: string };
  createdAt: Date;
};

const initialState: ActionState = {};

function CreateRequirementForm({
  subjects,
  learners,
}: {
  subjects: Subject[];
  learners: Child[];
}) {
  const [state, formAction, pending] = useActionState(createRequirementAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create requirement</CardTitle>
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
              <Label htmlFor="whoNeedsHelp">Who needs help?</Label>
              <Input id="whoNeedsHelp" name="whoNeedsHelp" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject</Label>
              <Select id="subjectId" name="subjectId" required>
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            {learners.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="childProfileId">Learner (optional)</Label>
                <Select id="childProfileId" name="childProfileId">
                  <option value="">None</option>
                  {learners.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayNickname}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="learnerLevel">Learner level</Label>
              <Select id="learnerLevel" name="learnerLevel" defaultValue="HIGH_SCHOOL">
                <option value="ELEMENTARY">Elementary</option>
                <option value="MIDDLE_SCHOOL">Middle school</option>
                <option value="HIGH_SCHOOL">High school</option>
                <option value="COLLEGE">College</option>
                <option value="ADULT">Adult</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select id="mode" name="mode" defaultValue="ONLINE">
                <option value="ONLINE">Online</option>
                <option value="IN_PERSON">In person</option>
                <option value="EITHER">Either</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required rows={4} />
          </div>
          <Button type="submit" disabled={pending}>
            Create draft
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RequirementActions({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {status === "DRAFT" ? (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => { void publishRequirementAction(id); })}
        >
          Publish
        </Button>
      ) : null}
      {status === "PUBLISHED" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => startTransition(() => { void updateRequirementStatusAction(id, "PAUSED"); })}
        >
          Pause
        </Button>
      ) : null}
      {status !== "CLOSED" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => startTransition(() => { void updateRequirementStatusAction(id, "CLOSED"); })}
        >
          Close
        </Button>
      ) : null}
    </div>
  );
}

export function RequirementsClient({
  requirements,
  subjects,
  learners,
}: {
  requirements: Requirement[];
  subjects: Subject[];
  learners: Child[];
}) {
  return (
    <div className="space-y-6">
      <CreateRequirementForm subjects={subjects} learners={learners} />

      <div className="space-y-4">
        <h3 className="font-medium">Your requirements ({requirements.length})</h3>
        {requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requirements yet.</p>
        ) : (
          requirements.map((req) => (
            <Card key={req.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{req.subject.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{req.whoNeedsHelp}</p>
                </div>
                <Badge>{req.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{req.description}</p>
                <RequirementActions id={req.id} status={req.status} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
