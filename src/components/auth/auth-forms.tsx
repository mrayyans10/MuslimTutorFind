"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  signInAction,
  signUpAction,
  forgotPasswordAction,
  resetPasswordAction,
  completeOnboardingAction,
  type ActionState,
} from "@/app/actions/auth";
import { FieldWrapper, FormError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SECULAR_SUBJECTS_NOTICE } from "@config/product";

const initialState: ActionState = {};

export function SignUpForm({ defaultRole }: { defaultRole?: string }) {
  const [state, action, pending] = useActionState(signUpAction, initialState);

  if (state.success) {
    return (
      <div className="surface-card space-y-4 p-6 text-center">
        <p className="font-medium text-foreground">
          {state.demoMode ? "Account created" : "Check your email"}
        </p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        {state.demoMode ? (
          <p className="rounded-lg bg-secondary/60 px-3 py-2 text-left text-xs text-muted-foreground">
            Demo mode: verification emails are printed in the terminal running{" "}
            <code className="font-mono">pnpm dev</code>. Your account is already
            active, so you can sign in immediately.
          </p>
        ) : null}
        {state.verificationUrl ? (
          <p className="break-all text-left text-xs text-muted-foreground">
            Verification link:{" "}
            <Link href={state.verificationUrl} className="link-underline">
              {state.verificationUrl}
            </Link>
          </p>
        ) : null}
        <Button asChild>
          <Link href="/sign-in">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="surface-card space-y-4 p-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">{SECULAR_SUBJECTS_NOTICE}</p>
      </div>

      <FormError message={state.message} />

      <FieldWrapper id="role" label="I am a" required error={state.errors?.role?.[0]}>
        <Select id="role" name="role" defaultValue={defaultRole ?? "STUDENT"} required>
          <option value="STUDENT">Student</option>
          <option value="PARENT">Parent</option>
          <option value="TUTOR">Tutor</option>
        </Select>
      </FieldWrapper>

      <FieldWrapper id="legalName" label="Legal name" required error={state.errors?.legalName?.[0]}>
        <Input id="legalName" name="legalName" autoComplete="name" required />
      </FieldWrapper>

      <FieldWrapper id="displayName" label="Display name" required error={state.errors?.displayName?.[0]}>
        <Input id="displayName" name="displayName" autoComplete="nickname" required />
      </FieldWrapper>

      <FieldWrapper id="email" label="Email" required error={state.errors?.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FieldWrapper>

      <FieldWrapper
        id="password"
        label="Password"
        required
        description="At least 8 characters, including a letter and a number."
        error={state.errors?.password?.[0]}
      >
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </FieldWrapper>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper id="country" label="Country" error={state.errors?.country?.[0]}>
          <Input id="country" name="country" autoComplete="country-name" />
        </FieldWrapper>
        <FieldWrapper id="city" label="City" error={state.errors?.city?.[0]}>
          <Input id="city" name="city" autoComplete="address-level2" />
        </FieldWrapper>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Sign up"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="link-underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(signInAction, initialState);

  return (
    <form action={action} className="surface-card space-y-4 p-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">Welcome back to Community Tutors</p>
      </div>

      <FormError message={state.message} />
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/dashboard"} />

      <FieldWrapper id="email" label="Email" required error={state.errors?.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FieldWrapper>

      <FieldWrapper id="password" label="Password" required error={state.errors?.password?.[0]}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </FieldWrapper>

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm link-underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/sign-up" className="link-underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="surface-card space-y-4 p-6 text-center">
        <p className="font-medium">{state.message}</p>
        <Button asChild variant="outline">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="surface-card space-y-4 p-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-semibold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send reset instructions.
        </p>
      </div>

      <FormError message={state.message} />

      <FieldWrapper id="email" label="Email" required error={state.errors?.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FieldWrapper>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={action} className="surface-card space-y-4 p-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-semibold">Reset password</h1>
      </div>

      <FormError message={state.message} />
      <input type="hidden" name="token" value={token} />

      <FieldWrapper id="password" label="New password" required error={state.errors?.password?.[0]}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </FieldWrapper>

      <FieldWrapper
        id="confirmPassword"
        label="Confirm password"
        required
        error={state.errors?.confirmPassword?.[0]}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </FieldWrapper>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}

export function OnboardingForm() {
  const [state, action, pending] = useActionState(completeOnboardingAction, initialState);

  return (
    <form action={action} className="surface-card space-y-4 p-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-semibold">Choose your role</h1>
        <p className="text-sm text-muted-foreground">
          How will you use Community Tutors?
        </p>
      </div>

      <FormError message={state.message} />

      <FieldWrapper id="role" label="Role" required error={state.errors?.role?.[0]}>
        <Select id="role" name="role" defaultValue="STUDENT" required>
          <option value="STUDENT">Student seeking tutoring</option>
          <option value="PARENT">Parent seeking tutoring for my child</option>
          <option value="TUTOR">Tutor offering secular academic subjects</option>
        </Select>
      </FieldWrapper>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
