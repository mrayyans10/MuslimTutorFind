import { SignUpForm } from "@/components/auth/auth-forms";

type PageProps = {
  searchParams: Promise<{ role?: string }>;
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const role = params.role?.toUpperCase();
  const defaultRole =
    role === "TUTOR" || role === "PARENT" || role === "STUDENT" ? role : undefined;

  return <SignUpForm defaultRole={defaultRole} />;
}
