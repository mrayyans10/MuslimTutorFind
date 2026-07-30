import { AdminTutorsClient } from "@/components/admin/admin-tutors-client";
import { prisma } from "@/lib/db";

export const metadata = { title: "Tutors" };

export default async function AdminTutorsPage() {
  const tutors = await prisma.tutorProfile.findMany({
    where: { deletedAt: null },
    include: {
      user: { select: { displayName: true, legalName: true, email: true } },
      subjects: { include: { subject: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Tutors</h2>
        <p className="text-sm text-muted-foreground">Approve, reject, or request changes.</p>
      </div>
      <AdminTutorsClient
        tutors={tutors.map((t) => ({
          id: t.id,
          slug: t.slug,
          status: t.status,
          headline: t.headline,
          changeRequestNotes: t.changeRequestNotes,
          rejectionReason: t.rejectionReason,
          user: t.user,
          subjects: t.subjects,
        }))}
      />
    </div>
  );
}
