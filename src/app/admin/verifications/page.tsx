import { updateVerificationStatusAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata = { title: "Verifications" };

export default async function AdminVerificationsPage() {
  const verifications = await prisma.tutorVerification.findMany({
    include: {
      tutorProfile: {
        include: { user: { select: { displayName: true, legalName: true, email: true } } },
      },
      documents: { where: { deletedAt: null } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Verifications</h2>
        <p className="text-sm text-muted-foreground">Review tutor identity documents.</p>
      </div>

      {verifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No verification submissions.</p>
      ) : (
        verifications.map((v) => (
          <Card key={v.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {v.tutorProfile.user.displayName ?? v.tutorProfile.user.legalName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{v.tutorProfile.user.email}</p>
              </div>
              <Badge>{v.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{v.documents.length} document(s) uploaded</p>
              {["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(v.status) ? (
                <div className="flex flex-wrap gap-2">
                  <form action={async () => { await updateVerificationStatusAction(v.tutorProfileId, "VERIFIED"); }}>
                    <Button type="submit" size="sm">Verify</Button>
                  </form>
                  <form action={async () => { await updateVerificationStatusAction(v.tutorProfileId, "REJECTED", undefined, "Documents insufficient"); }}>
                    <Button type="submit" size="sm" variant="outline">Reject</Button>
                  </form>
                  <form action={async () => { await updateVerificationStatusAction(v.tutorProfileId, "CHANGES_REQUESTED", "Please resubmit clearer documents"); }}>
                    <Button type="submit" size="sm" variant="outline">Request changes</Button>
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
