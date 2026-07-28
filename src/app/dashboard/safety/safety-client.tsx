"use client";

import * as React from "react";
import { useActionState, useTransition } from "react";

import {
  blockUserAction,
  reportUserAction,
  unblockUserAction,
  type ActionState,
} from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Report = {
  id: string;
  reason: string;
  status: string;
  createdAt: Date;
  reported: { displayName: string | null; legalName: string | null };
};

type Block = {
  id: string;
  blocked: { id: string; displayName: string | null; legalName: string | null };
  createdAt: Date;
};

const initialState: ActionState = {};

function BlockUserForm() {
  const [pending, startTransition] = useTransition();
  const [userId, setUserId] = React.useState("");

  return (
    <div className="flex gap-2">
      <Input
        placeholder="User ID to block"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <Button
        type="button"
        disabled={pending || !userId}
        onClick={() => startTransition(() => { void blockUserAction(userId); })}
      >
        Block
      </Button>
    </div>
  );
}

export function SafetyClient({
  reports,
  blocks,
}: {
  reports: Report[];
  blocks: Block[];
}) {
  const [state, formAction, pending] = useActionState(reportUserAction, initialState);
  const [unblockPending, startUnblock] = useTransition();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report a user</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.message ? (
              <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="reportedId">User ID to report</Label>
              <Input id="reportedId" name="reportedId" required placeholder="User ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" name="reason" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea id="details" name="details" rows={3} />
            </div>
            <Button type="submit" disabled={pending}>
              Submit report
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Block a user</CardTitle>
        </CardHeader>
        <CardContent>
          <BlockUserForm />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium">Your reports ({reports.length})</h3>
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-sm">
                  {report.reported.displayName ?? report.reported.legalName}
                </p>
                <p className="text-sm text-muted-foreground">{report.reason}</p>
              </div>
              <Badge>{report.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Blocked users ({blocks.length})</h3>
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blocked users.</p>
        ) : (
          blocks.map((block) => (
            <Card key={block.id}>
              <CardContent className="flex items-center justify-between py-4">
                <p className="text-sm">
                  {block.blocked.displayName ?? block.blocked.legalName}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={unblockPending}
                  onClick={() => startUnblock(() => { void unblockUserAction(block.blocked.id); })}
                >
                  Unblock
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
