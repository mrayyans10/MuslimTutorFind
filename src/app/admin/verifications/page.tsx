import { AdminVerificationsClient } from "@/components/admin/admin-verifications-client";
import { prisma } from "@/lib/db";

export const metadata = { title: "Verifications" };

export default async function AdminVerificationsPage() {
  const verifications = await prisma.tutorVerification.findMany({
    include: {
      tutorProfile: {
        include: { user: { select: { displayName: true, legalName: true, email: true } } },
      },
      documents: { where: { deletedAt: null } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Verifications</h2>
        <p className="text-sm text-muted-foreground">Review tutor identity documents.</p>
      </div>
      <AdminVerificationsClient
        verifications={verifications.map((v) => ({
          id: v.id,
          tutorProfileId: v.tutorProfileId,
          status: v.status,
          documentsCount: v.documents.length,
          tutorName: v.tutorProfile.user.displayName ?? v.tutorProfile.user.legalName ?? "Tutor",
          email: v.tutorProfile.user.email,
        }))}
      />
    </div>
  );
}
