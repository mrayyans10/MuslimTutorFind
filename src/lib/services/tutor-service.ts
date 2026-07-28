import slugify from "slugify";
import type { DayOfWeek, LearnerLevel, Prisma, TeachingStyle, TimePeriod } from "@prisma/client";
import { prisma } from "@/lib/db";
import { containsProhibitedSubject } from "@/lib/moderation/prohibited-subjects";

type QualificationInput = {
  title: string;
  institution?: string | null;
  year?: number | null;
  description?: string | null;
};

type CertificationInput = {
  name: string;
  issuer?: string | null;
  year?: number | null;
};

type LanguageInput = {
  language: string;
  proficiency: string;
};

type AvailabilityInput = {
  dayOfWeek: DayOfWeek;
  period: TimePeriod;
  timeRangeNote?: string | null;
};

type LocationInput = {
  onlineAvailable?: boolean;
  inPersonAvailable?: boolean;
  tutorTravels?: boolean;
  studentTravels?: boolean;
  publicMeetingOk?: boolean;
  travelRadiusKm?: number | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  approximateArea?: string | null;
  latitudeApprox?: number | null;
  longitudeApprox?: number | null;
  privateAddressNote?: string | null;
};

type TutorDraftInput = {
  userId?: string;
  displayName?: string;
  headline?: string | null;
  biography?: string | null;
  teachingApproach?: string | null;
  yearsExperience?: number;
  currentOccupation?: string | null;
  educationSummary?: string | null;
  teachingStyles?: TeachingStyle[];
  communityAttested?: boolean;
  secularSubjectsOnly?: boolean;
  conductAgreed?: boolean;
  noReligiousInstruction?: boolean;
  termsAccepted?: boolean;
  guidelinesAccepted?: boolean;
  gender?: string | null;
  qualifications?: QualificationInput[];
  certifications?: CertificationInput[];
  languages?: LanguageInput[];
  availability?: AvailabilityInput[];
  location?: LocationInput;
};

type TutorSubjectInput = {
  tutorProfileId: string;
  subjectId: string;
  specializationId?: string | null;
  curriculumId?: string | null;
  minLevel: LearnerLevel;
  maxLevel: LearnerLevel;
  yearsExperience?: number;
  onlineAvailable?: boolean;
  inPersonAvailable?: boolean;
  individualTutoring?: boolean;
  homeworkGuidance?: boolean;
  examPreparation?: boolean;
  projectGuidance?: boolean;
  hourlyRate: number;
  currency?: string;
  note?: string | null;
};

const editableDraftStatuses = new Set(["DRAFT", "CHANGES_REQUESTED", "REJECTED"]);

export function slugifyDisplayName(displayName: string) {
  return slugify(displayName, { lower: true, strict: true, trim: true }) || "tutor";
}

