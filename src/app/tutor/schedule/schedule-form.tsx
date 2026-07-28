"use client";

import { useActionState, useState } from "react";

import { updateTutorScheduleAction, type ActionState } from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const PERIODS = ["MORNING", "AFTERNOON", "EVENING"];

type Slot = { dayOfWeek: string; period: string };

const initialState: ActionState = {};

function slotKey(day: string, period: string) {
  return `${day}:${period}`;
}

export function ScheduleForm({ availability }: { availability: Slot[] }) {
  const [state, formAction, pending] = useActionState(updateTutorScheduleAction, initialState);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(availability.map((a) => slotKey(a.dayOfWeek, a.period))),
  );

  const toggle = (day: string, period: string) => {
    const key = slotKey(day, period);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>General availability</CardTitle></CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message ? (
            <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {state.message}
            </p>
          ) : null}
          {[...selected].map((key) => {
            const [day, period] = key.split(":");
            return (
              <span key={key}>
                <input type="hidden" name="dayOfWeek" value={day} />
                <input type="hidden" name="period" value={period} />
              </span>
            );
          })}
          <div className="grid gap-2 sm:grid-cols-2">
            {DAYS.flatMap((day) =>
              PERIODS.map((period) => {
                const id = `${day}-${period}`;
                const key = slotKey(day, period);
                return (
                  <label key={id} className="flex items-center gap-2 rounded border border-border p-2">
                    <Checkbox
                      id={id}
                      checked={selected.has(key)}
                      onCheckedChange={() => toggle(day, period)}
                    />
                    <Label htmlFor={id} className="text-sm capitalize">
                      {day.toLowerCase()} · {period.toLowerCase()}
                    </Label>
                  </label>
                );
              }),
            )}
          </div>
          <Button type="submit" disabled={pending}>Save schedule</Button>
        </form>
      </CardContent>
    </Card>
  );
}
