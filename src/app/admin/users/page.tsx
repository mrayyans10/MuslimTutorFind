import { redirect } from "next/navigation";

import { suspendUserAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMINISTRATOR") redirect("/admin");

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      displayName: true,
      legalName: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">Manage platform users.</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {user.displayName ?? user.legalName ?? user.email}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{user.role ?? "—"}</Badge>
                <Badge variant="secondary">{user.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleDateString()} · ID: {user.id}
              </p>
              {user.status === "ACTIVE" ? (
                <form action={async () => { await suspendUserAction(user.id, "Admin action"); }}>
                  <Button type="submit" size="sm" variant="outline">Suspend</Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
