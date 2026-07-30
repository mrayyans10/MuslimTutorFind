import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MessageTutorForm } from "@/components/messaging/message-tutor-form";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ tutor?: string }>;
};

export default async function NewMessagePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tutorProfileId = params.tutor;
  const session = await auth();

  if (!tutorProfileId) {
    return (
      <div className="container-page py-16">
        <div className="surface-card mx-auto max-w-lg space-y-4 p-6 text-center">
          <h1 className="font-display text-2xl font-semibold">Message a tutor</h1>
          <p className="text-sm text-muted-foreground">
            Choose a tutor from search or Find Your Tutor results first.
          </p>
          <Button asChild>
            <Link href="/find-tutors">Browse tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/messages/new?tutor=${tutorProfileId}`)}`);
  }

  const tutor = await prisma.tutorProfile.findFirst({
    where: { id: tutorProfileId, status: "APPROVED", deletedAt: null },
    select: {
      id: true,
      slug: true,
      headline: true,
      user: { select: { displayName: true, legalName: true, image: true } },
    },
  });

  if (!tutor) {
    return (
      <div className="container-page py-16">
        <div className="surface-card mx-auto max-w-lg space-y-4 p-6 text-center">
          <h1 className="font-display text-2xl font-semibold">Tutor unavailable</h1>
          <p className="text-sm text-muted-foreground">
            This tutor profile is not available for messaging.
          </p>
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
          <h1 className="mt-2 font-display text-3xl font-semibold">Message {name}</h1>
          <p className="mt-2 text-muted-foreground">
            Introduce yourself and share what subject help you need. Lesson timing and payment
            stay private between you — this platform does not book or charge lessons.
          </p>
        </div>
        <MessageTutorForm
          tutorProfileId={tutor.id}
          tutorName={name}
          headline={tutor.headline}
        />
      </div>
    </div>
  );
}
