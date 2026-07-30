"use server";

import type {
  DayOfWeek,
  LearnerLevel,
  Prisma,
  TimePeriod,
  TutoringMode,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import { mapTutorToCard } from "@/lib/tutors/mappers";

export type TutorSearchFilters = {
  q?: string;
  subject?: string;
  topic?: string;
  level?: LearnerLevel;
  curriculum?: string;
  mode?: TutoringMode;
  country?: string;
  city?: string;
  rateMin?: number;
  rateMax?: number;
  language?: string;
  experience?: number;
  rating?: number;
  verified?: boolean;
  day?: DayOfWeek;
  period?: TimePeriod;
  page?: number;
  pageSize?: number;
};

const approvedTutorWhere = {
  status: "APPROVED" as const,
  deletedAt: null,
  user: { status: "ACTIVE" as const },
};

export async function searchTutors(filters: TutorSearchFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 12));
  const skip = (page - 1) * pageSize;

  const where: Prisma.TutorProfileWhereInput = {
    ...approvedTutorWhere,
    subjects: { some: {} },
  };

  if (filters.q) {
    where.OR = [
      { headline: { contains: filters.q, mode: "insensitive" } },
      { biography: { contains: filters.q, mode: "insensitive" } },
      { searchDocument: { contains: filters.q, mode: "insensitive" } },
      { user: { displayName: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  const subjectWhere: Prisma.TutorSubjectWhereInput = {};
  if (filters.subject) {
    subjectWhere.subject = {
      OR: [
        { slug: filters.subject },
        { id: filters.subject },
        { name: { contains: filters.subject, mode: "insensitive" } },
      ],
    };
  }
  if (filters.topic) {
    subjectWhere.OR = [
      { specialization: { name: { contains: filters.topic, mode: "insensitive" } } },
      { subject: { name: { contains: filters.topic, mode: "insensitive" } } },
    ];
  }
  if (filters.level) {
    subjectWhere.minLevel = { in: getLevelsUpTo(filters.level) };
    subjectWhere.maxLevel = { in: getLevelsFrom(filters.level) };
  }
  if (filters.curriculum) {
    subjectWhere.curriculum = {
      OR: [
        { slug: filters.curriculum },
        { name: { contains: filters.curriculum, mode: "insensitive" } },
      ],
    };
  }
  if (filters.rateMin != null || filters.rateMax != null) {
    subjectWhere.hourlyRate = {
      ...(filters.rateMin != null ? { gte: filters.rateMin } : {}),
      ...(filters.rateMax != null ? { lte: filters.rateMax } : {}),
    };
  }
  if (filters.mode === "ONLINE") {
    subjectWhere.onlineAvailable = true;
  } else if (filters.mode === "IN_PERSON") {
    subjectWhere.inPersonAvailable = true;
  }

  if (Object.keys(subjectWhere).length > 0) {
    where.subjects = { some: subjectWhere };
  }

  if (filters.country) {
    where.location = {
      ...(where.location as Prisma.TutorLocationWhereInput | undefined),
      country: { contains: filters.country, mode: "insensitive" },
    };
  }
  if (filters.city) {
    where.location = {
      ...(where.location as Prisma.TutorLocationWhereInput | undefined),
      city: { contains: filters.city, mode: "insensitive" },
    };
  }
  if (filters.experience != null) {
    where.yearsExperience = { gte: filters.experience };
  }
  if (filters.rating != null) {
    where.averageRating = { gte: filters.rating };
  }
  if (filters.verified) {
    where.isVerified = true;
  }
  if (filters.language) {
    where.languages = {
      some: { language: { contains: filters.language, mode: "insensitive" } },
    };
  }
  if (filters.day || filters.period) {
    where.availability = {
      some: {
        ...(filters.day ? { dayOfWeek: filters.day } : {}),
        ...(filters.period ? { period: filters.period } : {}),
      },
    };
  }

  try {
    const [tutors, total] = await Promise.all([
      prisma.tutorProfile.findMany({
        where,
        include: {
          user: { select: { displayName: true, legalName: true, image: true } },
          subjects: { include: { subject: { select: { name: true } } } },
          location: true,
        },
        orderBy: [{ isVerified: "desc" }, { averageRating: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.tutorProfile.count({ where }),
    ]);

    return {
      tutors: tutors.map(mapTutorToCard),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch {
    return { tutors: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

export async function getFeaturedTutors(limit = 6) {
  try {
    const tutors = await prisma.tutorProfile.findMany({
      where: approvedTutorWhere,
      include: {
        user: { select: { displayName: true, legalName: true, image: true } },
        subjects: { include: { subject: { select: { name: true } } } },
        location: true,
      },
      orderBy: [{ isVerified: "desc" }, { averageRating: "desc" }],
      take: limit,
    });
    return tutors.map(mapTutorToCard);
  } catch {
    return [];
  }
}

export async function getTutorBySlug(slug: string) {
  try {
    return await prisma.tutorProfile.findFirst({
      where: {
        slug,
        status: "APPROVED",
        deletedAt: null,
        user: { status: "ACTIVE" },
      },
      include: {
        user: {
          select: {
            displayName: true,
            legalName: true,
            image: true,
            country: true,
            city: true,
          },
        },
        subjects: {
          include: {
            subject: { select: { id: true, name: true, slug: true } },
            specialization: { select: { name: true } },
            curriculum: { select: { name: true } },
          },
        },
        qualifications: true,
        certifications: true,
        languages: true,
        availability: true,
        location: true,
        reviews: {
          where: { isPublic: true, removedAt: null },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            overallRating: true,
            writtenReview: true,
            createdAt: true,
            author: { select: { displayName: true } },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getSubjectsCatalog() {
  try {
    return await prisma.subjectCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        subjects: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          include: {
            specializations: { where: { isActive: true }, orderBy: { name: "asc" } },
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export async function getSubjectBySlug(slug: string) {
  try {
    return await prisma.subject.findFirst({
      where: { slug, isActive: true },
      include: {
        category: true,
        specializations: { where: { isActive: true }, orderBy: { name: "asc" } },
        curricula: { where: { isActive: true }, orderBy: { name: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function getCurricula() {
  try {
    return await prisma.curriculum.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getPublishedRequirements() {
  try {
    return await prisma.tutoringRequirement.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        subject: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
  } catch {
    return [];
  }
}

const LEVEL_ORDER: LearnerLevel[] = [
  "ELEMENTARY",
  "MIDDLE_SCHOOL",
  "HIGH_SCHOOL",
  "COLLEGE",
  "ADULT",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

function getLevelsUpTo(level: LearnerLevel) {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx >= 0 ? LEVEL_ORDER.slice(0, idx + 1) : LEVEL_ORDER;
}

function getLevelsFrom(level: LearnerLevel) {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx >= 0 ? LEVEL_ORDER.slice(idx) : LEVEL_ORDER;
}
