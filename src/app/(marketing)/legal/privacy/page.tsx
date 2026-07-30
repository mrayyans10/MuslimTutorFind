import { LegalPage } from "@/components/marketing/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        We collect account information, profile data, messages, and usage data to
        operate the tutoring marketplace and keep the community safe.
      </p>
      <p>
        We do not sell personal information. Location data for in-person tutoring is
        limited to city and approximate area on public profiles.
      </p>
      <p>
        Contact support to request access, correction, or deletion of your data,
        subject to legal retention requirements.
      </p>
    </LegalPage>
  );
}
