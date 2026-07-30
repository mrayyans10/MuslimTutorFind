"use client";

import { useActionState, useTransition } from "react";

import {
  addTutorSubjectAction,
  removeTutorSubjectAction,
  type ActionState,
} from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Subject = { id: string; name: string };
type TutorSubject = {
  id: string;
  hourlyRate: { toString(): string };
  minLevel: string;
  maxLevel: string;
  subject: { name: string };
};

const initialState: ActionState = {};

export function SubjectsClient({
  subjects,
  tutorSubjects,
}: {
  subjects: Subject[];
  tutorSubjects: TutorSubject[];
}) {
  const [state, formAction, pending] = useActionState(addTutorSubjectAction, initialState);
  const [removePending, startRemove] = useTransition();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Add subject</CardTitle></CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.message ? (
              <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subjectId">Subject</Label>
                <Select id="subjectId" name="subjectId" required>
                  <option value="">Select</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly rate (CAD)</Label>
                <Input id="hourlyRate" name="hourlyRate" type="number" min={0} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minLevel">Min level</Label>
                <Select id="minLevel" name="minLevel" defaultValue="HIGH_SCHOOL">
                  <option value="ELEMENTARY">Elementary</option>
                  <option value="MIDDLE_SCHOOL">Middle school</option>
                  <option value="HIGH_SCHOOL">High school</option>
                  <option value="COLLEGE">College</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLevel">Max level</Label>
                <Select id="maxLevel" name="maxLevel" defaultValue="HIGH_SCHOOL">
                  <option value="HIGH_SCHOOL">High school</option>
                  <option value="COLLEGE">College</option>
                  <option value="ADULT">Adult</option>
                  <option value="ADVANCED">Advanced</option>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={pending}>Add subject</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-medium">Your subjects ({tutorSubjects.length})</h3>
        {tutorSubjects.map((ts) => (
          <Card key={ts.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{ts.subject.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${ts.hourlyRate.toString()}/hr · {ts.minLevel} – {ts.maxLevel}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={removePending}
                onClick={() => startRemove(() => { void removeTutorSubjectAction(ts.id); })}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
