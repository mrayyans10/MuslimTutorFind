"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

import {
  runMatching,
  saveQuestionnaireAnswers,
  type QuestionnaireAnswers,
} from "@/app/actions/matching";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { TutorCard } from "@/components/tutors/tutor-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const STORAGE_KEY = "ct-find-your-tutor";

type SubjectOption = {
  id: string;
  name: string;
  slug: string;
  specializations: { id: string; name: string }[];
};

type CurriculumOption = { id: string; name: string; slug: string };

type MatchResult = Awaited<ReturnType<typeof runMatching>>[number];

type QuestionnaireProps = {
  subjects: SubjectOption[];
  curricula: CurriculumOption[];
};

const WHO_OPTIONS = [
  { value: "myself", label: "Myself" },
  { value: "my_child", label: "My child" },
  { value: "family_member", label: "Another family member" },
];

const LEVELS = [
  { value: "ELEMENTARY", label: "Elementary" },
  { value: "MIDDLE_SCHOOL", label: "Middle school" },
  { value: "HIGH_SCHOOL", label: "High school" },
  { value: "COLLEGE", label: "College / university" },
  { value: "ADULT", label: "Adult learner" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const GOALS = [
  { value: "IMPROVE_GRADES", label: "Improve grades" },
  { value: "UNDERSTAND_CONCEPTS", label: "Understand concepts" },
  { value: "HOMEWORK_SUPPORT", label: "Homework support" },
  { value: "EXAM_PREP", label: "Exam preparation" },
  { value: "CATCH_UP", label: "Catch up" },
  { value: "GET_AHEAD", label: "Get ahead" },
  { value: "PROJECT_GUIDANCE", label: "Project guidance" },
  { value: "UNIVERSITY_PREP", label: "University prep" },
  { value: "TECHNICAL_SKILL", label: "Technical skill" },
  { value: "BUILD_CONFIDENCE", label: "Build confidence" },
  { value: "OTHER", label: "Other" },
];

const URGENCY = [
  { value: "ASAP", label: "As soon as possible" },
  { value: "FEW_DAYS", label: "Within a few days" },
  { value: "TWO_WEEKS", label: "Within two weeks" },
  { value: "ONE_MONTH", label: "Within a month" },
  { value: "FLEXIBLE", label: "Flexible" },
];

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const PERIODS = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
];

const STYLES = [
  { value: "PATIENT_ENCOURAGING", label: "Patient & encouraging" },
  { value: "STRUCTURED_ORGANIZED", label: "Structured & organized" },
  { value: "EXAM_FOCUSED", label: "Exam focused" },
  { value: "PROJECT_BASED", label: "Project based" },
  { value: "INTERACTIVE", label: "Interactive" },
  { value: "FLEXIBLE_ADAPTIVE", label: "Flexible & adaptive" },
];

const TOTAL_STEPS = 12;

export function Questionnaire({ subjects, curricula }: QuestionnaireProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        step?: number;
        answers?: QuestionnaireAnswers;
        questionnaireId?: string | null;
      };
      if (saved.step) setStep(saved.step);
      if (saved.answers) setAnswers(saved.answers);
      if (saved.questionnaireId) setQuestionnaireId(saved.questionnaireId);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step, answers, questionnaireId }),
    );
  }, [step, answers, questionnaireId]);

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === answers.subjectId),
    [subjects, answers.subjectId],
  );

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const update = useCallback((patch: Partial<QuestionnaireAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setError(null);
  }, []);

  const persist = useCallback(
    async (nextStep: number, nextAnswers: QuestionnaireAnswers) => {
      const saved = await saveQuestionnaireAnswers(
        questionnaireId,
        nextStep,
        nextAnswers,
      );
      setQuestionnaireId(saved.id);
      return saved.id;
    },
    [questionnaireId],
  );

  const goNext = () => {
    startTransition(async () => {
      try {
        if (step === 2 && !answers.subjectId) {
          setError("Select a subject to continue.");
          return;
        }
        if (step === 4 && !answers.learnerLevel) {
          setError("Select a learner level.");
          return;
        }
        if (step === 8 && !answers.mode) {
          setError("Select online or in-person preference.");
          return;
        }

        const nextStep = Math.min(step + 1, TOTAL_STEPS);
        await persist(nextStep, answers);

        if (step === 11) {
          const id = questionnaireId ?? (await persist(12, answers));
          const matches = await runMatching(id);
          setResults(matches);
        }

        setStep(nextStep);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to save progress.");
      }
    });
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const toggleDay = (day: string) => {
    const current = answers.scheduleDays ?? [];
    update({
      scheduleDays: current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    });
  };

  const togglePeriod = (period: string) => {
    const current = answers.schedulePeriods ?? [];
    update({
      schedulePeriods: current.includes(period)
        ? current.filter((p) => p !== period)
        : [...current, period],
    });
  };

  const toggleStyle = (style: string) => {
    const current = answers.teachingStyles ?? [];
    update({
      teachingStyles: current.includes(style as never)
        ? current.filter((s) => s !== style)
        : [...current, style as never],
    });
  };

  if (step === 1) {
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Who needs tutoring?</h2>
        <p className="text-muted-foreground">
          This helps us tailor recommendations. Religious instruction is never offered.
        </p>
        <div className="grid gap-3">
          {WHO_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ whoNeedsHelp: opt.value })}
              className={`rounded-xl border p-4 text-left transition-colors ${
                answers.whoNeedsHelp === opt.value
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} canBack={false} />
      </QuestionShell>
    );
  }

  if (step === 2) {
    const popular = subjects.slice(0, 6);
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Which subject?</h2>
        <p className="text-muted-foreground">Secular academic subjects only.</p>
        <SecularNotice />
        <div className="flex flex-wrap gap-2">
          {popular.map((s) => (
            <Button
              key={s.id}
              type="button"
              size="sm"
              variant={answers.subjectId === s.id ? "default" : "outline"}
              onClick={() =>
                update({ subjectId: s.id, subjectName: s.name })
              }
            >
              {s.name}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject-search">Search subjects</Label>
          <Select
            id="subject-search"
            value={answers.subjectId ?? ""}
            onChange={(e) => {
              const subject = subjects.find((s) => s.id === e.target.value);
              update({
                subjectId: e.target.value,
                subjectName: subject?.name,
                specializationId: undefined,
                topic: undefined,
              });
            }}
          >
            <option value="">Select a subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} />
      </QuestionShell>
    );
  }

  if (step === 3) {
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Topic or specialization</h2>
        <p className="text-muted-foreground">
          For {selectedSubject?.name ?? "your subject"} — optional but helpful.
        </p>
        {selectedSubject && selectedSubject.specializations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedSubject.specializations.map((spec) => (
              <Button
                key={spec.id}
                type="button"
                size="sm"
                variant={
                  answers.specializationId === spec.id ? "default" : "outline"
                }
                onClick={() =>
                  update({
                    specializationId: spec.id,
                    topic: spec.name,
                  })
                }
              >
                {spec.name}
              </Button>
            ))}
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="topic">Or describe the topic</Label>
          <Input
            id="topic"
            value={answers.topic ?? ""}
            onChange={(e) => update({ topic: e.target.value })}
            placeholder="e.g. quadratic equations, organic chemistry"
          />
        </div>
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} />
      </QuestionShell>
    );
  }

  if (step === 4) {
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Current learner level</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => update({ learnerLevel: level.value as never })}
              className={`rounded-xl border p-3 text-left text-sm ${
                answers.learnerLevel === level.value
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} />
      </QuestionShell>
    );
  }

  if (step === 5) {
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Curriculum</h2>
        <div className="space-y-2">
          <Select
            value={answers.curriculum ?? ""}
            onChange={(e) => update({ curriculum: e.target.value })}
          >
            <option value="">Select curriculum</option>
            <option value="not sure">Not sure</option>
            {curricula.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} />
      </QuestionShell>
    );
  }

  if (step === 6) {
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Learning goal</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {GOALS.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => update({ learningGoal: goal.value })}
              className={`rounded-xl border p-3 text-left text-sm ${
                answers.learningGoal === goal.value
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              {goal.label}
            </button>
          ))}
        </div>
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} />
      </QuestionShell>
    );
  }

  if (step === 7) {
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">When is tutoring needed?</h2>
        <div className="grid gap-2">
          {URGENCY.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => update({ whenNeeded: u.value })}
              className={`rounded-xl border p-3 text-left text-sm ${
                answers.whenNeeded === u.value
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} />
      </QuestionShell>
    );
  }

  if (step === 8) {
    const showLocation =
      answers.mode === "IN_PERSON" || answers.mode === "EITHER";
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Online or in-person?</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { value: "ONLINE", label: "Online" },
            { value: "IN_PERSON", label: "In-person" },
            { value: "EITHER", label: "Either" },
          ].map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => update({ mode: mode.value as never })}
              className={`rounded-xl border p-3 text-sm ${
                answers.mode === mode.value
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        {showLocation ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={answers.country ?? ""}
                onChange={(e) => update({ country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={answers.city ?? ""}
                onChange={(e) => update({ city: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="area">Approximate area (no exact address)</Label>
              <Input
                id="area"
                value={answers.approximateArea ?? ""}
                onChange={(e) => update({ approximateArea: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={answers.tutorComes ?? false}
                onCheckedChange={(v) => update({ tutorComes: v === true })}
              />
              Tutor can travel to learner
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={answers.learnerTravels ?? false}
                onCheckedChange={(v) => update({ learnerTravels: v === true })}
              />
              Learner can travel to tutor
            </label>
          </div>
        ) : null}
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} />
      </QuestionShell>
    );
  }

  if (step === 9) {
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Preferred schedule</h2>
        <p className="text-sm text-muted-foreground">Descriptive only — no calendar booking.</p>
        <div>
          <p className="mb-2 text-sm font-medium">Days</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <Button
                key={day}
                type="button"
                size="sm"
                variant={
                  (answers.scheduleDays ?? []).includes(day) ? "default" : "outline"
                }
                onClick={() => toggleDay(day)}
              >
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Time of day</p>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                type="button"
                size="sm"
                variant={
                  (answers.schedulePeriods ?? []).includes(p.value)
                    ? "default"
                    : "outline"
                }
                onClick={() => togglePeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sessions">Sessions per week</Label>
            <Input
              id="sessions"
              type="number"
              min={1}
              max={7}
              value={answers.sessionsPerWeek ?? ""}
              onChange={(e) =>
                update({
                  sessionsPerWeek: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Session duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={30}
              step={15}
              value={answers.sessionDurationMinutes ?? ""}
              onChange={(e) =>
                update({
                  sessionDurationMinutes: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>
        </div>
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} />
      </QuestionShell>
    );
  }

  if (step === 10) {
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Budget</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="budgetMin">Minimum ($/hr)</Label>
            <Input
              id="budgetMin"
              type="number"
              min={0}
              value={answers.budgetMin ?? ""}
              onChange={(e) =>
                update({
                  budgetMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgetMax">Maximum ($/hr)</Label>
            <Input
              id="budgetMax"
              type="number"
              min={0}
              value={answers.budgetMax ?? ""}
              onChange={(e) =>
                update({
                  budgetMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={answers.currency ?? "CAD"}
              onChange={(e) => update({ currency: e.target.value })}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={answers.allowSlightlyHigher ?? false}
            onCheckedChange={(v) => update({ allowSlightlyHigher: v === true })}
          />
          Allow slightly higher rates (up to 15% above max)
        </label>
        <NavButtons onBack={goBack} onNext={goNext} pending={pending} />
      </QuestionShell>
    );
  }

  if (step === 11) {
    return (
      <QuestionShell step={step} progress={progress} error={error}>
        <h2 className="font-display text-2xl font-semibold">Tutor preferences</h2>
        <p className="text-sm text-muted-foreground">All optional.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="experience">Min years of experience</Label>
            <Input
              id="experience"
              type="number"
              min={0}
              value={answers.preferredExperienceYears ?? ""}
              onChange={(e) =>
                update({
                  preferredExperienceYears: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Preferred language</Label>
            <Input
              id="language"
              value={answers.preferredLanguage ?? ""}
              onChange={(e) => update({ preferredLanguage: e.target.value })}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={answers.verifiedOnly ?? false}
            onCheckedChange={(v) => update({ verifiedOnly: v === true })}
          />
          Verified tutors only
        </label>
        <div>
          <p className="mb-2 text-sm font-medium">Teaching style</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((style) => (
              <Button
                key={style.value}
                type="button"
                size="sm"
                variant={
                  (answers.teachingStyles ?? []).includes(style.value as never)
                    ? "default"
                    : "outline"
                }
                onClick={() => toggleStyle(style.value)}
              >
                {style.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender preference (optional)</Label>
          <Input
            id="gender"
            value={answers.genderPreference ?? ""}
            onChange={(e) => update({ genderPreference: e.target.value })}
            placeholder="Leave blank for no preference"
          />
        </div>
        <NavButtons
          onBack={goBack}
          onNext={goNext}
          pending={pending}
          nextLabel="See matches"
        />
      </QuestionShell>
    );
  }

  return (
    <QuestionShell step={step} progress={100} error={error}>
      <h2 className="font-display text-2xl font-semibold">Your matched tutors</h2>
      <p className="text-muted-foreground">
        Ranked by fit. Sign in to message a tutor — no booking or trial flows here.
      </p>

      {pending && !results ? (
        <p className="text-muted-foreground">Finding matches…</p>
      ) : null}

      {results && results.length > 0 ? (
        <div className="space-y-8">
          {results.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <CardHeader className="border-b border-border bg-secondary/30 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="accent">{Math.round(match.score)}% match</Badge>
                  <p className="text-sm text-muted-foreground">{match.explanation}</p>
                </div>
                {match.mismatches.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {match.mismatches.map((m) => (
                      <Badge key={m} variant="outline">
                        {m}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="p-5">
                {match.tutor ? (
                  <TutorCard tutor={match.tutor} />
                ) : (
                  <p className="text-sm text-muted-foreground">Tutor unavailable.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="surface-muted px-6 py-10 text-center">
          <p className="text-muted-foreground">
            No matches yet. Try adjusting your preferences or browse all tutors.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/find-tutors">Browse tutors</Link>
          </Button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="size-4" />
          Edit answers
        </Button>
        <Button variant="outline" asChild>
          <Link href="/find-tutors">Browse all tutors</Link>
        </Button>
      </div>
    </QuestionShell>
  );
}

function QuestionShell({
  step,
  progress,
  error,
  children,
}: {
  step: number;
  progress: number;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-2xl py-10">
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
      <div className="surface-card space-y-6 p-6">{children}</div>
      {error ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  pending,
  canBack = true,
  nextLabel = "Continue",
}: {
  onBack: () => void;
  onNext: () => void;
  pending: boolean;
  canBack?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex justify-between gap-3 pt-2">
      {canBack ? (
        <Button type="button" variant="outline" onClick={onBack} disabled={pending}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      ) : (
        <span />
      )}
      <Button type="button" onClick={onNext} disabled={pending}>
        {pending ? "Saving…" : nextLabel}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
