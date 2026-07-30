import { updateRequirementAdminAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata = { title: "Requirements" };

export default async function AdminRequirementsPage() {
  const requirements = await prisma.tutoringRequirement.findMany({
    where: { deletedAt: null },
    include: {
      subject: { select: { name: true } },
      studentProfile: { include: { user: { select: { email: true } } } },
      parentProfile: { include: { user: { select: { email: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Tutoring requirements</h2>
        <p className="text-sm text-muted-foreground">Moderate posted requirements.</p>
      </div>

      {requirements.map((req) => (
        <Card key={req.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">{req.subject.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {req.studentProfile?.user.email ?? req.parentProfile?.user.email}
              </p>
            </div>
            <Badge>{req.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{req.description}</p>
            {req.status === "PUBLISHED" ? (
              <form action={async () => { await updateRequirementAdminAction(req.id, "REMOVED"); }}>
                <Button type="submit" size="sm" variant="outline">Remove</Button>
              </form>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
