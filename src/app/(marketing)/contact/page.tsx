import { SUPPORT_EMAIL } from "@config/product";
import { ContentPage } from "@/components/marketing/content-page";

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact us"
      intro="Questions about secular academic tutoring on Community Tutors? We're here to help."
    >
      <div className="surface-card space-y-4 p-6">
        <p className="text-muted-foreground">
          Email our support team and we&apos;ll respond as soon as possible.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-block text-lg font-medium text-primary hover:text-teal-dark"
        >
          {SUPPORT_EMAIL}
        </a>
        <p className="text-sm text-muted-foreground">
          For urgent safety concerns involving minors, include &quot;urgent safety&quot;
          in your subject line.
        </p>
      </div>
    </ContentPage>
  );
}
