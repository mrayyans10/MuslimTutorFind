/**
 * Seed script — fictional demo data only.
 * No real tutor identities or copyrighted photos.
 */
import {
  PrismaClient,
  UserRole,
  UserStatus,
  TutorProfileStatus,
  VerificationStatus,
  TutoringMode,
  LearnerLevel,
  LearningGoal,
  DayOfWeek,
  TimePeriod,
  TeachingStyle,
  RequirementStatus,
  ApplicationStatus,
  Urgency,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Mathematics",
    slug: "mathematics",
    subjects: [
      ["Arithmetic", "arithmetic"],
      ["Algebra", "algebra"],
      ["Geometry", "geometry"],
      ["Trigonometry", "trigonometry"],
      ["Calculus", "calculus"],
      ["Statistics", "statistics"],
      ["Applied mathematics", "applied-mathematics"],
    ],
  },
  {
    name: "Science",
    slug: "science",
    subjects: [
      ["General science", "general-science"],
      ["Physics", "physics"],
      ["Chemistry", "chemistry"],
      ["Biology", "biology"],
      ["Environmental science", "environmental-science"],
    ],
  },
  {
    name: "English",
    slug: "english",
    subjects: [
      ["Reading", "reading"],
      ["Writing", "writing"],
      ["Grammar", "grammar"],
      ["Essay writing", "essay-writing"],
      ["Literature", "literature"],
      ["English as a second language", "esl"],
      ["Business English", "business-english"],
    ],
  },
  {
    name: "Computer science",
    slug: "computer-science",
    subjects: [
      ["Computer basics", "computer-basics"],
      ["Programming", "programming"],
      ["Python", "python"],
      ["JavaScript", "javascript"],
      ["Java", "java"],
      ["C++", "cpp"],
      ["Web development", "web-development"],
      ["Data structures", "data-structures"],
      ["Algorithms", "algorithms"],
      ["Databases", "databases"],
    ],
  },
  {
    name: "Business",
    slug: "business",
    subjects: [
      ["Accounting", "accounting"],
      ["Economics", "economics"],
      ["Finance", "finance"],
      ["Marketing", "marketing"],
      ["Business studies", "business-studies"],
    ],
  },
  {
    name: "Test preparation",
    slug: "test-preparation",
    subjects: [
      ["SAT", "sat"],
      ["ACT", "act"],
      ["AP", "ap"],
      ["GCSE", "gcse"],
      ["IGCSE", "igcse"],
      ["A-level", "a-level"],
      ["IB", "ib"],
      ["Provincial exams", "provincial-exams"],
      ["University entrance exams", "university-entrance"],
    ],
  },
] as const;

const curricula = [
  ["Ontario curriculum", "ontario"],
  ["Common Core", "common-core"],
  ["GCSE", "gcse-curriculum"],
  ["IGCSE", "igcse-curriculum"],
  ["A-level", "a-level-curriculum"],
  ["IB", "ib-curriculum"],
  ["AP", "ap-curriculum"],
  ["CBSE", "cbse"],
  ["ICSE", "icse"],
  ["University course", "university-course"],
];

const prohibited = [
  "Quran",
  "Tajweed",
  "Hadith",
  "Tafsir",
  "Fiqh",
  "Aqeedah",
  "Islamic studies",
  "Islamic jurisprudence",
  "Fatwa",
  "Religious counselling",
  "Religious instruction",
];

