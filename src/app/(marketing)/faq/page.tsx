import { ContentPage } from "@/components/marketing/content-page";

const faqs = [
  {
    q: "Is religious instruction allowed?",
    a: "No. Community Tutors is strictly for secular academic tutoring. Religious instruction of any kind is not permitted.",
  },
  {
    q: "Do I need an account to search for tutors?",
    a: "No. You can browse tutors and complete the guided questionnaire as a guest. An account is required only to message tutors.",
  },
  {
    q: "Can I book lessons on the platform?",
    a: "No. We do not offer booking, calendar scheduling, trial lessons, or payment processing. Families and tutors arrange sessions directly.",
  },
  {
    q: "How are tutors approved?",
    a: "Tutors submit profiles for admin review. Approved tutors must confirm secular-subjects-only teaching and community conduct standards.",
  },
  {
    q: "Who can become a tutor?",
    a: "Community members with relevant academic expertise who agree to teach secular subjects only and complete the application process.",
  },
];

export default function FaqPage() {
  return (
    <ContentPage
      title="Frequently asked questions"
      intro="Quick answers about how Community Tutors works."
    >
      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.q} className="surface-card p-5">
            <h2 className="font-display text-lg font-semibold">{faq.q}</h2>
            <p className="mt-2 text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
