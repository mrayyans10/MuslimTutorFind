import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["TUTOR"]);

  return (
    <DashboardShell area="tutor" role={session.user.role!}>
      {children}
    </DashboardShell>
  );
}
