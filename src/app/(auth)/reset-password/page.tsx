import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="surface-card space-y-4 p-6 text-center">
        <p className="text-muted-foreground">Reset link is invalid or missing.</p>
        <Button asChild variant="outline">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
