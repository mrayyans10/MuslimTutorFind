import Link from "next/link";

import { verifyEmailAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="surface-card space-y-4 p-6 text-center">
        <h1 className="font-display text-2xl font-semibold">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          Check your inbox for a verification link, or sign in if you&apos;ve already
          verified.
        </p>
        <Button asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  const result = await verifyEmailAction(token);

  return (
    <div className="surface-card space-y-4 p-6 text-center">
      <h1 className="font-display text-2xl font-semibold">
        {result.success ? "Email verified" : "Verification failed"}
      </h1>
      <p className="text-sm text-muted-foreground">{result.message}</p>
      <Button asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
    </div>
  );
}
