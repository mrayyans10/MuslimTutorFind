import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireSession();
  if (!session.user.role || !roles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}

export async function getOptionalSession() {
  return auth();
}
