"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { TutorCard } from "@/components/tutors/tutor-card";
import type { TutorCardData } from "@/components/tutors/tutor-card";

type FilterOption = { value: string; label: string };

type FindTutorsSearchProps = {
  tutors: TutorCardData[];
  total: number;
  page: number;
  totalPages: number;
  subjects: FilterOption[];
  curricula: FilterOption[];
};

const levels = [
  { value: "ELEMENTARY", label: "Elementary" },
  { value: "MIDDLE_SCHOOL", label: "Middle school" },
  { value: "HIGH_SCHOOL", label: "High school" },
  { value: "COLLEGE", label: "College" },
  { value: "ADULT", label: "Adult" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
].map((d) => ({
  value: d,
  label: d.charAt(0) + d.slice(1).toLowerCase(),
}));

const periods = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
];

export function FindTutorsSearch({
  tutors,
  total,
  page,
  totalPages,
  subjects,
  curricula,
}: FindTutorsSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const updateParams = useCallback(
    (form: HTMLFormElement) => {
      const data = new FormData(form);
      const params = new URLSearchParams();
      for (const [key, value] of data.entries()) {
        if (typeof value === "string" && value.trim()) {
          params.set(key, value.trim());
        }
      }
      if (data.get("verified") === "on") params.set("verified", "true");
      else params.delete("verified");
      params.delete("page");
      startTransition(() => {
        router.push(`/find-tutors?${params.toString()}`);
      });
    },
    [router],
  );

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    startTransition(() => {
      router.push(`/find-tutors?${params.toString()}`);
    });
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8 space-y-3">
        <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
          Find tutors
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Search approved tutors by subject, location, schedule, and more. All
          listings are secular academic subjects only.
        </p>
      </div>

      <SecularNotice className="mb-8" />

      <form
        className="surface-card mb-8 grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          updateParams(e.currentTarget);
        }}
      >
        <div className="space-y-2 lg:col-span-3">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            name="q"
            placeholder="Name, headline, or keywords"
            defaultValue={searchParams.get("q") ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select id="subject" name="subject" defaultValue={searchParams.get("subject") ?? ""}>
            <option value="">Any subject</option>
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            name="topic"
            placeholder="e.g. calculus, essay writing"
            defaultValue={searchParams.get("topic") ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select id="level" name="level" defaultValue={searchParams.get("level") ?? ""}>
            <option value="">Any level</option>
            {levels.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="curriculum">Curriculum</Label>
          <Select id="curriculum" name="curriculum" defaultValue={searchParams.get("curriculum") ?? ""}>
            <option value="">Any curriculum</option>
            {curricula.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode">Online / in-person</Label>
          <Select id="mode" name="mode" defaultValue={searchParams.get("mode") ?? ""}>
            <option value="">Any mode</option>
            <option value="ONLINE">Online</option>
            <option value="IN_PERSON">In-person</option>
            <option value="EITHER">Either</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            defaultValue={searchParams.get("country") ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={searchParams.get("city") ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rateMin">Min rate ($/hr)</Label>
          <Input
            id="rateMin"
            name="rateMin"
            type="number"
            min={0}
            defaultValue={searchParams.get("rateMin") ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rateMax">Max rate ($/hr)</Label>
          <Input
            id="rateMax"
            name="rateMax"
            type="number"
            min={0}
            defaultValue={searchParams.get("rateMax") ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            name="language"
            placeholder="e.g. English, Arabic, Urdu"
            defaultValue={searchParams.get("language") ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Min experience (years)</Label>
          <Input
            id="experience"
            name="experience"
            type="number"
            min={0}
            defaultValue={searchParams.get("experience") ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Min rating</Label>
          <Select id="rating" name="rating" defaultValue={searchParams.get("rating") ?? ""}>
            <option value="">Any rating</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="day">Schedule day</Label>
          <Select id="day" name="day" defaultValue={searchParams.get("day") ?? ""}>
            <option value="">Any day</option>
            {days.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Schedule period</Label>
          <Select id="period" name="period" defaultValue={searchParams.get("period") ?? ""}>
            <option value="">Any period</option>
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <input
            type="checkbox"
            id="verified"
            name="verified"
            className="size-4 rounded border border-primary"
            defaultChecked={searchParams.get("verified") === "true"}
          />
          <Label htmlFor="verified" className="cursor-pointer">
            Verified tutors only
          </Label>
        </div>

        <div className="flex items-end gap-2 lg:col-span-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Searching…" : "Search tutors"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/find-tutors">Clear</Link>
          </Button>
        </div>
      </form>

      <p className="mb-6 text-sm text-muted-foreground">
        {total} tutor{total === 1 ? "" : "s"} found
        {pending ? " (updating…)" : ""}
      </p>

      {tutors.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      ) : (
        <div className="surface-muted px-6 py-12 text-center">
          <p className="text-muted-foreground">
            No tutors match your filters yet. Try broadening your search or use our
            guided questionnaire.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/find-your-tutor">Find your tutor</Link>
          </Button>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page <= 1 || pending}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages || pending}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
