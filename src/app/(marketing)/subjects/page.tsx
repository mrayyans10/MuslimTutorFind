import Link from "next/link";
import { BookOpen } from "lucide-react";

import { getSubjectsCatalog } from "@/app/actions/tutors";
import { SecularNotice } from "@/components/marketing/secular-notice";

export default async function SubjectsPage() {
  const categories = await getSubjectsCatalog();

  return (
    <div className="container-page py-10">
      <div className="mb-8 max-w-2xl space-y-3">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Subjects</h1>
        <p className="text-muted-foreground">
          Browse secular academic subjects available on Community Tutors. Religious
          instruction is not permitted on this platform.
        </p>
      </div>
      <SecularNotice className="mb-10" />

      {categories.length > 0 ? (
        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-4 font-display text-2xl font-semibold text-primary">
                {category.name}
              </h2>
              {category.description ? (
                <p className="mb-4 text-sm text-muted-foreground">
                  {category.description}
                </p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.slug}`}
                    className="surface-card flex items-start gap-3 p-4 transition-shadow hover:shadow-md"
                  >
                    <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{subject.name}</p>
                      {subject.specializations.length > 0 ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {subject.specializations.length} specializations
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="surface-muted px-6 py-12 text-center text-muted-foreground">
          Subject catalogue will appear here once configured.
        </div>
      )}
    </div>
  );
}
