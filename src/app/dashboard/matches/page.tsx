import Link from "next/link";

import { TutorCard } from "@/components/tutors/tutor-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mapTutorToCard } from "@/lib/tutors/mappers";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Matches" };

export default async function MatchesPage() {
  const session = await requireSession();

  const questionnaires = await prisma.findTutorQuestionnaire.findMany({
    where: { userId: session.user.id, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    include: {
      matches: {
        orderBy: { rank: "asc" },
        include: {
          tutorProfile: {
            include: {
              user: { select: { displayName: true, legalName: true, image: true } },
              subjects: { include: { subject: { select: { name: true } } } },
              location: true,
            },
          },
        },
      },
    },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Your matches</h2>
          <p className="text-sm text-muted-foreground">
            Tutors matched from your questionnaire results.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/find-your-tutor">New questionnaire</Link>
        </Button>
      </div>

      {questionnaires.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No matches yet.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/find-your-tutor">Start questionnaire</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        questionnaires.map((q) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-base">
                Questionnaire from{" "}
                {q.completedAt ? new Date(q.completedAt).toLocaleDateString() : "—"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {q.matches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No matches for this questionnaire.</p>
              ) : (
                q.matches.map((match) => (
                  <div key={match.id} className="space-y-2 rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2">
                      <Badge>#{match.rank}</Badge>
                      <Badge variant="secondary">Score: {match.score.toFixed(1)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{match.explanation}</p>
                    {match.tutorProfile ? (
                      <TutorCard tutor={mapTutorToCard(match.tutorProfile)} />
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
