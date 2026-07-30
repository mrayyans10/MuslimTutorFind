import type {
  DayOfWeek,
  LearnerLevel,
  TimePeriod,
  TutoringMode,
} from "@prisma/client";
import { Suspense } from "react";

import { searchTutors, getSubjectsCatalog, getCurricula } from "@/app/actions/tutors";
import { FindTutorsSearch } from "@/components/find-tutors/search";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FindTutorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(param(params.page) ?? "1") || 1;

  const filters = {
    q: param(params.q),
    subject: param(params.subject),
    topic: param(params.topic),
    level: param(params.level) as LearnerLevel | undefined,
    curriculum: param(params.curriculum),
    mode: param(params.mode) as TutoringMode | undefined,
    country: param(params.country),
    city: param(params.city),
    rateMin: param(params.rateMin) ? Number(param(params.rateMin)) : undefined,
    rateMax: param(params.rateMax) ? Number(param(params.rateMax)) : undefined,
    language: param(params.language),
    experience: param(params.experience) ? Number(param(params.experience)) : undefined,
    rating: param(params.rating) ? Number(param(params.rating)) : undefined,
    verified: param(params.verified) === "true",
    day: param(params.day) as DayOfWeek | undefined,
    period: param(params.period) as TimePeriod | undefined,
    page,
  };

  const [result, categories, curricula] = await Promise.all([
    searchTutors(filters),
    getSubjectsCatalog(),
    getCurricula(),
  ]);

  const subjects = categories.flatMap((cat) =>
    cat.subjects.map((s) => ({ value: s.slug, label: s.name })),
  );

  return (
    <Suspense fallback={<div className="container-page py-10">Loading search…</div>}>
      <FindTutorsSearch
        tutors={result.tutors}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        subjects={subjects}
        curricula={curricula.map((c) => ({ value: c.slug, label: c.name }))}
      />
    </Suspense>
  );
}
