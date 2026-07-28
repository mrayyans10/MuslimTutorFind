import Link from "next/link";

import { getCurriculaForMatching, getSubjectsForMatching } from "@/app/actions/matching";
import { Questionnaire } from "@/components/find-your-tutor/questionnaire";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { Button } from "@/components/ui/button";

export default async function FindYourTutorPage() {
  const [subjects, curricula] = await Promise.all([
    getSubjectsForMatching(),
    getCurriculaForMatching(),
  ]);

  return (
    <>
      <section className="border-b border-border bg-secondary/30">
        <div className="container-page max-w-2xl py-10">
          <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Find your tutor
          </h1>
          <p className="mt-3 text-muted-foreground">
            Answer a few questions and we&apos;ll suggest tutors who fit your secular
            academic needs. Guests can complete the questionnaire; sign in only when
            you&apos;re ready to message someone.
          </p>
          <SecularNotice className="mt-6" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/find-tutors">Browse tutors instead</Link>
            </Button>
          </div>
        </div>
      </section>
      <Questionnaire subjects={subjects} curricula={curricula} />
    </>
  );
}
