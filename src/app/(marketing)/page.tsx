import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
  SECULAR_SUBJECTS_NOTICE,
} from "@config/product";
import { getFeaturedTutors } from "@/app/actions/tutors";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { TutorCard } from "@/components/tutors/tutor-card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Share what you need",
    description:
      "Tell us the subject, level, and how you prefer to learn — online or in person.",
  },
  {
    icon: Users,
    title: "Browse matched tutors",
    description:
      "Explore approved tutors from your community who teach secular academic subjects.",
  },
  {
    icon: GraduationCap,
    title: "Connect and learn",
    description:
      "Message a tutor directly to discuss goals, schedule, and fit. No booking widgets here.",
  },
];

export default async function HomePage() {
  const featuredTutors = await getFeaturedTutors(6);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 gradient-hero"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f4c5c' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="container-page relative grid gap-10 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <ShieldCheck className="size-4" aria-hidden />
              Secular academic tutoring only
            </p>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl lg:text-6xl">
                {PRODUCT_NAME}
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
                {PRODUCT_TAGLINE}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/find-your-tutor">
                  Find your tutor
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/become-a-tutor">Become a tutor</Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="surface-card overflow-hidden shadow-lg">
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary via-off-white to-primary/10 p-8">
                <div className="flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card/90 p-6 backdrop-blur-sm">
                  <div className="space-y-2">
                    <BookOpen className="size-10 text-primary" aria-hidden />
                    <p className="font-display text-2xl font-semibold text-foreground">
                      Study together, grow together
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      A warm study table scene — notebooks, a laptop, and community
                      members learning mathematics, sciences, and languages together
                      in a welcoming academic setting.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visual anchor: community study session · secular subjects
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            A straightforward path from search to conversation — built for Muslim
            families who want trusted, secular academic support.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="surface-card p-6">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="size-5" aria-hidden />
              </div>
              <p className="mb-2 text-sm font-medium text-accent">
                Step {index + 1}
              </p>
              <h3 className="mb-2 font-display text-xl font-semibold">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30 py-16">
        <div className="container-page max-w-3xl">
          <SecularNotice />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {SECULAR_SUBJECTS_NOTICE}
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-foreground">
              Featured tutors
            </h2>
            <p className="mt-2 text-muted-foreground">
              Approved community tutors ready to help with secular subjects.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/find-tutors">Browse all tutors</Link>
          </Button>
        </div>

        {featuredTutors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="surface-muted px-6 py-12 text-center">
            <p className="text-muted-foreground">
              Featured tutors will appear here once profiles are approved.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/find-your-tutor">Start the guided search</Link>
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
