import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Circle,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { SubmitForApprovalButton } from "@/components/tutors/submit-for-approval-button";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    key: "profile",
    title: "Professional profile",
    href: "/tutor/profile",
    icon: User,
    description: "Headline, biography, teaching approach, and community eligibility.",
  },
  {
    key: "subjects",
    title: "Academic subjects",
    href: "/tutor/subjects",
    icon: BookOpen,
    description: "Add secular subjects, levels, curricula, and hourly rates.",
  },
  {
    key: "schedule",
    title: "General schedule",
    href: "/tutor/schedule",
    icon: Calendar,
    description: "Describe preferred days and times (not a booking calendar).",
  },
  {
    key: "location",
    title: "Location & modes",
    href: "/tutor/location",
    icon: MapPin,
    description: "Online and/or in-person options with approximate area only.",
  },
  {
    key: "verification",
    title: "Verification documents",
    href: "/tutor/verification",
    icon: BadgeCheck,
    description: "Upload ID and credentials for administrator review.",
  },
] as const;

export default async function TutorSetupPage() {
  const session = await requireRole(["TUTOR"]);
  const profile = await prisma.tutorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      subjects: { select: { id: true } },
      availability: { select: { id: true } },
      location: true,
      verification: { select: { status: true, documents: { select: { id: true } } } },
    },
  });

  if (!profile) {
    return (
      <div className="surface-card p-6">
        <p>Tutor profile not found. Complete onboarding first.</p>
      </div>
    );
  }

  const completion = {
    profile: Boolean(
      profile.headline &&
        profile.biography &&
        profile.teachingApproach &&
        profile.communityAttested &&
        profile.secularSubjectsOnly &&
        profile.conductAgreed &&
        profile.noReligiousInstruction,
    ),
    subjects: profile.subjects.length > 0,
    schedule: profile.availability.length > 0,
    location: Boolean(profile.location),
    verification: (profile.verification?.documents.length ?? 0) > 0,
  };

  const doneCount = Object.values(completion).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Tutor setup</h2>
          <p className="text-sm text-muted-foreground">
            Complete each step, then submit for administrator approval. Secular academic
            subjects only.
          </p>
        </div>
        <Badge>{profile.status}</Badge>
      </div>

      <SecularNotice />

      <Card>
        <CardHeader>
          <CardTitle>
            Progress · {doneCount}/{steps.length} sections ready
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step) => {
            const done = completion[step.key];
            const Icon = step.icon;
            return (
              <Link
                key={step.key}
                href={step.href}
                className="flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/40"
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                ) : (
                  <Circle className="mt-0.5 size-5 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <p className="font-medium">{step.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
                <ArrowRight className="mt-1 size-4 text-muted-foreground" />
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit for approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When your profile looks ready, submit it for review. You can keep editing until an
            administrator approves it. Unapproved tutors do not appear in search or matching.
          </p>
          {profile.changeRequestNotes ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Changes requested: {profile.changeRequestNotes}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <SubmitForApprovalButton />
            <Button variant="outline" asChild>
              <Link href="/tutor/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
