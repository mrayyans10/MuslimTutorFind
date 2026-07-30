import { listProhibitedSubjects } from "@/app/actions/admin";
import { ProhibitedSubjectsClient } from "./prohibited-subjects-client";

export const metadata = { title: "Prohibited subjects" };

export default async function AdminProhibitedSubjectsPage() {
  const subjects = await listProhibitedSubjects(true);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Prohibited subjects</h2>
        <p className="text-sm text-muted-foreground">
          Terms blocked from secular tutoring requirements and profiles.
        </p>
      </div>
      <ProhibitedSubjectsClient subjects={subjects} />
    </div>
  );
}