const tutorSeeds = [
  { name: "Amina Rahman", city: "Toronto", country: "Canada", subject: "calculus", rate: 45, verified: true, years: 8, mode: "both", style: ["PATIENT_ENCOURAGING", "STRUCTURED_ORGANIZED"] as TeachingStyle[] },
  { name: "Yusuf Hassan", city: "Mississauga", country: "Canada", subject: "physics", rate: 50, verified: true, years: 10, mode: "online", style: ["EXAM_FOCUSED", "STRUCTURED_ORGANIZED"] as TeachingStyle[] },
  { name: "Fatima Noor", city: "Ottawa", country: "Canada", subject: "biology", rate: 40, verified: true, years: 6, mode: "both", style: ["PATIENT_ENCOURAGING", "INTERACTIVE"] as TeachingStyle[] },
  { name: "Omar Siddiqui", city: "Vancouver", country: "Canada", subject: "python", rate: 55, verified: true, years: 7, mode: "online", style: ["PROJECT_BASED", "FLEXIBLE_ADAPTIVE"] as TeachingStyle[] },
  { name: "Layla Karim", city: "London", country: "United Kingdom", subject: "essay-writing", rate: 42, verified: true, years: 9, mode: "both", style: ["PATIENT_ENCOURAGING", "STRUCTURED_ORGANIZED"] as TeachingStyle[] },
  { name: "Bilal Ahmed", city: "Manchester", country: "United Kingdom", subject: "chemistry", rate: 48, verified: false, years: 4, mode: "inperson", style: ["EXAM_FOCUSED"] as TeachingStyle[] },
  { name: "Hana Yusuf", city: "Birmingham", country: "United Kingdom", subject: "algebra", rate: 38, verified: true, years: 5, mode: "online", style: ["PATIENT_ENCOURAGING", "INTERACTIVE"] as TeachingStyle[] },
  { name: "Ibrahim Malik", city: "Chicago", country: "United States", subject: "sat", rate: 60, verified: true, years: 12, mode: "online", style: ["EXAM_FOCUSED", "STRUCTURED_ORGANIZED"] as TeachingStyle[] },
  { name: "Maryam Qureshi", city: "Houston", country: "United States", subject: "statistics", rate: 52, verified: true, years: 8, mode: "both", style: ["STRUCTURED_ORGANIZED"] as TeachingStyle[] },
  { name: "Zayd Farooq", city: "Seattle", country: "United States", subject: "javascript", rate: 58, verified: false, years: 3, mode: "online", style: ["PROJECT_BASED", "INTERACTIVE"] as TeachingStyle[] },
  { name: "Sara Ismail", city: "Sydney", country: "Australia", subject: "economics", rate: 47, verified: true, years: 7, mode: "both", style: ["FLEXIBLE_ADAPTIVE"] as TeachingStyle[] },
  { name: "Hamza Raza", city: "Melbourne", country: "Australia", subject: "accounting", rate: 44, verified: true, years: 6, mode: "online", style: ["STRUCTURED_ORGANIZED", "EXAM_FOCUSED"] as TeachingStyle[] },
  { name: "Nadia Sharif", city: "Auckland", country: "New Zealand", subject: "literature", rate: 41, verified: false, years: 5, mode: "both", style: ["PATIENT_ENCOURAGING"] as TeachingStyle[] },
  { name: "Tariq Abbas", city: "Dubai", country: "United Arab Emirates", subject: "ib", rate: 65, verified: true, years: 11, mode: "online", style: ["EXAM_FOCUSED", "STRUCTURED_ORGANIZED"] as TeachingStyle[] },
  { name: "Rania Saleh", city: "Abu Dhabi", country: "United Arab Emirates", subject: "grammar", rate: 43, verified: true, years: 6, mode: "both", style: ["PATIENT_ENCOURAGING", "INTERACTIVE"] as TeachingStyle[] },
  { name: "Khalid Mehmood", city: "Lahore", country: "Pakistan", subject: "data-structures", rate: 30, verified: true, years: 9, mode: "online", style: ["PROJECT_BASED", "STRUCTURED_ORGANIZED"] as TeachingStyle[] },
  { name: "Ayesha Iqbal", city: "Karachi", country: "Pakistan", subject: "writing", rate: 28, verified: false, years: 4, mode: "online", style: ["FLEXIBLE_ADAPTIVE"] as TeachingStyle[] },
  { name: "Mustafa Khan", city: "Islamabad", country: "Pakistan", subject: "mathematics", rate: 32, verified: true, years: 10, mode: "both", style: ["EXAM_FOCUSED", "PATIENT_ENCOURAGING"] as TeachingStyle[], subjectSlug: "algebra" },
  { name: "Sana Parvez", city: "Kuala Lumpur", country: "Malaysia", subject: "biology", rate: 35, verified: true, years: 5, mode: "online", style: ["INTERACTIVE"] as TeachingStyle[] },
  { name: "Rayyan Chowdhury", city: "Dhaka", country: "Bangladesh", subject: "programming", rate: 27, verified: true, years: 6, mode: "online", style: ["PROJECT_BASED"] as TeachingStyle[] },
  { name: "Leila Haddad", city: "Montreal", country: "Canada", subject: "french", rate: 40, verified: false, years: 8, mode: "both", style: ["PATIENT_ENCOURAGING"], subjectSlug: "esl" },
  { name: "Adam Jaber", city: "Calgary", country: "Canada", subject: "geometry", rate: 39, verified: true, years: 4, mode: "inperson", style: ["STRUCTURED_ORGANIZED"] as TeachingStyle[] },
  { name: "Noor Elamin", city: "Edmonton", country: "Canada", subject: "chemistry", rate: 46, verified: true, years: 7, mode: "online", style: ["EXAM_FOCUSED", "INTERACTIVE"] as TeachingStyle[] },
  { name: "Samir Patel", city: "Winnipeg", country: "Canada", subject: "databases", rate: 50, verified: true, years: 9, mode: "online", style: ["PROJECT_BASED", "FLEXIBLE_ADAPTIVE"] as TeachingStyle[] },
  { name: "Yasmin Osman", city: "Halifax", country: "Canada", subject: "history", rate: 37, verified: false, years: 5, mode: "both", style: ["PATIENT_ENCOURAGING"], subjectSlug: "literature" },
  { name: "Farid Alami", city: "Paris", country: "France", subject: "algorithms", rate: 55, verified: true, years: 8, mode: "online", style: ["STRUCTURED_ORGANIZED"] as TeachingStyle[] },
  { name: "Amira Benali", city: "Brussels", country: "Belgium", subject: "finance", rate: 49, verified: true, years: 6, mode: "both", style: ["EXAM_FOCUSED"] as TeachingStyle[] },
];

