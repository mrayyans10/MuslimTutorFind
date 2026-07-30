import { LegalPage } from "@/components/marketing/legal-page";

export default function AcceptableUsePage() {
  return (
    <LegalPage title="Acceptable use">
      <p>You may not use Community Tutors to:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Offer or request religious instruction</li>
        <li>Harass, threaten, or discriminate against others</li>
        <li>Share illegal content or attempt to exploit minors</li>
        <li>Scrape data or circumvent access controls</li>
        <li>Impersonate another person or misrepresent qualifications</li>
      </ul>
      <p>
        Violations may result in content removal, account suspension, or referral to
        appropriate authorities.
      </p>
    </LegalPage>
  );
}
