"use client";

import { useActionState } from "react";

import { updateMatchingWeightsAction, type ActionState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

export function MatchingWeightsForm({ weights }: { weights: Record<string, number> }) {
  const [state, formAction, pending] = useActionState(updateMatchingWeightsAction, initialState);

  return (
    <Card>
      <CardHeader><CardTitle>Weight configuration</CardTitle></CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message ? (
            <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {state.message}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{key.replace(/([A-Z])/g, " $1").trim()}</Label>
                <Input
                  id={key}
                  name={key}
                  type="number"
                  step="0.1"
                  min={0}
                  defaultValue={value}
                />
              </div>
            ))}
          </div>
          <Button type="submit" disabled={pending}>Save weights</Button>
        </form>
      </CardContent>
    </Card>
  );
}
