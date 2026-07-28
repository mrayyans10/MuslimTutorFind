import Link from "next/link";
import { ClipboardList, FileText, MessageSquare, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRODUCT_NAME } from "@config/product";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Tutor dashboard" };

export default async function TutorDashboardPage() {
  const session = await requireSession();
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      subjects: { select: { id: true } },
      verification: { select: { status: true } },
    },
  });

  const [applications, conversations, reviews] = await Promise.all([
    prisma.tutorRequirementApplication.count({
      where: { tutorProfileId: tutorProfile?.id },
    }),
    prisma.conversation.count({
      where: { participants: { some: { userId: session.user.id } } },
    }),
    prisma.review.count({
      where: { tutorProfileId: tutorProfile?.id, removedAt: null },
    }),
  ]);

  const cards = [
    { title: "Applications", value: applications, href: "/tutor/applications", icon: FileText },
    { title: "Messages", value: conversations, href: "/tutor/messages", icon: MessageSquare },
    { title: "Reviews", value: reviews, href: "/tutor/reviews", icon: Star },
    { title: "Subjects", value: tutorProfile?.subjects.length ?? 0, href: "/tutor/subjects", icon: ClipboardList },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold">Tutor dashboard</h2>
        <p className="text-muted-foreground">
          Manage your {PRODUCT_NAME} tutor profile and applications.
        </p>
      </div>

      {tutorProfile ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge>{tutorProfile.status}</Badge>
            {tutorProfile.verification ? (
              <Badge variant="secondary">Verification: {tutorProfile.verification.status}</Badge>
            ) : null}
            {tutorProfile.status === "DRAFT" || tutorProfile.status === "CHANGES_REQUESTED" ? (
              <Button asChild size="sm">
                <Link href="/tutor/profile">Complete profile</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.href}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
                <Button variant="link" className="mt-2 h-auto p-0" asChild>
                  <Link href={card.href}>View</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Keep your tutor profile up to date</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild><Link href="/tutor/profile">Edit profile</Link></Button>
          <Button asChild variant="outline"><Link href="/tutor/subjects">Manage subjects</Link></Button>
          <Button asChild variant="outline"><Link href="/tutor/tutoring-requirements">Browse requirements</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
