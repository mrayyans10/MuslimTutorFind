import { SecularNotice } from "@/components/marketing/secular-notice";
import { ContentPage } from "@/components/marketing/content-page";

export default function TrustAndSafetyPage() {
  return (
    <ContentPage
      title="Trust & safety"
      intro="We prioritize safe, respectful connections for Muslim families seeking secular academic support."
    >
      <ul className="list-disc space-y-3 pl-5 text-muted-foreground">
        <li>Admin review of tutor profiles before they appear publicly</li>
        <li>Optional verification for tutors who submit credentials</li>
        <li>Reporting and blocking tools for inappropriate behaviour</li>
        <li>Child safety policies for minors using the platform</li>
        <li>Moderation of prohibited religious instruction terms</li>
        <li>No in-platform payments — reducing financial exposure on the platform</li>
      </ul>
      <SecularNotice className="mt-8" />
    </ContentPage>
  );
}
