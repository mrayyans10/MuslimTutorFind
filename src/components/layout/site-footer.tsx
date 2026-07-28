import Link from "next/link";

import { PRODUCT_NAME, SUPPORT_EMAIL } from "@config/product";
import { Separator } from "@/components/ui/separator";

const footerSections = [
  {
    title: "Platform",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Trust & legal",
    links: [
      { href: "/trust-and-safety", label: "Trust & safety" },
      { href: "/community-guidelines", label: "Community guidelines" },
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/privacy", label: "Privacy policy" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="font-display text-lg font-semibold text-primary">
              {PRODUCT_NAME}
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Secular academic tutoring for Muslim communities — connecting
              students, parents, and qualified tutors across subjects.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-block text-sm font-medium text-primary hover:text-teal-dark"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {PRODUCT_NAME}. All rights reserved.
          </p>
          <p>Secular academic tutoring only.</p>
        </div>
      </div>
    </footer>
  );
}
