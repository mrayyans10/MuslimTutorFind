import type { Prisma } from "@prisma/client";

import type { TutorCardData } from "@/components/tutors/tutor-card";

type TutorWithRelations = Prisma.TutorProfileGetPayload<{
  include: {
    user: { select: { displayName: true; legalName: true; image: true } };
    subjects: {
      include: {
        subject: { select: { name: true } };
      };
    };
    location: true;
  };
}>;

export function mapTutorToCard(tutor: TutorWithRelations): TutorCardData {
  const rates = tutor.subjects.map((s) => Number(s.hourlyRate));
  const minRate = rates.length > 0 ? Math.min(...rates) : 0;
  const currency = tutor.subjects[0]?.currency ?? "CAD";
  const online =
    tutor.location?.onlineAvailable ??
    tutor.subjects.some((s) => s.onlineAvailable);
  const inPerson =
    tutor.location?.inPersonAvailable ??
    tutor.subjects.some((s) => s.inPersonAvailable);

  const locationParts = [
    tutor.location?.city,
    tutor.location?.region,
    tutor.location?.country,
  ].filter(Boolean);

  return {
    id: tutor.id,
    slug: tutor.slug,
    displayName: tutor.user.displayName ?? tutor.user.legalName ?? "Tutor",
    headline: tutor.headline ?? "Academic tutor",
    photoUrl: tutor.user.image,
    subjects: tutor.subjects.map((s) => s.subject.name),
    location: locationParts.length > 0 ? locationParts.join(", ") : null,
    onlineAvailable: online,
    inPersonAvailable: inPerson,
    hourlyRate: minRate,
    currency,
    averageRating: tutor.averageRating,
    reviewCount: tutor.reviewCount,
    isVerified: tutor.isVerified,
    bio: tutor.biography ?? "",
  };
}

export function formatLearnerLevel(level: string) {
  return level
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatTeachingStyle(style: string) {
  return style
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDayOfWeek(day: string) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export function formatTimePeriod(period: string) {
  return period.charAt(0) + period.slice(1).toLowerCase();
}
