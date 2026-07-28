import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const role = session.user.role;

  if (role === "TUTOR") redirect("/tutor/dashboard");
  if (role === "MODERATOR" || role === "ADMINISTRATOR") redirect("/admin");
  if (role !== "STUDENT" && role !== "PARENT") redirect("/onboarding");

  return (
    <DashboardShell area="dashboard" role={role}>
      {children}
    </DashboardShell>
  );
}
