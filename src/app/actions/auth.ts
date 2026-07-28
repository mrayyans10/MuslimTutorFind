"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

import {
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from "@/lib/services/auth-service";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

function fieldErrors(error: unknown): ActionState {
  if (error && typeof error === "object" && "flatten" in error) {
    const flattened = (
      error as { flatten: () => { fieldErrors: Record<string, string[]> } }
    ).flatten();
    return { errors: flattened.fieldErrors };
  }
  return {
    message: error instanceof Error ? error.message : "Something went wrong.",
  };
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    legalName: formData.get("legalName"),
    displayName: formData.get("displayName"),
    role: formData.get("role"),
    country: formData.get("country"),
    city: formData.get("city"),
    phone: formData.get("phone"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await registerUser(parsed.data);
    return { success: true, message: result.message };
  } catch (error) {
    return fieldErrors(error);
  }
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const callbackUrl = String(formData.get("callbackUrl") || "/dashboard");

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Invalid email or password." };
    }
    throw error;
  }
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await requestPasswordReset(parsed.data.email);
    return { success: true, message: result.message };
  } catch (error) {
    return fieldErrors(error);
  }
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await resetPassword(parsed.data.token, parsed.data.password);
    redirect("/sign-in?reset=success");
  } catch (error) {
    return fieldErrors(error);
  }
}

export async function verifyEmailAction(token: string): Promise<ActionState> {
  try {
    const result = await verifyEmail(token);
    return { success: true, message: result.message };
  } catch (error) {
    return fieldErrors(error);
  }
}

export async function completeOnboardingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = formData.get("role");
  if (role !== "STUDENT" && role !== "PARENT" && role !== "TUTOR") {
    return { message: "Select a valid role." };
  }

  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "You must be signed in." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: { role: role as UserRole },
        select: { id: true, role: true, displayName: true, legalName: true, phone: true },
      });

      if (user.role === "STUDENT") {
        await tx.studentProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
      } else if (user.role === "PARENT") {
        await tx.parentProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, phone: user.phone },
          update: {},
        });
      } else if (user.role === "TUTOR") {
        const displayName = user.displayName ?? user.legalName ?? "Tutor";
        const slugBase = displayName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "tutor";
        await tx.tutorProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            slug: `${slugBase}-${user.id.slice(0, 8)}`,
          },
          update: {},
        });
      }
    });

    const destination =
      role === "TUTOR" ? "/tutor/profile" : role === "PARENT" ? "/dashboard" : "/dashboard";
    redirect(destination);
  } catch (error) {
    return fieldErrors(error);
  }
}
