import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["MODERATOR", "ADMINISTRATOR"]);
  const role = session.user.role!;

  return (
    <DashboardShell area="admin" role={role} userName={session.user.name}>
      {children}
    </DashboardShell>
  );
}
