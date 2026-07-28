import { updateApplicationStatusAction } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Applications" };

export default async function ApplicationsPage() {
  const session = await requireSession();

  const applications = await prisma.tutorRequirementApplication.findMany({
    where: {
      requirement: {
        OR: [
          { studentProfile: { userId: session.user.id } },
          { parentProfile: { userId: session.user.id } },
        ],
      },
    },
    include: {
      requirement: { include: { subject: { select: { name: true } } } },
      tutorProfile: {
        include: {
          user: { select: { displayName: true, legalName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Applications received</h2>
        <p className="text-sm text-muted-foreground">
          Review tutor applications to your requirements.
        </p>
      </div>

      {applications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet.</p>
      ) : (
        applications.map((app) => (
          <Card key={app.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {app.tutorProfile.user.displayName ?? app.tutorProfile.user.legalName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {app.requirement.subject.name} · ${String(app.proposedHourlyRate)}/hr
                </p>
              </div>
              <Badge>{app.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{app.introduction}</p>
              {app.status === "SUBMITTED" || app.status === "VIEWED" ? (
                <div className="flex flex-wrap gap-2">
                  <form action={async () => { await updateApplicationStatusAction(app.id, "SHORTLISTED"); }}>
                    <Button type="submit" size="sm" variant="outline">
                      Shortlist
                    </Button>
                  </form>
                  <form action={async () => { await updateApplicationStatusAction(app.id, "ACCEPTED"); }}>
                    <Button type="submit" size="sm">
                      Accept
                    </Button>
                  </form>
                  <form action={async () => { await updateApplicationStatusAction(app.id, "DECLINED"); }}>
                    <Button type="submit" size="sm" variant="outline">
                      Decline
                    </Button>
                  </form>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
