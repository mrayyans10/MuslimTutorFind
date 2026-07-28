import { redirect } from "next/navigation";

import { toggleSubjectAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Subjects" };

export default async function AdminSubjectsPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMINISTRATOR") redirect("/admin");

  const categories = await prisma.subjectCategory.findMany({
    include: {
      subjects: { orderBy: { name: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Subjects</h2>
        <p className="text-sm text-muted-foreground">Manage secular academic subject catalog.</p>
      </div>

      {categories.map((cat) => (
        <Card key={cat.id}>
          <CardHeader>
            <CardTitle className="text-base">{cat.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cat.subjects.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between rounded border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">{subject.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={subject.isActive ? "default" : "secondary"}>
                    {subject.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <form action={async () => { await toggleSubjectAction(subject.id, !subject.isActive); }}>
                    <Button type="submit" size="sm" variant="outline">
                      {subject.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
