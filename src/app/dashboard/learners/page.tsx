import { redirect } from "next/navigation";

import { LearnersClient } from "./learners-client";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Learners" };

export default async function LearnersPage() {
  const session = await requireSession();
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const parent = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      children: { include: { child: true } },
    },
  });

  const children =
    parent?.children
      .map((r) => r.child)
      .filter((c) => !c.deletedAt) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Learner profiles</h2>
        <p className="text-sm text-muted-foreground">
          Manage child profiles for tutoring requirements and messaging.
        </p>
      </div>
      <LearnersClient learners={children} />
    </div>
  );
}
