"use client";

import * as React from "react";
import Link from "next/link";
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
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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

export type ContactOption = {
  id: string;
  label: string;
  role?: string | null;
};

const initialState: ActionState = {};

export function SafetyClient({
  reports,
  blocks,
  contacts,
}: {
  reports: Report[];
  blocks: Block[];
  contacts: ContactOption[];
}) {
  const [state, formAction, pending] = useActionState(reportUserAction, initialState);
  const [unblockPending, startUnblock] = useTransition();
  const [blockState, setBlockState] = React.useState<ActionState>({});
  const [blockPending, startBlock] = useTransition();
  const [blockUserId, setBlockUserId] = React.useState(contacts[0]?.id ?? "");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report a user</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.message ? (
              <p className={state.success ? "text-sm text-green-700" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="reportedId">Person to report</Label>
              {contacts.length > 0 ? (
                <Select id="reportedId" name="reportedId" required defaultValue="">
                  <option value="" disabled>
                    Select from people you have messaged
                  </option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                      {c.role ? ` (${c.role.toLowerCase()})` : ""}
                    </option>
                  ))}
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Message someone first, or use Report on a tutor profile.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select id="reason" name="reason" required defaultValue="">
                <option value="" disabled>
                  Select a reason
                </option>
                <option value="Inappropriate communication">Inappropriate communication</option>
                <option value="Religious instruction offered">Religious instruction offered</option>
                <option value="False qualifications">False qualifications</option>
                <option value="Spam or scam">Spam or scam</option>
                <option value="Harassment">Harassment</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea id="details" name="details" rows={3} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending || contacts.length === 0}>
                Submit report
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/find-tutors">Report from tutor profiles</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Block a user</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {blockState.message ? (
            <p className={blockState.success ? "text-sm text-green-700" : "text-sm text-destructive"}>
              {blockState.message}
            </p>
          ) : null}
          {contacts.length > 0 ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={blockUserId}
                onChange={(e) => setBlockUserId(e.target.value)}
                aria-label="Person to block"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                disabled={blockPending || !blockUserId}
                onClick={() =>
                  startBlock(async () => {
                    const result = await blockUserAction(blockUserId);
                    setBlockState(result);
                  })
                }
              >
                Block
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent contacts yet. You can also block from a tutor profile after messaging.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium">Your reports ({reports.length})</h3>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports submitted yet.</p>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium">
                    {report.reported.displayName ?? report.reported.legalName}
                  </p>
                  <p className="text-sm text-muted-foreground">{report.reason}</p>
                </div>
                <Badge>{report.status}</Badge>
              </CardContent>
            </Card>
          ))
        )}
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
                  onClick={() =>
                    startUnblock(() => {
                      void unblockUserAction(block.blocked.id);
                    })
                  }
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
