import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@config/product";
import { SecularNotice } from "@/components/marketing/secular-notice";
import { ContentPage } from "@/components/marketing/content-page";

export default function AboutPage() {
  return (
    <ContentPage title={`About ${PRODUCT_NAME}`} intro={PRODUCT_TAGLINE}>
      <p className="text-muted-foreground">
        {PRODUCT_NAME} is a tutoring marketplace built for Muslim communities who want
        trusted academic support without religious instruction. We focus on mathematics,
        sciences, languages, computer science, test preparation, and other secular
        subjects.
      </p>
      <p className="mt-4 text-muted-foreground">
        Our platform emphasises community connection, transparent profiles, and direct
        messaging — not booking systems, trial lessons, or payment processing.
      </p>
      <SecularNotice className="mt-8" />
    </ContentPage>
  );
}
