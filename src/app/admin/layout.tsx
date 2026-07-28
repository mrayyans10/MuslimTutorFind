import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["MODERATOR", "ADMINISTRATOR"]);
  const role = session.user.role!;

  if (role !== "MODERATOR" && role !== "ADMINISTRATOR") redirect("/dashboard");

  return (
    <DashboardShell area="admin" role={role}>
      {children}
    </DashboardShell>
  );
}
