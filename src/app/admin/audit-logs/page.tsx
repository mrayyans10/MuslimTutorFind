import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Audit logs" };

export default async function AdminAuditLogsPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMINISTRATOR") redirect("/admin");

  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { displayName: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Audit logs</h2>
        <p className="text-sm text-muted-foreground">Administrative action history.</p>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{log.action}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              <p className="text-xs text-muted-foreground">
                {log.actor?.displayName ?? log.actor?.email ?? "System"}
                {log.targetType ? ` · ${log.targetType}` : ""}
                {log.targetId ? ` · ${log.targetId}` : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
