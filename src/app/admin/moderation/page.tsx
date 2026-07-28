import { updateModerationCaseAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata = { title: "Moderation" };

export default async function AdminModerationPage() {
  const cases = await prisma.moderationCase.findMany({
    include: {
      assignee: { select: { displayName: true } },
      report: {
        include: {
          reporter: { select: { displayName: true } },
          reported: { select: { displayName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Moderation cases</h2>
        <p className="text-sm text-muted-foreground">Track and resolve moderation workflows.</p>
      </div>

      {cases.length === 0 ? (
        <p className="text-sm text-muted-foreground">No moderation cases.</p>
      ) : (
        cases.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">{c.title}</CardTitle>
                {c.report ? (
                  <p className="text-sm text-muted-foreground">
                    {c.report.reporter.displayName} → {c.report.reported.displayName}
                  </p>
                ) : null}
              </div>
              <Badge>{c.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {c.internalNotes ? <p className="text-sm">{c.internalNotes}</p> : null}
              {c.status !== "RESOLVED" && c.status !== "CLOSED" ? (
                <form action={async () => { await updateModerationCaseAction(c.id, "RESOLVED", "Resolved by moderator"); }}>
                  <Button type="submit" size="sm">Mark resolved</Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
