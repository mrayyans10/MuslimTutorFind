import Link from "next/link";

import { PRODUCT_NAME } from "@config/product";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/80 bg-off-white/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-primary"
          >
            {PRODUCT_NAME}
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Back to home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
