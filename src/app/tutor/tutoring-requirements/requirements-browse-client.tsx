"use client";

import { useActionState } from "react";

import { applyToRequirementAction, type ActionState } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Requirement = {
  id: string;
  whoNeedsHelp: string;
  description: string;
  learnerLevel: string;
  mode: string;
  city: string | null;
  subject: { name: string };
};

const initialState: ActionState = {};

function ApplyForm({ requirementId }: { requirementId: string }) {
  const [state, formAction, pending] = useActionState(applyToRequirementAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-3 border-t border-border pt-4">
      <input type="hidden" name="requirementId" value={requirementId} />
      {state.message ? (
        <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor={`intro-${requirementId}`}>Introduction</Label>
        <Textarea id={`intro-${requirementId}`} name="introduction" required rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`rate-${requirementId}`}>Proposed hourly rate (CAD)</Label>
        <Input id={`rate-${requirementId}`} name="proposedHourlyRate" type="number" min={0} required />
      </div>
      <Button type="submit" size="sm" disabled={pending}>Apply</Button>
    </form>
  );
}

export function RequirementsBrowseClient({ requirements }: { requirements: Requirement[] }) {
  return (
    <div className="space-y-4">
      {requirements.length === 0 ? (
        <p className="text-sm text-muted-foreground">No published requirements at this time.</p>
      ) : (
        requirements.map((req) => (
          <Card key={req.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{req.subject.name}</CardTitle>
                <Badge variant="secondary">{req.mode}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {req.whoNeedsHelp} · {req.learnerLevel}
                {req.city ? ` · ${req.city}` : ""}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{req.description}</p>
              <ApplyForm requirementId={req.id} />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
