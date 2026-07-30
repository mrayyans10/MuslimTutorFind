import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  MapPin,
  Monitor,
  Star,
} from "lucide-react";

import { getTutorBySlug } from "@/app/actions/tutors";
import { PRODUCT_NAME, SECULAR_SUBJECTS_NOTICE } from "@config/product";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { TutorProfileActions } from "@/components/tutors/tutor-profile-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  formatDayOfWeek,
  formatLearnerLevel,
  formatTeachingStyle,
  formatTimePeriod,
} from "@/lib/tutors/mappers";
import { auth } from "@/lib/auth";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutor = await getTutorBySlug(slug);
  if (!tutor) return { title: "Tutor not found" };
  const name = tutor.user.displayName ?? tutor.user.legalName ?? "Tutor";
  return {
    title: `${name} — Tutor profile`,
    description: tutor.headline ?? `Secular academic tutor on ${PRODUCT_NAME}`,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function TutorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const tutor = await getTutorBySlug(slug);
  if (!tutor) notFound();
  const session = await auth();

  const displayName = tutor.user.displayName ?? tutor.user.legalName ?? "Tutor";
  const locationParts = [
    tutor.location?.city,
    tutor.location?.region,
    tutor.location?.country,
  ].filter(Boolean);

  return (
    <div className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="surface-card p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row">
              <Avatar className="size-24">
                <AvatarImage src={tutor.user.image ?? undefined} alt={displayName} />
                <AvatarFallback className="text-xl">
                  {initials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-semibold text-foreground">
                    {displayName}
                  </h1>
                  {tutor.isVerified ? (
                    <Badge variant="accent" className="gap-1">
                      <BadgeCheck className="size-3" />
                      Verified
                    </Badge>
                  ) : null}
                </div>
                <p className="text-lg text-muted-foreground">
                  {tutor.headline ?? "Academic tutor"}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-amber text-amber" />
                    {tutor.averageRating.toFixed(1)} ({tutor.reviewCount} reviews)
                  </span>
                  <span>{tutor.yearsExperience} years experience</span>
                  {locationParts.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4 text-primary" />
                      {locationParts.join(", ")}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <TutorProfileActions
                tutorProfileId={tutor.id}
                signedIn={Boolean(session?.user?.id)}
              />
            </div>
          </section>

          <SecularNotice />

          {tutor.biography ? (
            <section className="surface-card p-6">
              <h2 className="mb-3 font-display text-xl font-semibold">About</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {tutor.biography}
              </p>
            </section>
          ) : null}

          {tutor.teachingApproach ? (
            <section className="surface-card p-6">
              <h2 className="mb-3 font-display text-xl font-semibold">
                Teaching approach
              </h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {tutor.teachingApproach}
              </p>
            </section>
          ) : null}

          <section className="surface-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">Subjects & rates</h2>
            <div className="space-y-4">
              {tutor.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {subject.subject.name}
                        {subject.specialization ? ` · ${subject.specialization.name}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatLearnerLevel(subject.minLevel)} –{" "}
                        {formatLearnerLevel(subject.maxLevel)}
                        {subject.curriculum ? ` · ${subject.curriculum.name}` : ""}
                      </p>
                    </div>
                    <p className="font-display text-lg font-semibold text-primary">
                      {formatCurrency(Number(subject.hourlyRate), subject.currency)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        /hr
                      </span>
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {subject.onlineAvailable ? <Badge variant="secondary">Online</Badge> : null}
                    {subject.inPersonAvailable ? (
                      <Badge variant="secondary">In-person</Badge>
                    ) : null}
                    {subject.homeworkGuidance ? (
                      <Badge variant="muted">Homework</Badge>
                    ) : null}
                    {subject.examPreparation ? (
                      <Badge variant="muted">Exam prep</Badge>
                    ) : null}
                    {subject.projectGuidance ? (
                      <Badge variant="muted">Projects</Badge>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {tutor.qualifications.length > 0 ? (
            <section className="surface-card p-6">
              <h2 className="mb-4 font-display text-xl font-semibold">Qualifications</h2>
              <ul className="space-y-3">
                {tutor.qualifications.map((q) => (
                  <li key={q.id} className="text-sm">
                    <p className="font-medium">{q.title}</p>
                    {q.institution ? (
                      <p className="text-muted-foreground">{q.institution}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {tutor.certifications.length > 0 ? (
            <section className="surface-card p-6">
              <h2 className="mb-4 font-display text-xl font-semibold">Certifications</h2>
              <ul className="space-y-2 text-sm">
                {tutor.certifications.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium">{c.name}</span>
                    {c.issuer ? (
                      <span className="text-muted-foreground"> · {c.issuer}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {tutor.reviews.length > 0 ? (
            <section className="surface-card p-6">
              <h2 className="mb-4 font-display text-xl font-semibold">Recent reviews</h2>
              <div className="space-y-4">
                {tutor.reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-0">
                    <div className="mb-1 flex items-center gap-2 text-sm">
                      <Star className="size-4 fill-amber text-amber" />
                      <span className="font-medium">{review.overallRating}/5</span>
                      <span className="text-muted-foreground">
                        · {review.author.displayName ?? "Student"}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {review.writtenReview}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold">At a glance</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {tutor.currentOccupation ? (
                <div>
                  <p className="font-medium">Occupation</p>
                  <p className="text-muted-foreground">{tutor.currentOccupation}</p>
                </div>
              ) : null}
              {tutor.educationSummary ? (
                <div>
                  <p className="font-medium">Education</p>
                  <p className="text-muted-foreground">{tutor.educationSummary}</p>
                </div>
              ) : null}
              {tutor.teachingStyles.length > 0 ? (
                <div>
                  <p className="mb-2 font-medium">Teaching styles</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.teachingStyles.map((style) => (
                      <Badge key={style} variant="secondary">
                        {formatTeachingStyle(style)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {tutor.languages.length > 0 ? (
                <div>
                  <p className="mb-2 font-medium">Languages</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {tutor.languages.map((lang) => (
                      <li key={lang.id}>
                        {lang.language} ({lang.proficiency})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {tutor.location ? (
                <div>
                  <p className="mb-2 font-medium">Tutoring modes</p>
                  <div className="space-y-1 text-muted-foreground">
                    {tutor.location.onlineAvailable ? (
                      <p className="flex items-center gap-2">
                        <Monitor className="size-4 text-primary" />
                        Online available
                      </p>
                    ) : null}
                    {tutor.location.inPersonAvailable ? (
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />
                        In-person available
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {tutor.availability.length > 0 ? (
                <div>
                  <p className="mb-2 font-medium">General availability</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {tutor.availability.map((slot) => (
                      <li key={slot.id}>
                        {formatDayOfWeek(slot.dayOfWeek)} ·{" "}
                        {formatTimePeriod(slot.period)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <Separator />
              <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <BookOpen className="mt-0.5 size-4 shrink-0" />
                {SECULAR_SUBJECTS_NOTICE}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
