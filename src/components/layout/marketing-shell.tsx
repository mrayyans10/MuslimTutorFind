import { auth } from "@/lib/auth";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export async function MarketingShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        session={
          session?.user
            ? { name: session.user.name, role: session.user.role }
            : null
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
