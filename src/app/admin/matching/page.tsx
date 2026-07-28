import { redirect } from "next/navigation";

import { DEFAULT_MATCH_WEIGHTS } from "@/lib/matching/engine";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { MatchingWeightsForm } from "./matching-form";

export const metadata = { title: "Matching" };

export default async function AdminMatchingPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMINISTRATOR") redirect("/admin");

  const setting = await prisma.siteSetting.findUnique({
    where: { key: "matching.weights" },
  });

  const weights =
    setting?.value && typeof setting.value === "object" && !Array.isArray(setting.value)
      ? { ...DEFAULT_MATCH_WEIGHTS, ...(setting.value as Record<string, number>) }
      : DEFAULT_MATCH_WEIGHTS;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Matching weights</h2>
        <p className="text-sm text-muted-foreground">
          Configure how tutor matches are scored in the questionnaire.
        </p>
      </div>
      <MatchingWeightsForm weights={weights} />
    </div>
  );
}
