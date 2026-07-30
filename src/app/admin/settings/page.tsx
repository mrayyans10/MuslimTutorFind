import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMINISTRATOR") redirect("/admin");

  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  const flags = await prisma.featureFlag.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Site settings</h2>
        <p className="text-sm text-muted-foreground">Platform configuration values.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Site settings</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {settings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No settings configured.</p>
          ) : (
            settings.map((s) => (
              <div key={s.id} className="rounded border border-border p-3">
                <p className="font-medium text-sm">{s.key}</p>
                <pre className="mt-1 overflow-x-auto text-xs text-muted-foreground">
                  {JSON.stringify(s.value, null, 2)}
                </pre>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Feature flags</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feature flags.</p>
          ) : (
            flags.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded border border-border p-3">
                <div>
                  <p className="font-medium text-sm">{f.key}</p>
                  {f.description ? (
                    <p className="text-xs text-muted-foreground">{f.description}</p>
                  ) : null}
                </div>
                <p className="text-sm">{f.enabled ? "Enabled" : "Disabled"}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
