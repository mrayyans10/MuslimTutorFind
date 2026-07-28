import Link from "next/link";
import type { UserRole } from "@prisma/client";

import { PRODUCT_NAME } from "@config/product";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export type DashboardArea = "dashboard" | "tutor" | "admin";

export interface DashboardShellProps {
  area: DashboardArea;
  role: UserRole;
  title?: string;
  children: React.ReactNode;
}

export function DashboardShell({ area, role, title, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="border-b border-border bg-muted/30">
        <div className="container flex flex-col gap-1 py-4">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              {PRODUCT_NAME}
            </Link>
            {" / "}
            <span className="capitalize">{area}</span>
          </p>
          {title ? <h1 className="font-display text-2xl font-semibold">{title}</h1> : null}
        </div>
      </div>
      <div className="container flex flex-1 gap-8 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <DashboardNav area={area} role={role} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
