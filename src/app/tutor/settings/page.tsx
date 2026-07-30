import { SettingsForm } from "@/app/dashboard/settings/settings-form";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Settings" };

export default async function TutorSettingsPage() {
  const session = await requireSession();
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>
      <SettingsForm prefs={prefs} />
    </div>
  );
}
