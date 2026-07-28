-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'PARENT', 'TUTOR', 'MODERATOR', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'BANNED', 'DEACTIVATED', 'DELETED');

-- CreateEnum
CREATE TYPE "TutorProfileStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'EXPIRED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'VIEWED', 'SHORTLISTED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TutoringMode" AS ENUM ('ONLINE', 'IN_PERSON', 'EITHER');

-- CreateEnum
CREATE TYPE "LearnerLevel" AS ENUM ('ELEMENTARY', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'COLLEGE', 'ADULT', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "LearningGoal" AS ENUM ('IMPROVE_GRADES', 'UNDERSTAND_CONCEPTS', 'HOMEWORK_SUPPORT', 'EXAM_PREP', 'CATCH_UP', 'GET_AHEAD', 'PROJECT_GUIDANCE', 'UNIVERSITY_PREP', 'TECHNICAL_SKILL', 'BUILD_CONFIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('ASAP', 'FEW_DAYS', 'TWO_WEEKS', 'ONE_MONTH', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "TimePeriod" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- CreateEnum
CREATE TYPE "TeachingStyle" AS ENUM ('PATIENT_ENCOURAGING', 'STRUCTURED_ORGANIZED', 'EXAM_FOCUSED', 'PROJECT_BASED', 'INTERACTIVE', 'FLEXIBLE_ADAPTIVE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('GOVERNMENT_ID', 'DEGREE', 'CERTIFICATION', 'RESUME', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ModerationCaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MESSAGE', 'APPLICATION', 'REVIEW', 'MODERATION', 'SYSTEM', 'VERIFICATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "legalName" TEXT,
    "displayName" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "role" "UserRole",
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "country" TEXT,
    "city" TEXT,
    "timezone" TEXT,
    "deactivatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ageBand" TEXT,
    "schoolLevel" TEXT,
    "preferredSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredLanguage" TEXT,
    "tutoringMode" "TutoringMode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL,
    "displayNickname" TEXT NOT NULL,
    "privateLegalName" TEXT,
    "ageBand" TEXT NOT NULL,
    "gradeLevel" TEXT,
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "curriculum" TEXT,
    "learningGoals" TEXT,
    "preferredLanguage" TEXT,
    "accommodations" TEXT,
    "allowPublicPhoto" BOOLEAN NOT NULL DEFAULT false,
    "photoUrl" TEXT,
    "parentCanViewMessages" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentChildRelationship" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL DEFAULT 'parent',
    "canMessage" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentChildRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT,
    "biography" TEXT,
    "teachingApproach" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "currentOccupation" TEXT,
    "educationSummary" TEXT,
    "teachingStyles" "TeachingStyle"[] DEFAULT ARRAY[]::"TeachingStyle"[],
    "communityAttested" BOOLEAN NOT NULL DEFAULT false,
    "secularSubjectsOnly" BOOLEAN NOT NULL DEFAULT false,
    "conductAgreed" BOOLEAN NOT NULL DEFAULT false,
    "noReligiousInstruction" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    "guidelinesAcceptedAt" TIMESTAMP(3),
    "status" "TutorProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "rejectionReason" TEXT,
    "changeRequestNotes" TEXT,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT,
    "searchDocument" TEXT,
    "approvedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialization" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorSubject" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "specializationId" TEXT,
    "curriculumId" TEXT,
    "minLevel" "LearnerLevel" NOT NULL,
    "maxLevel" "LearnerLevel" NOT NULL,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "onlineAvailable" BOOLEAN NOT NULL DEFAULT true,
    "inPersonAvailable" BOOLEAN NOT NULL DEFAULT false,
    "individualTutoring" BOOLEAN NOT NULL DEFAULT true,
    "homeworkGuidance" BOOLEAN NOT NULL DEFAULT true,
    "examPreparation" BOOLEAN NOT NULL DEFAULT true,
    "projectGuidance" BOOLEAN NOT NULL DEFAULT false,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorQualification" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorCertification" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorLanguage" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorGeneralAvailability" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "period" "TimePeriod" NOT NULL,
    "timeRangeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorGeneralAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorLocation" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "onlineAvailable" BOOLEAN NOT NULL DEFAULT true,
    "inPersonAvailable" BOOLEAN NOT NULL DEFAULT false,
    "tutorTravels" BOOLEAN NOT NULL DEFAULT false,
    "studentTravels" BOOLEAN NOT NULL DEFAULT false,
    "publicMeetingOk" BOOLEAN NOT NULL DEFAULT true,
    "travelRadiusKm" INTEGER,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "approximateArea" TEXT,
    "latitudeApprox" DOUBLE PRECISION,
    "longitudeApprox" DOUBLE PRECISION,
    "privateAddressNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorVerification" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "notes" TEXT,
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationDocument" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorApplicationReview" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorApplicationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutoringRequirement" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT,
    "parentProfileId" TEXT,
    "childProfileId" TEXT,
    "whoNeedsHelp" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topic" TEXT,
    "learnerLevel" "LearnerLevel" NOT NULL,
    "curriculum" TEXT,
    "learningGoal" "LearningGoal",
    "mode" "TutoringMode" NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "approximateArea" TEXT,
    "preferredSchedule" TEXT,
    "expectedFrequency" TEXT,
    "budgetMin" DECIMAL(10,2),
    "budgetMax" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "whenNeeded" "Urgency",
    "description" TEXT NOT NULL,
    "additionalNeeds" TEXT,
    "status" "RequirementStatus" NOT NULL DEFAULT 'DRAFT',
    "expiresAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutoringRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorRequirementApplication" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "relevantExperience" TEXT,
    "proposedHourlyRate" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "scheduleCompatibility" TEXT,
    "teachingApproach" TEXT,
    "messageToFamily" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorRequirementApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FindTutorQuestionnaire" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionId" TEXT,
    "childProfileId" TEXT,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "answers" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FindTutorQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorMatch" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "mismatches" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchFactor" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "factorKey" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "MatchFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "relatedRequirementId" TEXT,
    "involvesMinor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewEligibility" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "studentUserId" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "ReviewEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "subjectKnowledge" INTEGER,
    "communication" INTEGER,
    "reliability" INTEGER,
    "teachingClarity" INTEGER,
    "writtenReview" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "moderated" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "editableUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewResponse" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationCase" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "assigneeId" TEXT,
    "title" TEXT NOT NULL,
    "status" "ModerationCaseStatus" NOT NULL DEFAULT 'OPEN',
    "internalNotes" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailMessages" BOOLEAN NOT NULL DEFAULT true,
    "emailApplications" BOOLEAN NOT NULL DEFAULT true,
    "emailReviews" BOOLEAN NOT NULL DEFAULT true,
    "emailMarketing" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityGuideline" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityGuideline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProhibitedSubject" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProhibitedSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SubjectCurricula" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubjectCurricula_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "ParentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChildRelationship_parentId_childId_key" ON "ParentChildRelationship"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfile_userId_key" ON "TutorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfile_slug_key" ON "TutorProfile"("slug");

-- CreateIndex
CREATE INDEX "TutorProfile_status_isVerified_idx" ON "TutorProfile"("status", "isVerified");

-- CreateIndex
CREATE INDEX "TutorProfile_averageRating_idx" ON "TutorProfile"("averageRating");

-- CreateIndex
CREATE INDEX "TutorProfile_deletedAt_idx" ON "TutorProfile"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectCategory_slug_key" ON "SubjectCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE INDEX "Subject_name_idx" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "Subject_isActive_idx" ON "Subject"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_subjectId_slug_key" ON "Specialization"("subjectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Curriculum_slug_key" ON "Curriculum"("slug");

-- CreateIndex
CREATE INDEX "TutorSubject_tutorProfileId_subjectId_idx" ON "TutorSubject"("tutorProfileId", "subjectId");

-- CreateIndex
CREATE INDEX "TutorSubject_hourlyRate_idx" ON "TutorSubject"("hourlyRate");

-- CreateIndex
CREATE UNIQUE INDEX "TutorLanguage_tutorProfileId_language_key" ON "TutorLanguage"("tutorProfileId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "TutorGeneralAvailability_tutorProfileId_dayOfWeek_period_key" ON "TutorGeneralAvailability"("tutorProfileId", "dayOfWeek", "period");

-- CreateIndex
CREATE UNIQUE INDEX "TutorLocation_tutorProfileId_key" ON "TutorLocation"("tutorProfileId");

-- CreateIndex
CREATE INDEX "TutorLocation_country_city_idx" ON "TutorLocation"("country", "city");

-- CreateIndex
CREATE UNIQUE INDEX "TutorVerification_tutorProfileId_key" ON "TutorVerification"("tutorProfileId");

-- CreateIndex
CREATE INDEX "TutoringRequirement_status_subjectId_idx" ON "TutoringRequirement"("status", "subjectId");

-- CreateIndex
CREATE INDEX "TutoringRequirement_country_city_idx" ON "TutoringRequirement"("country", "city");

-- CreateIndex
CREATE INDEX "TutorRequirementApplication_status_idx" ON "TutorRequirementApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TutorRequirementApplication_requirementId_tutorProfileId_key" ON "TutorRequirementApplication"("requirementId", "tutorProfileId");

-- CreateIndex
CREATE INDEX "FindTutorQuestionnaire_userId_idx" ON "FindTutorQuestionnaire"("userId");

-- CreateIndex
CREATE INDEX "FindTutorQuestionnaire_guestSessionId_idx" ON "FindTutorQuestionnaire"("guestSessionId");

-- CreateIndex
CREATE INDEX "TutorMatch_score_idx" ON "TutorMatch"("score");

-- CreateIndex
CREATE UNIQUE INDEX "TutorMatch_questionnaireId_tutorProfileId_key" ON "TutorMatch"("questionnaireId", "tutorProfileId");

-- CreateIndex
CREATE INDEX "MatchFactor_matchId_idx" ON "MatchFactor"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewEligibility_applicationId_key" ON "ReviewEligibility"("applicationId");

-- CreateIndex
CREATE INDEX "Review_overallRating_idx" ON "Review"("overallRating");

-- CreateIndex
CREATE UNIQUE INDEX "Review_tutorProfileId_authorId_key" ON "Review"("tutorProfileId", "authorId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewResponse_reviewId_key" ON "ReviewResponse"("reviewId");

-- CreateIndex
CREATE INDEX "UserReport_status_idx" ON "UserReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "ModerationCase_reportId_key" ON "ModerationCase"("reportId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityGuideline_slug_key" ON "CommunityGuideline"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProhibitedSubject_term_key" ON "ProhibitedSubject"("term");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "_SubjectCurricula_B_index" ON "_SubjectCurricula"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildRelationship" ADD CONSTRAINT "ParentChildRelationship_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildRelationship" ADD CONSTRAINT "ParentChildRelationship_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SubjectCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialization" ADD CONSTRAINT "Specialization_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubject" ADD CONSTRAINT "TutorSubject_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubject" ADD CONSTRAINT "TutorSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubject" ADD CONSTRAINT "TutorSubject_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubject" ADD CONSTRAINT "TutorSubject_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorQualification" ADD CONSTRAINT "TutorQualification_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorCertification" ADD CONSTRAINT "TutorCertification_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorLanguage" ADD CONSTRAINT "TutorLanguage_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorGeneralAvailability" ADD CONSTRAINT "TutorGeneralAvailability_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorLocation" ADD CONSTRAINT "TutorLocation_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorVerification" ADD CONSTRAINT "TutorVerification_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "TutorVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorApplicationReview" ADD CONSTRAINT "TutorApplicationReview_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringRequirement" ADD CONSTRAINT "TutoringRequirement_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringRequirement" ADD CONSTRAINT "TutoringRequirement_parentProfileId_fkey" FOREIGN KEY ("parentProfileId") REFERENCES "ParentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringRequirement" ADD CONSTRAINT "TutoringRequirement_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringRequirement" ADD CONSTRAINT "TutoringRequirement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorRequirementApplication" ADD CONSTRAINT "TutorRequirementApplication_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "TutoringRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorRequirementApplication" ADD CONSTRAINT "TutorRequirementApplication_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindTutorQuestionnaire" ADD CONSTRAINT "FindTutorQuestionnaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindTutorQuestionnaire" ADD CONSTRAINT "FindTutorQuestionnaire_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorMatch" ADD CONSTRAINT "TutorMatch_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "FindTutorQuestionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorMatch" ADD CONSTRAINT "TutorMatch_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchFactor" ADD CONSTRAINT "MatchFactor_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "TutorMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewEligibility" ADD CONSTRAINT "ReviewEligibility_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TutorRequirementApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewResponse" ADD CONSTRAINT "ReviewResponse_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "UserReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectCurricula" ADD CONSTRAINT "_SubjectCurricula_A_fkey" FOREIGN KEY ("A") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectCurricula" ADD CONSTRAINT "_SubjectCurricula_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
