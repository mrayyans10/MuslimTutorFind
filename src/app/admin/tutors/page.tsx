import {
  approveTutorAction,
  rejectTutorAction,
  requestTutorChangesAction,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata = { title: "Tutors" };

export default async function AdminTutorsPage() {
  const tutors = await prisma.tutorProfile.findMany({
    where: { deletedAt: null },
    include: {
      user: { select: { displayName: true, legalName: true, email: true } },
      subjects: { include: { subject: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Tutors</h2>
        <p className="text-sm text-muted-foreground">Approve, reject, or request changes.</p>
      </div>

      {tutors.map((tutor) => (
        <Card key={tutor.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">
                {tutor.user.displayName ?? tutor.user.legalName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{tutor.user.email}</p>
              {tutor.headline ? <p className="mt-1 text-sm">{tutor.headline}</p> : null}
            </div>
            <Badge>{tutor.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Subjects: {tutor.subjects.map((s) => s.subject.name).join(", ") || "None"}
            </p>
            {tutor.changeRequestNotes ? (
              <p className="text-sm text-amber-600">{tutor.changeRequestNotes}</p>
            ) : null}
            {tutor.rejectionReason ? (
              <p className="text-sm text-destructive">{tutor.rejectionReason}</p>
            ) : null}
            {["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(tutor.status) ? (
              <div className="flex flex-wrap gap-2">
                <form action={async () => { await approveTutorAction(tutor.id); }}>
                  <Button type="submit" size="sm">Approve</Button>
                </form>
                <form action={async () => { await rejectTutorAction(tutor.id, "Does not meet requirements"); }}>
                  <Button type="submit" size="sm" variant="outline">Reject</Button>
                </form>
                <form action={async () => { await requestTutorChangesAction(tutor.id, "Please update your profile"); }}>
                  <Button type="submit" size="sm" variant="outline">Request changes</Button>
                </form>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
