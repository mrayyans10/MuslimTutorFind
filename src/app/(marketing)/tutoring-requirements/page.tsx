import Link from "next/link";

import { getPublishedRequirements } from "@/app/actions/tutors";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLearnerLevel } from "@/lib/tutors/mappers";

export default async function TutoringRequirementsPage() {
  const requirements = await getPublishedRequirements();

  return (
    <div className="container-page py-10">
      <div className="mb-8 max-w-2xl space-y-3">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Tutoring requirements
        </h1>
        <p className="text-muted-foreground">
          Families have posted these secular academic tutoring needs. Private contact
          details are never shown publicly.
        </p>
      </div>

      <SecularNotice className="mb-8" />

      {requirements.length > 0 ? (
        <div className="space-y-4">
          {requirements.map((req) => (
            <article key={req.id} className="surface-card p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{req.subject.name}</Badge>
                <Badge variant="outline">{formatLearnerLevel(req.learnerLevel)}</Badge>
                <Badge variant="muted">{req.mode.replace("_", " ").toLowerCase()}</Badge>
              </div>
              <h2 className="font-display text-lg font-semibold">
                {req.whoNeedsHelp}
                {req.topic ? ` · ${req.topic}` : ""}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {req.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {req.city || req.country ? (
                  <span>
                    {[req.city, req.country].filter(Boolean).join(", ")}
                  </span>
                ) : null}
                {req.whenNeeded ? (
                  <span>Needed: {req.whenNeeded.replace("_", " ").toLowerCase()}</span>
                ) : null}
                {req.budgetMin || req.budgetMax ? (
                  <span>
                    Budget: {req.budgetMin ? `$${req.budgetMin}` : "—"} –{" "}
                    {req.budgetMax ? `$${req.budgetMax}` : "—"} {req.currency}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface-muted px-6 py-12 text-center">
          <p className="text-muted-foreground">
            No published requirements yet. Check back soon or post your own from your
            dashboard.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/sign-up">Create an account</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
