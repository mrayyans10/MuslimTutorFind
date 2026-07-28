import Link from "next/link";
import { notFound } from "next/navigation";

import { getSubjectBySlug } from "@/app/actions/tutors";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SubjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  return (
    <div className="container-page py-10">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/subjects" className="link-underline">
          Subjects
        </Link>
        <span className="mx-2">/</span>
        <span>{subject.category.name}</span>
      </div>

      <div className="mb-8 max-w-2xl space-y-4">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {subject.name}
        </h1>
        {subject.description ? (
          <p className="text-muted-foreground">{subject.description}</p>
        ) : (
          <p className="text-muted-foreground">
            Find approved tutors who teach {subject.name} — secular academic tutoring
            only.
          </p>
        )}
      </div>

      <SecularNotice className="mb-8" />

      {subject.specializations.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl font-semibold">Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {subject.specializations.map((spec) => (
              <Badge key={spec.id} variant="secondary">
                {spec.name}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {subject.curricula.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl font-semibold">Curricula</h2>
          <div className="flex flex-wrap gap-2">
            {subject.curricula.map((curriculum) => (
              <Badge key={curriculum.id} variant="outline">
                {curriculum.name}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/find-tutors?subject=${subject.slug}`}>
            Find {subject.name} tutors
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/find-your-tutor">Guided search</Link>
        </Button>
      </div>
    </div>
  );
}
