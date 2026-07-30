import { updateApplicationAdminAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata = { title: "Applications" };

export default async function AdminApplicationsPage() {
  const applications = await prisma.tutorRequirementApplication.findMany({
    include: {
      requirement: { include: { subject: { select: { name: true } } } },
      tutorProfile: { include: { user: { select: { displayName: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Applications</h2>
        <p className="text-sm text-muted-foreground">Review tutor applications platform-wide.</p>
      </div>

      {applications.map((app) => (
        <Card key={app.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">
                {app.tutorProfile.user.displayName} → {app.requirement.subject.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{app.tutorProfile.user.email}</p>
            </div>
            <Badge>{app.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{app.introduction}</p>
            <form action={async () => { await updateApplicationAdminAction(app.id, "DECLINED"); }}>
              <Button type="submit" size="sm" variant="outline">Mark declined</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
