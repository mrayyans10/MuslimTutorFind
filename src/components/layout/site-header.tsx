"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { PRODUCT_NAME } from "@config/product";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/find-tutors", label: "Find tutors" },
  { href: "/find-your-tutor", label: "Find your tutor" },
  { href: "/subjects", label: "Subjects" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/become-a-tutor", label: "Become a tutor" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-off-white/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-primary sm:text-xl"
        >
          {PRODUCT_NAME}
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-primary",
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-off-white lg:hidden"
        >
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                    ? "bg-secondary text-primary"
                    : "text-foreground hover:bg-secondary/70",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <Button variant="outline" asChild className="w-full">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
