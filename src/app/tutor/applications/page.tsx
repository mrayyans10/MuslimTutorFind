import { updateApplicationStatusAction } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Applications" };

export default async function TutorApplicationsPage() {
  const session = await requireSession();
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: session.user.id },
  });

  const applications = await prisma.tutorRequirementApplication.findMany({
    where: { tutorProfileId: tutorProfile?.id },
    include: {
      requirement: { include: { subject: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Your applications</h2>
        <p className="text-sm text-muted-foreground">Track applications you have submitted.</p>
      </div>

      {applications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet.</p>
      ) : (
        applications.map((app) => (
          <Card key={app.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">{app.requirement.subject.name}</CardTitle>
                <p className="text-sm text-muted-foreground">${String(app.proposedHourlyRate)}/hr</p>
              </div>
              <Badge>{app.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{app.introduction}</p>
              {app.status === "SUBMITTED" || app.status === "VIEWED" || app.status === "SHORTLISTED" ? (
                <form action={async () => { await updateApplicationStatusAction(app.id, "WITHDRAWN"); }}>
                  <Button type="submit" size="sm" variant="outline">Withdraw</Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
