import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/auth/auth-forms";
import { auth } from "@/lib/auth";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  if (session.user.role) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
