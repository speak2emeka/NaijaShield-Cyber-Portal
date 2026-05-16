DO $$ BEGIN CREATE TYPE "StaffLevel" AS ENUM ('INTERN','JUNIOR','MID','SENIOR','LEAD','MANAGER','DIRECTOR','EXECUTIVE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "StaffDepartment" AS ENUM ('EXECUTIVE','SECURITY_LEADERSHIP','SOC','RED_TEAM','BLUE_TEAM','COMPLIANCE','CUSTOMER_SUCCESS','ENGINEERING','SALES_MARKETING'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ClearanceLevel" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE','CONTRACTOR','ON_LEAVE','SUSPENDED','TERMINATED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ShiftType" AS ENUM ('DAY','SWING','NIGHT','ON_CALL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "MeetingType" AS ENUM ('TEAM','CLIENT','INCIDENT_REVIEW','PENTEST_PLANNING','COMPLIANCE_AUDIT','QBR'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SocIncidentStatus" AS ENUM ('MONITORING','TRIAGE','INVESTIGATION','RESPONSE','REPORTING','LESSONS_LEARNED','CLOSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PentestStatus" AS ENUM ('SCOPING','PLANNING','TESTING','REPORTING','DELIVERED','RETEST','CLOSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CustomerHealth" AS ENUM ('GREEN','AMBER','RED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "StaffProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "jobTitle" TEXT NOT NULL,
  "department" "StaffDepartment" NOT NULL,
  "level" "StaffLevel" NOT NULL,
  "clearanceLevel" "ClearanceLevel" NOT NULL DEFAULT 'LOW',
  "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
  "certifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "kpis" JSONB,
  "managerUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "StaffShift" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "shiftType" "ShiftType" NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "onCall" BOOLEAN NOT NULL DEFAULT false,
  "attendanceStatus" TEXT,
  "handoverNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffShift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "StaffLeaveRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "StaffMeeting" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientCompanyId" TEXT,
  "organizerUserId" TEXT,
  "type" "MeetingType" NOT NULL,
  "title" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "attendees" JSONB NOT NULL,
  "provider" TEXT,
  "meetingUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffMeeting_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StaffMeeting_organizerUserId_fkey" FOREIGN KEY ("organizerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CustomerSuccessRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientCompanyId" TEXT NOT NULL UNIQUE,
  "health" "CustomerHealth" NOT NULL DEFAULT 'GREEN',
  "onboardingStage" TEXT NOT NULL DEFAULT 'DISCOVERY',
  "renewalDate" TIMESTAMP(3),
  "qbrDate" TIMESTAMP(3),
  "slaStatus" TEXT NOT NULL DEFAULT 'ON_TRACK',
  "upsellOpportunities" JSONB,
  "feedbackScore" INTEGER,
  "notes" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerSuccessRecord_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ClientMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientCompanyId" TEXT NOT NULL,
  "senderUserId" TEXT,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'PORTAL',
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClientMessage_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClientMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SocIncident" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientCompanyId" TEXT,
  "title" TEXT NOT NULL,
  "severity" "SecuritySeverity" NOT NULL DEFAULT 'MEDIUM',
  "status" "SocIncidentStatus" NOT NULL DEFAULT 'MONITORING',
  "assignedUserId" TEXT,
  "timeline" JSONB NOT NULL,
  "playbook" JSONB,
  "lessonsLearned" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocIncident_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SocIncident_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PentestProject" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientCompanyId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" "PentestStatus" NOT NULL DEFAULT 'SCOPING',
  "scope" JSONB NOT NULL,
  "testPlan" JSONB,
  "findings" JSONB,
  "deliveryDate" TIMESTAMP(3),
  "assignedUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PentestProject_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PentestProject_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "StaffProfile_department_level_idx" ON "StaffProfile"("department","level");
CREATE INDEX IF NOT EXISTS "StaffShift_userId_startsAt_idx" ON "StaffShift"("userId","startsAt");
CREATE INDEX IF NOT EXISTS "StaffMeeting_clientCompanyId_startsAt_idx" ON "StaffMeeting"("clientCompanyId","startsAt");
CREATE INDEX IF NOT EXISTS "CustomerSuccessRecord_health_idx" ON "CustomerSuccessRecord"("health");
CREATE INDEX IF NOT EXISTS "ClientMessage_clientCompanyId_createdAt_idx" ON "ClientMessage"("clientCompanyId","createdAt");
CREATE INDEX IF NOT EXISTS "SocIncident_clientCompanyId_status_idx" ON "SocIncident"("clientCompanyId","status");
CREATE INDEX IF NOT EXISTS "PentestProject_clientCompanyId_status_idx" ON "PentestProject"("clientCompanyId","status");