async function main() {
  console.log("Seeding Community Tutors demo data...");
  const passwordHash = await bcrypt.hash("Password123!", 12);

  await prisma.matchFactor.deleteMany();
  await prisma.tutorMatch.deleteMany();
  await prisma.findTutorQuestionnaire.deleteMany();
  await prisma.messageAttachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.reviewResponse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reviewEligibility.deleteMany();
  await prisma.tutorRequirementApplication.deleteMany();
  await prisma.tutoringRequirement.deleteMany();
  await prisma.verificationDocument.deleteMany();
  await prisma.tutorVerification.deleteMany();
  await prisma.tutorApplicationReview.deleteMany();
  await prisma.tutorGeneralAvailability.deleteMany();
  await prisma.tutorLanguage.deleteMany();
  await prisma.tutorCertification.deleteMany();
  await prisma.tutorQualification.deleteMany();
  await prisma.tutorSubject.deleteMany();
  await prisma.tutorLocation.deleteMany();
  await prisma.tutorProfile.deleteMany();
  await prisma.parentChildRelationship.deleteMany();
  await prisma.childProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.userReport.deleteMany();
  await prisma.userBlock.deleteMany();
  await prisma.moderationCase.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.specialization.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.subjectCategory.deleteMany();
  await prisma.curriculum.deleteMany();
  await prisma.prohibitedSubject.deleteMany();
  await prisma.communityGuideline.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.featureFlag.deleteMany();

  for (const term of prohibited) {
    await prisma.prohibitedSubject.create({
      data: {
        term,
        aliases: [term.toLowerCase()],
        reason: "Religious instruction is outside the scope of this platform.",
      },
    });
  }

  const curriculumMap = new Map<string, string>();
  for (const [name, slug] of curricula) {
    const row = await prisma.curriculum.create({ data: { name, slug } });
    curriculumMap.set(slug, row.id);
  }

  const subjectBySlug = new Map<string, { id: string; name: string; slug: string }>();
  let sort = 0;
  for (const cat of categories) {
    const category = await prisma.subjectCategory.create({
      data: { name: cat.name, slug: cat.slug, sortOrder: sort++ },
    });
    for (const [name, slug] of cat.subjects) {
      const subject = await prisma.subject.create({
        data: {
          name,
          slug,
          categoryId: category.id,
          aliases: [name.toLowerCase()],
        },
      });
      subjectBySlug.set(slug, { id: subject.id, name, slug });
      // specializations: use subject name as default specialization
      await prisma.specialization.create({
        data: {
          subjectId: subject.id,
          name: `${name} fundamentals`,
          slug: `${slug}-fundamentals`,
        },
      });
    }
  }

  // Fix math subject alias for seed that referenced "mathematics"
  const algebra = subjectBySlug.get("algebra")!;

  await prisma.siteSetting.createMany({
    data: [
      {
        key: "matching.weights",
        value: {
          topic: 18,
          curriculum: 12,
          learningGoal: 10,
          schedule: 10,
          budget: 12,
          language: 8,
          qualifications: 8,
          teachingStyle: 6,
          experience: 6,
          verification: 5,
          rating: 5,
        },
      },
      {
        key: "reviews.minCommunicationDays",
        value: 3,
      },
      {
        key: "features.genderPreference",
        value: true,
      },
    ],
  });

  await prisma.featureFlag.createMany({
    data: [
      { key: "google_sign_in", enabled: Boolean(process.env.AUTH_GOOGLE_ID), description: "Google OAuth" },
      { key: "find_your_tutor", enabled: true, description: "Guided matching questionnaire" },
    ],
  });

  await prisma.communityGuideline.createMany({
    data: [
      {
        title: "Respectful communication",
        slug: "respectful-communication",
        body: "Treat every student, parent, and tutor with courtesy. Harassment and insults are not allowed.",
        sortOrder: 1,
      },
      {
        title: "Secular academic tutoring only",
        slug: "secular-only",
        body: "Community Tutors is only for secular academic subjects. Religious instruction of any kind is prohibited.",
        sortOrder: 2,
      },
      {
        title: "Academic integrity",
        slug: "academic-integrity",
        body: "Do not request or offer exam cheating, ghostwriting of graded work, or impersonation.",
        sortOrder: 3,
      },
      {
        title: "Child safety",
        slug: "child-safety",
        body: "Protect minors. Do not share exact addresses publicly. Parents may review communications involving their children.",
        sortOrder: 4,
      },
      {
        title: "Honest qualifications and reviews",
        slug: "honest-credentials",
        body: "Do not invent credentials or submit fake reviews.",
        sortOrder: 5,
      },
    ],
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash,
      legalName: "Site Administrator",
      displayName: "Admin",
      role: UserRole.ADMINISTRATOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      country: "Canada",
      city: "Toronto",
    },
  });

  await prisma.user.create({
    data: {
      email: "moderator@example.com",
      passwordHash,
      legalName: "Community Moderator",
      displayName: "Moderator",
      role: UserRole.MODERATOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      country: "Canada",
      city: "Ottawa",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@example.com",
      passwordHash,
      legalName: "Demo Student",
      displayName: "Demo Student",
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      country: "Canada",
      city: "Toronto",
      studentProfile: {
        create: {
          ageBand: "16-18",
          schoolLevel: "High school",
          preferredSubjects: ["Mathematics", "Physics"],
          preferredLanguage: "English",
          tutoringMode: TutoringMode.ONLINE,
        },
      },
    },
    include: { studentProfile: true },
  });

  const parentUser = await prisma.user.create({
    data: {
      email: "parent@example.com",
      passwordHash,
      legalName: "Demo Parent",
      displayName: "Demo Parent",
      role: UserRole.PARENT,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      country: "Canada",
      city: "Mississauga",
      phone: "+1-555-0100",
      parentProfile: {
        create: {
          phone: "+1-555-0100",
        },
      },
    },
    include: { parentProfile: true },
  });

  const child = await prisma.childProfile.create({
    data: {
      displayNickname: "Zain",
      privateLegalName: "Private Child Name",
      ageBand: "11-13",
      gradeLevel: "Grade 7",
      subjects: ["Mathematics", "English"],
      curriculum: "Ontario curriculum",
      learningGoals: "Build confidence in algebra",
      preferredLanguage: "English",
    },
  });

  await prisma.parentChildRelationship.create({
    data: {
      parentId: parentUser.parentProfile!.id,
      childId: child.id,
    },
  });

  const days: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const periods: TimePeriod[] = ["AFTERNOON", "EVENING"];

  const createdTutors: { profileId: string; userId: string; subjectId: string; rate: number }[] = [];

  for (let i = 0; i < tutorSeeds.length; i++) {
    const t = tutorSeeds[i];
    const slugBase = slugify(t.name, { lower: true, strict: true });
    const subjectSlug = ("subjectSlug" in t && t.subjectSlug ? t.subjectSlug : t.subject) as string;
    const subject = subjectBySlug.get(subjectSlug) ?? algebra;
    const email = `tutor${i + 1}@example.com`;
    const online = t.mode === "online" || t.mode === "both";
    const inPerson = t.mode === "inperson" || t.mode === "both";
    const status = i < 22 ? TutorProfileStatus.APPROVED : TutorProfileStatus.SUBMITTED;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        legalName: t.name,
        displayName: t.name,
        role: UserRole.TUTOR,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        country: t.country,
        city: t.city,
        image: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(t.name)}`,
        tutorProfile: {
          create: {
            slug: slugBase,
            headline: `${subject.name} tutor with ${t.years}+ years of experience`,
            biography: `${t.name} is a fictional demo tutor who helps learners with ${subject.name}. Teaching focuses on clear explanations, practice, and confidence — secular academic support only.`,
            teachingApproach: "Patient explanations, worked examples, and regular check-ins on understanding.",
            yearsExperience: t.years,
            currentOccupation: "Educator",
            educationSummary: "Bachelor's degree in a related academic field (demo data).",
            teachingStyles: t.style as TeachingStyle[],
            communityAttested: true,
            secularSubjectsOnly: true,
            conductAgreed: true,
            noReligiousInstruction: true,
            termsAcceptedAt: new Date(),
            guidelinesAcceptedAt: new Date(),
            status,
            isVerified: t.verified,
            averageRating: t.verified ? 4 + (i % 10) / 10 : 0,
            reviewCount: t.verified ? 3 + (i % 5) : 0,
            approvedAt: status === "APPROVED" ? new Date() : null,
            submittedAt: new Date(),
            searchDocument: `${t.name} ${subject.name} ${t.city} ${t.country}`,
            location: {
              create: {
                onlineAvailable: online,
                inPersonAvailable: inPerson,
                tutorTravels: inPerson,
                studentTravels: inPerson,
                publicMeetingOk: true,
                travelRadiusKm: inPerson ? 15 : null,
                city: t.city,
                region: t.city,
                country: t.country,
                approximateArea: `${t.city} area`,
              },
            },
            languages: {
              create: [
                { language: "English", proficiency: "Native or fluent" },
                ...(i % 3 === 0 ? [{ language: "Arabic", proficiency: "Conversational" }] : []),
              ],
            },
            qualifications: {
              create: [{ title: `B.Sc. related to ${subject.name}`, institution: "Demo University", year: 2015 }],
            },
            certifications: {
              create: t.verified
                ? [{ name: "Demo tutoring certificate", issuer: "Community Tutors demo", year: 2020 }]
                : [],
            },
            availability: {
              create: days.flatMap((day) =>
                periods.map((period) => ({ dayOfWeek: day, period })),
              ),
            },
            subjects: {
              create: [
                {
                  subjectId: subject.id,
                  minLevel: LearnerLevel.MIDDLE_SCHOOL,
                  maxLevel: LearnerLevel.COLLEGE,
                  yearsExperience: t.years,
                  onlineAvailable: online,
                  inPersonAvailable: inPerson,
                  hourlyRate: t.rate,
                  currency: t.country === "United States" ? "USD" : t.country === "United Kingdom" ? "GBP" : "CAD",
                  curriculumId: curriculumMap.get("ontario") ?? undefined,
                  homeworkGuidance: true,
                  examPreparation: true,
                  projectGuidance: subjectSlug.includes("python") || subjectSlug.includes("programming"),
                },
              ],
            },
            verification: {
              create: {
                status: t.verified ? VerificationStatus.VERIFIED : VerificationStatus.SUBMITTED,
                submittedAt: new Date(),
                reviewedAt: t.verified ? new Date() : null,
              },
            },
          },
        },
      },
      include: { tutorProfile: true },
    });

    createdTutors.push({
      profileId: user.tutorProfile!.id,
      userId: user.id,
      subjectId: subject.id,
      rate: t.rate,
    });
  }

  const requirement = await prisma.tutoringRequirement.create({
    data: {
      studentProfileId: studentUser.studentProfile!.id,
      whoNeedsHelp: "Myself",
      subjectId: algebra.id,
      topic: "Quadratic equations",
      learnerLevel: LearnerLevel.HIGH_SCHOOL,
      curriculum: "Ontario curriculum",
      learningGoal: LearningGoal.IMPROVE_GRADES,
      mode: TutoringMode.ONLINE,
      country: "Canada",
      city: "Toronto",
      approximateArea: "Downtown",
      preferredSchedule: "Weekday evenings",
      expectedFrequency: "2 sessions per week",
      budgetMin: 30,
      budgetMax: 55,
      currency: "CAD",
      whenNeeded: Urgency.TWO_WEEKS,
      description: "Looking for help with Grade 11 algebra — quadratic equations and word problems. Secular academic tutoring only.",
      status: RequirementStatus.PUBLISHED,
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  const parentRequirement = await prisma.tutoringRequirement.create({
    data: {
      parentProfileId: parentUser.parentProfile!.id,
      childProfileId: child.id,
      whoNeedsHelp: "My child",
      subjectId: subjectBySlug.get("essay-writing")!.id,
      topic: "Paragraph structure",
      learnerLevel: LearnerLevel.MIDDLE_SCHOOL,
      curriculum: "Ontario curriculum",
      learningGoal: LearningGoal.BUILD_CONFIDENCE,
      mode: TutoringMode.EITHER,
      country: "Canada",
      city: "Mississauga",
      approximateArea: "Square One area",
      preferredSchedule: "Weekend mornings",
      expectedFrequency: "1 session per week",
      budgetMin: 30,
      budgetMax: 50,
      currency: "CAD",
      whenNeeded: Urgency.FEW_DAYS,
      description: "Parent seeking writing support for a middle-school learner. Please do not request exact home address.",
      status: RequirementStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  const app = await prisma.tutorRequirementApplication.create({
    data: {
      requirementId: requirement.id,
      tutorProfileId: createdTutors[0].profileId,
      introduction: "I regularly help high-school students with algebra and exam prep.",
      relevantExperience: "8 years tutoring calculus and algebra.",
      proposedHourlyRate: 45,
      scheduleCompatibility: "Weekday evenings work well.",
      teachingApproach: "Worked examples and gradual independence.",
      messageToFamily: "Happy to discuss goals over messaging — arrangements stay between us outside the platform.",
      status: ApplicationStatus.ACCEPTED,
    },
  });

  await prisma.tutorRequirementApplication.create({
    data: {
      requirementId: parentRequirement.id,
      tutorProfileId: createdTutors[4].profileId,
      introduction: "I support middle-school writers with structure and confidence.",
      relevantExperience: "Essay writing and grammar focus.",
      proposedHourlyRate: 42,
      scheduleCompatibility: "Weekend mornings available.",
      status: ApplicationStatus.SUBMITTED,
    },
  });

  await prisma.reviewEligibility.create({
    data: {
      applicationId: app.id,
      studentUserId: studentUser.id,
      tutorProfileId: createdTutors[0].profileId,
      reason: "APPLICATION_ACCEPTED",
    },
  });

  await prisma.review.create({
    data: {
      tutorProfileId: createdTutors[0].profileId,
      authorId: studentUser.id,
      overallRating: 5,
      subjectKnowledge: 5,
      communication: 5,
      reliability: 4,
      teachingClarity: 5,
      writtenReview: "Clear explanations and patient pacing. Helped me understand quadratics without doing my homework for me.",
      editableUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      response: {
        create: {
          body: "Thank you — glad the practice problems helped.",
        },
      },
    },
  });

  // Mark eligibility used
  await prisma.reviewEligibility.update({
    where: { applicationId: app.id },
    data: { usedAt: new Date() },
  });

  const conversation = await prisma.conversation.create({
    data: {
      subject: "Algebra tutoring inquiry",
      relatedRequirementId: requirement.id,
      involvesMinor: false,
      participants: {
        create: [
          { userId: studentUser.id },
          { userId: createdTutors[0].userId },
        ],
      },
      messages: {
        create: [
          {
            senderId: studentUser.id,
            body: "Hi! I saw your profile and your application. Could we discuss online sessions for algebra?",
          },
          {
            senderId: createdTutors[0].userId,
            body: "Absolutely. I can generally do weekday evenings. We can finalize timing and payment privately outside the platform.",
          },
        ],
      },
    },
  });

  // Parent-minor conversation with parent visibility
  await prisma.conversation.create({
    data: {
      subject: "Writing support for learner",
      relatedRequirementId: parentRequirement.id,
      involvesMinor: true,
      participants: {
        create: [
          { userId: parentUser.id },
          { userId: createdTutors[4].userId },
        ],
      },
      messages: {
        create: [
          {
            senderId: parentUser.id,
            body: "Hello, I am messaging on behalf of my child about writing support.",
          },
        ],
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_DATA_CREATED",
      targetType: "System",
      metadata: { tutors: createdTutors.length, conversationId: conversation.id },
    },
  });

  console.log("Seed complete.");
  console.log("Demo logins (password: Password123!):");
  console.log("  admin@example.com / moderator@example.com");
  console.log("  student@example.com / parent@example.com");
  console.log("  tutor1@example.com … tutorN@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
