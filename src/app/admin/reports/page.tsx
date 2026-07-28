import { updateReportStatusAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const reports = await prisma.userReport.findMany({
    include: {
      reporter: { select: { displayName: true, email: true } },
      reported: { select: { displayName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">User reports</h2>
        <p className="text-sm text-muted-foreground">Review and resolve user reports.</p>
      </div>

      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">{report.reason}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {report.reporter.displayName} reported {report.reported.displayName}
              </p>
            </div>
            <Badge>{report.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.details ? <p className="text-sm">{report.details}</p> : null}
            {report.status === "OPEN" ? (
              <div className="flex gap-2">
                <form action={async () => { await updateReportStatusAction(report.id, "RESOLVED"); }}>
                  <Button type="submit" size="sm">Resolve</Button>
                </form>
                <form action={async () => { await updateReportStatusAction(report.id, "DISMISSED"); }}>
                  <Button type="submit" size="sm" variant="outline">Dismiss</Button>
                </form>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
