"use client";

import { useActionState, useTransition } from "react";

import {
  createProhibitedSubjectAction,
  deactivateProhibitedSubjectAction,
  type ActionState,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Prohibited = {
  id: string;
  term: string;
  aliases: string[];
  reason: string | null;
  isActive: boolean;
};

const initialState: ActionState = {};

export function ProhibitedSubjectsClient({ subjects }: { subjects: Prohibited[] }) {
  const [state, formAction, pending] = useActionState(createProhibitedSubjectAction, initialState);
  const [deactivatePending, startDeactivate] = useTransition();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Add prohibited term</CardTitle></CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.message ? (
              <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Input id="term" name="term" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aliases">Aliases (comma-separated)</Label>
              <Input id="aliases" name="aliases" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" name="reason" rows={2} />
            </div>
            <Button type="submit" disabled={pending}>Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {subjects.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{s.term}</p>
                {s.aliases.length > 0 ? (
                  <p className="text-xs text-muted-foreground">{s.aliases.join(", ")}</p>
                ) : null}
                {s.reason ? <p className="text-sm text-muted-foreground">{s.reason}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.isActive ? "default" : "secondary"}>
                  {s.isActive ? "Active" : "Inactive"}
                </Badge>
                {s.isActive ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={deactivatePending}
                    onClick={() => startDeactivate(() => { void deactivateProhibitedSubjectAction(s.id); })}
                  >
                    Deactivate
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
