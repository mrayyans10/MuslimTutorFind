import { SignInForm } from "@/components/auth/auth-forms";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string; reset?: string }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <SignInForm callbackUrl={params.callbackUrl} />;
}
