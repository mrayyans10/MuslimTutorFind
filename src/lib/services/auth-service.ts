import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const PASSWORD_HASH_COST = 12;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1_000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1_000;
const PASSWORD_RESET_SUCCESS =
  "If an account exists for that email, password reset instructions have been sent.";

type RegisterUserInput = {
  email: string;
  password: string;
  legalName: string;
  displayName: string;
  role: Extract<UserRole, "STUDENT" | "PARENT" | "TUTOR">;
  country?: string | null;
  city?: string | null;
  phone?: string | null;
  timezone?: string | null;
};

const publicUserSelect = {
  id: true,
  email: true,
  emailVerified: true,
  legalName: true,
  displayName: true,
  phone: true,
  role: true,
  status: true,
  country: true,
  city: true,
  timezone: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function appBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function tokenUrl(path: string, token: string) {
  const url = new URL(path, appBaseUrl());
  url.searchParams.set("token", token);
  return url.toString();
}

function slugBase(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "tutor";
}

async function uniqueTutorSlug(tx: Prisma.TransactionClient, displayName: string, userId: string) {
  const base = `${slugBase(displayName)}-${userId.slice(0, 8)}`;
  let candidate = base;
  let suffix = 1;
  while (await tx.tutorProfile.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

async function createRoleProfileStub(
  tx: Prisma.TransactionClient,
  user: { id: string; displayName: string | null; legalName: string | null; phone: string | null; role: UserRole | null },
) {
  if (user.role === "STUDENT") {
    await tx.studentProfile.create({ data: { userId: user.id } });
    return;
  }

  if (user.role === "PARENT") {
    await tx.parentProfile.create({ data: { userId: user.id, phone: user.phone } });
    return;
  }

  if (user.role === "TUTOR") {
    const displayName = user.displayName ?? user.legalName ?? "Tutor";
    await tx.tutorProfile.create({
      data: {
        userId: user.id,
        slug: await uniqueTutorSlug(tx, displayName, user.id),
      },
    });
  }
}

async function sendVerificationEmail(email: string, displayName: string | null, token: string) {
  const link = tokenUrl("/verify-email", token);
  await sendEmail({
    to: email,
    subject: "Verify your Community Tutors email",
    text: `Hi ${displayName ?? "there"}, verify your email: ${link}`,
    html: `<p>Hi ${displayName ?? "there"},</p><p>Verify your email to activate your Community Tutors account.</p><p><a href="${link}">Verify email</a></p>`,
  });
}

async function sendPasswordResetEmail(email: string, displayName: string | null, token: string) {
  const link = tokenUrl("/reset-password", token);
  await sendEmail({
    to: email,
    subject: "Reset your Community Tutors password",
    text: `Hi ${displayName ?? "there"}, reset your password: ${link}`,
    html: `<p>Hi ${displayName ?? "there"},</p><p>Use this link to reset your password. It expires in one hour.</p><p><a href="${link}">Reset password</a></p>`,
  });
}

export async function registerUser(input: RegisterUserInput) {
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, PASSWORD_HASH_COST);
  const emailToken = randomToken();
  const emailTokenHash = hashToken(emailToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        legalName: input.legalName.trim(),
        displayName: input.displayName.trim(),
        phone: input.phone?.trim() || null,
        role: input.role,
        status: "PENDING_VERIFICATION",
        country: input.country?.trim() || null,
        city: input.city?.trim() || null,
        timezone: input.timezone?.trim() || null,
      },
      select: publicUserSelect,
    });

    await createRoleProfileStub(tx, user);
    await tx.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: emailTokenHash,
        expiresAt,
      },
    });

    return user;
  });

  await sendVerificationEmail(created.email, created.displayName, emailToken);

  return {
    user: created,
    message: "Registration successful. Check your email to verify your account.",
  };
}

export async function verifyEmail(token: string) {
  const tokenHash = hashToken(token);
  const now = new Date();
  const verificationToken = await prisma.emailVerificationToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
    select: { id: true, userId: true },
  });

  if (!verificationToken) {
    throw new Error("Email verification token is invalid or expired.");
  }

  const user = await prisma.$transaction(async (tx) => {
    const tokenUpdate = await tx.emailVerificationToken.updateMany({
      where: { id: verificationToken.id, usedAt: null },
      data: { usedAt: now },
    });
    if (tokenUpdate.count !== 1) {
      throw new Error("Email verification token has already been used.");
    }

    const current = await tx.user.findUniqueOrThrow({
      where: { id: verificationToken.userId },
      select: { status: true },
    });

    return tx.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: now,
        status: current.status === "PENDING_VERIFICATION" ? "ACTIVE" : current.status,
      },
      select: publicUserSelect,
    });
  });

  return { user, message: "Email verified successfully." };
}

export async function requestPasswordReset(emailInput: string) {
  try {
    const email = normalizeEmail(emailInput);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        passwordHash: true,
        status: true,
      },
    });

    if (user?.passwordHash && user.status !== "DELETED" && user.status !== "BANNED") {
      const token = randomToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
        },
      });
      await sendPasswordResetEmail(user.email, user.displayName, token);
    }
  } catch (error) {
    console.error("Password reset request failed", error);
  }

  return { message: PASSWORD_RESET_SUCCESS };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const now = new Date();
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
    select: { id: true, userId: true },
  });

  if (!resetToken) {
    throw new Error("Password reset token is invalid or expired.");
  }

  const passwordHash = await bcrypt.hash(newPassword, PASSWORD_HASH_COST);
  const user = await prisma.$transaction(async (tx) => {
    const tokenUpdate = await tx.passwordResetToken.updateMany({
      where: { id: resetToken.id, usedAt: null },
      data: { usedAt: now },
    });
    if (tokenUpdate.count !== 1) {
      throw new Error("Password reset token has already been used.");
    }

    return tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
      select: publicUserSelect,
    });
  });

  return { user, message: "Password reset successfully." };
}

export async function deactivateAccount(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      status: "DEACTIVATED",
      deactivatedAt: new Date(),
    },
    select: publicUserSelect,
  });
}

export async function softDeleteAccount(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      status: "DELETED",
      deletedAt: new Date(),
      deactivatedAt: new Date(),
    },
    select: publicUserSelect,
  });
}
