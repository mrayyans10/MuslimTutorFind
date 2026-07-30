import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { registerUser, requestPasswordReset } from "@/lib/services/auth-service";
import { containsProhibitedSubject } from "@/lib/moderation/prohibited-subjects";
import {
  createTutoringRequirement,
  publishTutoringRequirement,
  applyToRequirement,
} from "@/lib/services/requirement-service";
import { createReview } from "@/lib/services/review-service";
import { blockUser } from "@/lib/services/messaging-service";

const prisma = new PrismaClient();
const suffix = Date.now();

describe("auth and marketplace integration", () => {
  beforeAll(async () => {
    const count = await prisma.subject.count();
    if (count === 0) {
      throw new Error("Run pnpm db:seed before integration tests");
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers student, parent, and tutor accounts", async () => {
    const student = await registerUser({
      email: `student-${suffix}@test.local`,
      password: "Password123!",
      legalName: "Test Student",
      displayName: "Test Student",
      role: "STUDENT",
      country: "Canada",
      city: "Toronto",
    });
    expect(student.user.role).toBe(UserRole.STUDENT);

    const parent = await registerUser({
      email: `parent-${suffix}@test.local`,
      password: "Password123!",
      legalName: "Test Parent",
      displayName: "Test Parent",
      role: "PARENT",
      country: "Canada",
    });
    expect(parent.user.role).toBe(UserRole.PARENT);
    const parentProfile = await prisma.parentProfile.findUnique({ where: { userId: parent.user.id } });
    expect(parentProfile).toBeTruthy();

    const tutor = await registerUser({
      email: `tutor-${suffix}@test.local`,
      password: "Password123!",
      legalName: "Test Tutor",
      displayName: "Test Tutor",
      role: "TUTOR",
      country: "Canada",
      city: "Ottawa",
    });
    expect(tutor.user.role).toBe(UserRole.TUTOR);
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: tutor.user.id } });
    expect(tutorProfile).toBeTruthy();
  });

  it("does not reveal whether an email exists on password reset", async () => {
    const known = await requestPasswordReset("student@example.com");
    const unknown = await requestPasswordReset(`missing-${suffix}@test.local`);
    expect(known.message).toEqual(unknown.message);
  });

  it("rejects prohibited religious subjects", async () => {
    const hit = await containsProhibitedSubject("Looking for Quran Tajweed tutor");
    expect(hit.prohibited).toBe(true);
    const ok = await containsProhibitedSubject("High school calculus homework support");
    expect(ok.prohibited).toBe(false);
  });

  it("creates a requirement and allows approved tutor application without booking", async () => {
    const subject = await prisma.subject.findFirst({ where: { isActive: true } });
    expect(subject).toBeTruthy();
    const student = await prisma.user.findFirst({
      where: { role: "STUDENT", status: "ACTIVE", studentProfile: { isNot: null } },
      include: { studentProfile: true },
    });
    expect(student?.studentProfile).toBeTruthy();

    const requirement = await createTutoringRequirement({
      studentProfileId: student!.studentProfile!.id,
      whoNeedsHelp: "Myself",
      subjectId: subject!.id,
      topic: "Algebra review",
      learnerLevel: "HIGH_SCHOOL",
      mode: "ONLINE",
      description: "Secular academic algebra support for tests.",
    });
    expect(requirement.status).toBe("DRAFT");

    const published = await publishTutoringRequirement(requirement.id, student!.id);
    expect(published.status).toBe("PUBLISHED");

    const approvedTutor = await prisma.tutorProfile.findFirst({
      where: { status: "APPROVED", deletedAt: null },
    });
    expect(approvedTutor).toBeTruthy();

    const application = await applyToRequirement({
      tutorProfileId: approvedTutor!.id,
      requirementId: requirement.id,
      introduction: "I can help with algebra.",
      proposedHourlyRate: 40,
      currency: "CAD",
    });
    expect(application.id).toBeTruthy();
    expect(application.status).toBe("SUBMITTED");
  });

  it("blocks review creation without eligibility", async () => {
    const student = await prisma.user.findFirst({ where: { role: "STUDENT", status: UserStatus.ACTIVE } });
    await expect(
      createReview({
        eligibilityId: "nonexistent-eligibility",
        authorId: student!.id,
        overallRating: 5,
        writtenReview: "Great tutor",
      }),
    ).rejects.toThrow(/eligibility/i);
  });

  it("supports blocking users", async () => {
    const a = await prisma.user.findFirst({ where: { email: "student@example.com" } });
    const b = await prisma.user.findFirst({ where: { email: "tutor2@example.com" } });
    expect(a && b).toBeTruthy();
    await blockUser(a!.id, b!.id);
    const row = await prisma.userBlock.findUnique({
      where: { blockerId_blockedId: { blockerId: a!.id, blockedId: b!.id } },
    });
    expect(row).toBeTruthy();
  });

  it("hashes passwords for credential users", async () => {
    const user = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
    expect(user?.passwordHash).toBeTruthy();
    expect(await bcrypt.compare("Password123!", user!.passwordHash!)).toBe(true);
  });
});
