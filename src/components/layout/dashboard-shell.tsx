"use client";

import * as React from "react";
import Link from "next/link";
import type { UserRole } from "@prisma/client";
import { Menu, X } from "lucide-react";

import { PRODUCT_NAME } from "@config/product";
import { signOutAction } from "@/app/actions/auth";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export type DashboardArea = "dashboard" | "tutor" | "admin";

export interface DashboardShellProps {
  area: DashboardArea;
  role: UserRole;
  title?: string;
  userName?: string | null;
  children: React.ReactNode;
}

export function DashboardShell({
  area,
  role,
  title,
  userName,
  children,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader session={{ name: userName, role }} />
      <div className="border-b border-border bg-muted/30">
        <div className="container flex items-center justify-between gap-4 py-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                {PRODUCT_NAME}
              </Link>
              {" / "}
              <span className="capitalize">{area}</span>
            </p>
            {title ? <h1 className="font-display text-2xl font-semibold">{title}</h1> : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-expanded={mobileNavOpen}
            aria-controls="dashboard-mobile-nav"
          >
            {mobileNavOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            Menu
          </Button>
        </div>
        {mobileNavOpen ? (
          <div
            id="dashboard-mobile-nav"
            className="border-t border-border bg-background px-4 py-4 md:hidden"
          >
            <DashboardNav area={area} role={role} />
            <form action={signOutAction} className="mt-4">
              <Button type="submit" variant="secondary" className="w-full">
                Sign out
              </Button>
            </form>
          </div>
        ) : null}
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
