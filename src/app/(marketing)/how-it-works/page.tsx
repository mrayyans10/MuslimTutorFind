import Link from "next/link";

import { PRODUCT_NAME } from "@config/product";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { ContentPage } from "@/components/marketing/content-page";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <ContentPage
      title="How it works"
      intro={`${PRODUCT_NAME} connects Muslim families with tutors for secular academic subjects — without booking widgets, trials, or religious instruction.`}
    >
      <ol className="list-decimal space-y-4 pl-5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Create an account</strong> as a student,
          parent, or tutor. Tutors complete a secular-subjects-only profile for
          community review.
        </li>
        <li>
          <strong className="text-foreground">Search or use the guided questionnaire</strong>{" "}
          to find tutors by subject, level, location, and preferences.
        </li>
        <li>
          <strong className="text-foreground">Message directly</strong> to discuss goals,
          availability, and fit. Families may also post tutoring requirements for tutors
          to apply.
        </li>
        <li>
          <strong className="text-foreground">Arrange tutoring offline</strong> — payment
          and scheduling happen between families and tutors, not through this platform.
        </li>
      </ol>
      <SecularNotice className="mt-8" />
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/find-your-tutor">Find your tutor</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/become-a-tutor">Become a tutor</Link>
        </Button>
      </div>
    </ContentPage>
  );
}