async function uniqueTutorSlug(displayName: string, excludeTutorProfileId?: string) {
  const base = slugifyDisplayName(displayName);
  let candidate = base;
  let suffix = 1;

  while (
    await prisma.tutorProfile.findFirst({
      where: {
        slug: candidate,
        ...(excludeTutorProfileId ? { id: { not: excludeTutorProfileId } } : {}),
      },
      select: { id: true },
    })
  ) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

function buildSearchDocument(input: TutorDraftInput) {
  return [
    input.displayName,
    input.headline,
    input.biography,
    input.teachingApproach,
    input.currentOccupation,
    input.educationSummary,
    ...(input.qualifications?.map((q) => `${q.title} ${q.institution ?? ""}`) ?? []),
    ...(input.certifications?.map((c) => `${c.name} ${c.issuer ?? ""}`) ?? []),
    ...(input.languages?.map((l) => l.language) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function tutorDraftUpdateData(input: TutorDraftInput): Prisma.TutorProfileUpdateInput {
  const data: Prisma.TutorProfileUpdateInput = {};

  if (input.headline !== undefined) data.headline = input.headline;
  if (input.biography !== undefined) data.biography = input.biography;
  if (input.teachingApproach !== undefined) data.teachingApproach = input.teachingApproach;
  if (input.yearsExperience !== undefined) data.yearsExperience = input.yearsExperience;
  if (input.currentOccupation !== undefined) data.currentOccupation = input.currentOccupation;
  if (input.educationSummary !== undefined) data.educationSummary = input.educationSummary;
  if (input.teachingStyles !== undefined) data.teachingStyles = { set: input.teachingStyles };
  if (input.communityAttested !== undefined) data.communityAttested = input.communityAttested;
  if (input.secularSubjectsOnly !== undefined) data.secularSubjectsOnly = input.secularSubjectsOnly;
  if (input.conductAgreed !== undefined) data.conductAgreed = input.conductAgreed;
  if (input.noReligiousInstruction !== undefined) data.noReligiousInstruction = input.noReligiousInstruction;
  if (input.termsAccepted) data.termsAcceptedAt = new Date();
  if (input.guidelinesAccepted) data.guidelinesAcceptedAt = new Date();
  if (input.gender !== undefined) data.gender = input.gender;

  const searchDocument = buildSearchDocument(input);
  if (searchDocument) data.searchDocument = searchDocument;

  return data;
}

async function replaceDraftRelations(tx: Prisma.TransactionClient, tutorProfileId: string, input: TutorDraftInput) {
  if (input.qualifications) {
    await tx.tutorQualification.deleteMany({ where: { tutorProfileId } });
    if (input.qualifications.length > 0) {
      await tx.tutorQualification.createMany({
        data: input.qualifications.map((qualification) => ({
          tutorProfileId,
          title: qualification.title.trim(),
          institution: qualification.institution?.trim() || null,
          year: qualification.year ?? null,
          description: qualification.description?.trim() || null,
        })),
      });
    }
  }

  if (input.certifications) {
    await tx.tutorCertification.deleteMany({ where: { tutorProfileId } });
    if (input.certifications.length > 0) {
      await tx.tutorCertification.createMany({
        data: input.certifications.map((certification) => ({
          tutorProfileId,
          name: certification.name.trim(),
          issuer: certification.issuer?.trim() || null,
          year: certification.year ?? null,
        })),
      });
    }
  }

  if (input.languages) {
    await tx.tutorLanguage.deleteMany({ where: { tutorProfileId } });
    if (input.languages.length > 0) {
      await tx.tutorLanguage.createMany({
        data: input.languages.map((language) => ({
          tutorProfileId,
          language: language.language.trim(),
          proficiency: language.proficiency.trim(),
        })),
        skipDuplicates: true,
      });
    }
  }

  if (input.availability) {
    await tx.tutorGeneralAvailability.deleteMany({ where: { tutorProfileId } });
    if (input.availability.length > 0) {
      await tx.tutorGeneralAvailability.createMany({
        data: input.availability.map((availability) => ({
          tutorProfileId,
          dayOfWeek: availability.dayOfWeek,
          period: availability.period,
          timeRangeNote: availability.timeRangeNote?.trim() || null,
        })),
        skipDuplicates: true,
      });
    }
  }

  if (input.location) {
    await tx.tutorLocation.upsert({
      where: { tutorProfileId },
      create: {
        tutorProfileId,
        onlineAvailable: input.location.onlineAvailable ?? true,
        inPersonAvailable: input.location.inPersonAvailable ?? false,
        tutorTravels: input.location.tutorTravels ?? false,
        studentTravels: input.location.studentTravels ?? false,
        publicMeetingOk: input.location.publicMeetingOk ?? true,
        travelRadiusKm: input.location.travelRadiusKm ?? null,
        city: input.location.city?.trim() || null,
        region: input.location.region?.trim() || null,
        country: input.location.country?.trim() || null,
        approximateArea: input.location.approximateArea?.trim() || null,
        latitudeApprox: input.location.latitudeApprox ?? null,
        longitudeApprox: input.location.longitudeApprox ?? null,
        privateAddressNote: input.location.privateAddressNote?.trim() || null,
      },
      update: {
        ...input.location,
        city: input.location.city?.trim() || null,
        region: input.location.region?.trim() || null,
        country: input.location.country?.trim() || null,
        approximateArea: input.location.approximateArea?.trim() || null,
        privateAddressNote: input.location.privateAddressNote?.trim() || null,
      },
    });
  }
}

export async function createTutorProfileDraft(input: TutorDraftInput & { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, displayName: true, legalName: true },
  });
  if (!user || user.role !== "TUTOR") {
    throw new Error("Only tutor users can create tutor profiles.");
  }

  const existing = await prisma.tutorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (existing) {
    return updateTutorProfileDraft(existing.id, input);
  }

  const displayName = input.displayName?.trim() || user.displayName || user.legalName || "Tutor";
  const slug = await uniqueTutorSlug(displayName);

  return prisma.$transaction(async (tx) => {
    if (input.displayName) {
      await tx.user.update({
        where: { id: user.id },
        data: { displayName: input.displayName.trim() },
      });
    }

    const profile = await tx.tutorProfile.create({
      data: {
        userId: user.id,
        slug,
        headline: input.headline ?? null,
        biography: input.biography ?? null,
        teachingApproach: input.teachingApproach ?? null,
        yearsExperience: input.yearsExperience ?? 0,
        currentOccupation: input.currentOccupation ?? null,
        educationSummary: input.educationSummary ?? null,
        teachingStyles: input.teachingStyles ?? [],
        communityAttested: input.communityAttested ?? false,
        secularSubjectsOnly: input.secularSubjectsOnly ?? false,
        conductAgreed: input.conductAgreed ?? false,
        noReligiousInstruction: input.noReligiousInstruction ?? false,
        termsAcceptedAt: input.termsAccepted ? new Date() : null,
        guidelinesAcceptedAt: input.guidelinesAccepted ? new Date() : null,
        gender: input.gender ?? null,
        searchDocument: buildSearchDocument(input) || null,
      },
    });

    await replaceDraftRelations(tx, profile.id, input);
    return profile;
  });
}

export async function updateTutorProfileDraft(tutorProfileId: string, input: TutorDraftInput) {
  const profile = await prisma.tutorProfile.findUnique({
    where: { id: tutorProfileId },
    select: { id: true, status: true, userId: true, slug: true },
  });
  if (!profile) throw new Error("Tutor profile not found.");
  if (!editableDraftStatuses.has(profile.status)) {
    throw new Error("Tutor profile cannot be edited while it is submitted or approved.");
  }

  const data = tutorDraftUpdateData(input);
  if (input.displayName) {
    data.slug = await uniqueTutorSlug(input.displayName, profile.id);
  }

  return prisma.$transaction(async (tx) => {
    if (input.displayName) {
      await tx.user.update({
        where: { id: profile.userId },
        data: { displayName: input.displayName.trim() },
      });
    }

    const updated = await tx.tutorProfile.update({
      where: { id: profile.id },
      data,
    });

    await replaceDraftRelations(tx, profile.id, input);
    return updated;
  });
}

export async function addTutorSubject(input: TutorSubjectInput) {
  const subject = await prisma.subject.findUnique({
    where: { id: input.subjectId },
    select: {
      id: true,
      name: true,
      aliases: true,
      specializations: {
        where: input.specializationId ? { id: input.specializationId } : { id: "__none__" },
        select: { name: true },
      },
    },
  });
  if (!subject) throw new Error("Subject not found.");

  const prohibited = await containsProhibitedSubject(
    subject.name,
    subject.aliases.join(" "),
    subject.specializations[0]?.name,
    input.note,
  );
  if (prohibited.prohibited) {
    throw new Error(`Religious instruction subjects are not allowed (${prohibited.matchedTerm}).`);
  }

  return prisma.tutorSubject.create({
    data: {
      tutorProfileId: input.tutorProfileId,
      subjectId: input.subjectId,
      specializationId: input.specializationId ?? null,
      curriculumId: input.curriculumId ?? null,
      minLevel: input.minLevel,
      maxLevel: input.maxLevel,
      yearsExperience: input.yearsExperience ?? 0,
      onlineAvailable: input.onlineAvailable ?? true,
      inPersonAvailable: input.inPersonAvailable ?? false,
      individualTutoring: input.individualTutoring ?? true,
      homeworkGuidance: input.homeworkGuidance ?? true,
      examPreparation: input.examPreparation ?? true,
      projectGuidance: input.projectGuidance ?? false,
      hourlyRate: input.hourlyRate,
      currency: input.currency ?? "CAD",
    },
  });
}

export async function submitTutorProfileForApproval(tutorProfileId: string) {
  const profile = await prisma.tutorProfile.findUnique({
    where: { id: tutorProfileId },
    include: {
      subjects: { select: { id: true } },
      location: { select: { id: true } },
    },
  });
  if (!profile) throw new Error("Tutor profile not found.");
  if (!editableDraftStatuses.has(profile.status)) {
    throw new Error("Tutor profile is already submitted or approved.");
  }
  if (
    !profile.communityAttested ||
    !profile.secularSubjectsOnly ||
    !profile.conductAgreed ||
    !profile.noReligiousInstruction ||
    !profile.termsAcceptedAt ||
    !profile.guidelinesAcceptedAt
  ) {
    throw new Error("Complete community eligibility confirmations before submitting.");
  }
  if (profile.subjects.length === 0) {
    throw new Error("Add at least one secular subject before submitting.");
  }
  if (!profile.location) {
    throw new Error("Add tutoring location preferences before submitting.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        rejectionReason: null,
        changeRequestNotes: null,
      },
    });
    await tx.tutorApplicationReview.create({
      data: {
        tutorProfileId,
        action: "SUBMITTED",
        notes: "Tutor submitted profile for approval.",
      },
    });
    return updated;
  });
}
