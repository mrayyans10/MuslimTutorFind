import { RequirementsBrowseClient } from "./requirements-browse-client";
import { getPublishedRequirements } from "@/app/actions/tutors";

export const metadata = { title: "Tutoring requirements" };

export default async function TutorRequirementsPage() {
  const requirements = await getPublishedRequirements();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Browse requirements</h2>
        <p className="text-sm text-muted-foreground">
          Find published secular academic tutoring requirements to apply to.
        </p>
      </div>
      <RequirementsBrowseClient requirements={requirements} />
    </div>
  );
}
