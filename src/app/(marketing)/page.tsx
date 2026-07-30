import Link from "next/link";
import {
  ArrowRight,
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
      <section className="relative min-h-[85vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(15,76,92,0.88), rgba(10,58,71,0.72)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80')",
          }}
          role="img"
          aria-label="Students studying together with notebooks and a laptop"
        />
        <div className="container-page relative flex min-h-[85vh] items-end py-16 sm:items-center sm:py-24">
          <div className="max-w-2xl space-y-6 text-primary-foreground">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <ShieldCheck className="size-4" aria-hidden />
              Secular academic tutoring only
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {PRODUCT_NAME}
            </h1>
            <p className="max-w-xl text-lg text-primary-foreground/90 sm:text-xl">
              {PRODUCT_TAGLINE}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-amber text-white hover:bg-amber-light" asChild>
                <Link href="/find-your-tutor">
                  Find your tutor
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10"
                asChild
              >
                <Link href="/become-a-tutor">Become a tutor</Link>
              </Button>
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
