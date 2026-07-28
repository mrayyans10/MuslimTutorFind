import { GuidelinesClient } from "./guidelines-client";
import { prisma } from "@/lib/db";

export const metadata = { title: "Community guidelines" };

export default async function AdminGuidelinesPage() {
  const guidelines = await prisma.communityGuideline.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Community guidelines</h2>
        <p className="text-sm text-muted-foreground">Manage platform community guidelines.</p>
      </div>
      <GuidelinesClient guidelines={guidelines} />
    </div>
  );
}
