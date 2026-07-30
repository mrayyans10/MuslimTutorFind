import Link from "next/link";
import { FileText, Flag, Gavel, User, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRODUCT_NAME } from "@config/product";
import { prisma } from "@/lib/db";

export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const [users, tutors, reports, openCases, pendingTutors, flaggedMessages] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.tutorProfile.count({ where: { deletedAt: null } }),
    prisma.userReport.count({ where: { status: "OPEN" } }),
    prisma.moderationCase.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.tutorProfile.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.message.count({ where: { flagged: true, deletedAt: null } }),
  ]);

  const stats = [
    { label: "Users", value: users, href: "/admin/users", icon: Users },
    { label: "Tutors", value: tutors, href: "/admin/tutors", icon: User },
    { label: "Open reports", value: reports, href: "/admin/reports", icon: Flag },
    { label: "Moderation cases", value: openCases, href: "/admin/moderation", icon: Gavel },
    { label: "Pending tutors", value: pendingTutors, href: "/admin/tutors", icon: FileText },
    { label: "Flagged messages", value: flaggedMessages, href: "/admin/messages", icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold">{PRODUCT_NAME} admin</h2>
        <p className="text-muted-foreground">Platform overview and moderation tools.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
                <Button variant="link" className="mt-2 h-auto p-0" asChild>
                  <Link href={stat.href}>View</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
