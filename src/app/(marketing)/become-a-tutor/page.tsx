import Link from "next/link";

import { PRODUCT_NAME } from "@config/product";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { Button } from "@/components/ui/button";
import { ContentPage } from "@/components/marketing/content-page";

export default function BecomeATutorPage() {
  return (
    <ContentPage
      title="Become a tutor"
      intro={`Share your academic expertise with Muslim communities through ${PRODUCT_NAME}. We welcome tutors who teach secular subjects only.`}
    >
      <h2 className="font-display text-xl font-semibold">Who can apply</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
        <li>Community members with demonstrated academic expertise</li>
        <li>Tutors committed to secular subjects — no religious instruction</li>
        <li>Individuals willing to complete profile review before going live</li>
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold">Application steps</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
        <li>Sign up and select the tutor role</li>
        <li>Complete your profile: subjects, rates, availability, and location</li>
        <li>Confirm community eligibility and secular-subjects policy</li>
        <li>Submit for admin approval</li>
        <li>Once approved, families can find and message you</li>
      </ol>

      <SecularNotice className="mt-8" />

      <Button className="mt-8" asChild>
        <Link href="/sign-up?role=TUTOR">Start tutor registration</Link>
      </Button>
    </ContentPage>
  );
}
