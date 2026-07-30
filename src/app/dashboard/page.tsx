import Link from "next/link";
import { ClipboardList, FileText, MessageSquare, Search, Star } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRODUCT_NAME } from "@config/product";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();
  const userId = session.user.id;

  const [studentProfile, parentProfile, requirements, applications, conversations, matches] =
    await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.parentProfile.findUnique({ where: { userId } }),
      prisma.tutoringRequirement.count({
        where: {
          deletedAt: null,
          OR: [
            { studentProfile: { userId } },
            { parentProfile: { userId } },
          ],
        },
      }),
      prisma.tutorRequirementApplication.count({
        where: {
          requirement: {
            OR: [
              { studentProfile: { userId } },
              { parentProfile: { userId } },
            ],
          },
        },
      }),
      prisma.conversation.count({
        where: { participants: { some: { userId } } },
      }),
      prisma.tutorMatch.count({
        where: { questionnaire: { userId } },
      }),
    ]);

  const cards = [
    {
      title: "Requirements",
      value: requirements,
      description: "Tutoring requirements you've posted",
      href: "/dashboard/tutoring-requirements",
      icon: ClipboardList,
    },
    {
      title: "Applications",
      value: applications,
      description: "Applications from tutors",
      href: "/dashboard/applications",
      icon: FileText,
    },
    {
      title: "Messages",
      value: conversations,
      description: "Active conversations",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Matches",
      value: matches,
      description: "Tutor matches from questionnaire",
      href: "/dashboard/matches",
      icon: Star,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold">Welcome back</h2>
        <p className="text-muted-foreground">
          Your {PRODUCT_NAME} dashboard for finding secular academic tutoring.
        </p>
      </div>

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
                <CardDescription className="mt-1">{card.description}</CardDescription>
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
          <CardDescription>Get started with {PRODUCT_NAME}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/find-your-tutor">
              <Search className="mr-2 size-4" />
              Find your tutor
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/tutoring-requirements">Post a requirement</Link>
          </Button>
          {parentProfile ? (
            <Button variant="outline" asChild>
              <Link href="/dashboard/learners">Manage learners</Link>
            </Button>
          ) : null}
          {studentProfile ? (
            <Button variant="outline" asChild>
              <Link href="/dashboard/profile">Update profile</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
