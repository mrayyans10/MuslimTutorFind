import { SecularNotice } from "@/components/marketing/secular-notice";
import { ContentPage } from "@/components/marketing/content-page";

export default function CommunityGuidelinesPage() {
  return (
    <ContentPage
      title="Community guidelines"
      intro="Everyone using Community Tutors agrees to these standards."
    >
      <ul className="list-disc space-y-3 pl-5 text-muted-foreground">
        <li>Teach or request secular academic subjects only</li>
        <li>Communicate respectfully with students, parents, and tutors</li>
        <li>Do not share private addresses publicly; use approximate areas only</li>
        <li>Report concerns rather than engaging in harassment</li>
        <li>Parents remain responsible for supervising minors</li>
        <li>Do not attempt to circumvent moderation or offer prohibited subjects</li>
      </ul>
      <SecularNotice className="mt-8" />
    </ContentPage>
  );
}
