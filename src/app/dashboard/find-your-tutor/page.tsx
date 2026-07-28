import { getCurriculaForMatching, getSubjectsForMatching } from "@/app/actions/matching";
import { Questionnaire } from "@/components/find-your-tutor/questionnaire";
import { SecularNotice } from "@/components/marketing/secular-notice";

export const metadata = { title: "Find your tutor" };

export default async function FindYourTutorPage() {
  const [subjects, curricula] = await Promise.all([
    getSubjectsForMatching(),
    getCurriculaForMatching(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Find your tutor</h2>
        <p className="text-sm text-muted-foreground">
          Answer a few questions to get matched with secular academic tutors.
        </p>
      </div>
      <SecularNotice />
      <Questionnaire subjects={subjects} curricula={curricula} />
    </div>
  );
}
