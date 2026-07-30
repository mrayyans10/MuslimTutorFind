import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReportTutorForm } from "@/components/messaging/report-tutor-form";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ tutor?: string }>;
};

export default async function ReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tutorProfileId = params.tutor;
  const session = await auth();

  if (!tutorProfileId) {
    return (
      <div className="container-page py-16">
        <div className="surface-card mx-auto max-w-lg space-y-4 p-6 text-center">
          <h1 className="font-display text-2xl font-semibold">Report</h1>
          <p className="text-sm text-muted-foreground">
            Open a tutor profile and use Report, or manage reports from your safety settings.
          </p>
          <Button asChild variant="outline">
            <Link href="/find-tutors">Browse tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/report?tutor=${tutorProfileId}`)}`);
  }

  const tutor = await prisma.tutorProfile.findFirst({
    where: { id: tutorProfileId },
    select: {
      id: true,
      slug: true,
      user: { select: { displayName: true, legalName: true } },
    },
  });

  if (!tutor) {
    return (
      <div className="container-page py-16">
        <div className="surface-card mx-auto max-w-lg space-y-4 p-6 text-center">
          <h1 className="font-display text-2xl font-semibold">Tutor not found</h1>
          <Button asChild variant="outline">
            <Link href="/find-tutors">Back to search</Link>
          </Button>
        </div>
      </div>
    );
  }

  const name = tutor.user.displayName ?? tutor.user.legalName ?? "Tutor";

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/tutors/${tutor.slug}`} className="link-underline">
              Back to profile
            </Link>
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Report {name}</h1>
          <p className="mt-2 text-muted-foreground">
            Reports are reviewed by moderators. Include clear details. Do not share exact home
            addresses or a minor&apos;s private information.
          </p>
        </div>
        <ReportTutorForm tutorProfileId={tutor.id} tutorName={name} />
      </div>
    </div>
  );
}
