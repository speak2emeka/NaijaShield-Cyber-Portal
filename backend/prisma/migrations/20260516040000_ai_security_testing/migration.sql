DO $$ BEGIN CREATE TYPE "AiArtifactType" AS ENUM ('THREAT_MODEL','ATTACK_SURFACE','TEST_CASES','VULN_ANALYSIS','REPORT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ScanTool" AS ENUM ('ZAP','NMAP','SEMGREP','DEPENDENCY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ScanStatus" AS ENUM ('QUEUED','RUNNING','COMPLETED','FAILED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EvidenceType" AS ENUM ('SCREENSHOT','LOG','NOTE','REQUEST','RESPONSE','OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "StaffScope" AS ENUM ('ADMIN','CLIENT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "AiArtifact" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientCompanyId" TEXT,
  "type" "AiArtifactType" NOT NULL,
  "title" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "output" JSONB NOT NULL,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiArtifact_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AiArtifact_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SecurityScanRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientCompanyId" TEXT,
  "tool" "ScanTool" NOT NULL,
  "target" TEXT NOT NULL,
  "status" "ScanStatus" NOT NULL DEFAULT 'QUEUED',
  "scheduledFor" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "summary" JSONB,
  "rawResult" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityScanRun_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CiSecurityResult" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientCompanyId" TEXT,
  "repository" TEXT NOT NULL,
  "branch" TEXT NOT NULL,
  "commitSha" TEXT,
  "pipelineId" TEXT,
  "score" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "findings" JSONB NOT NULL,
  "summary" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CiSecurityResult_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "EvidenceItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientCompanyId" TEXT,
  "uploadedByUserId" TEXT,
  "type" "EvidenceType" NOT NULL DEFAULT 'OTHER',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "findingRef" TEXT,
  "fileUrl" TEXT,
  "storageKey" TEXT,
  "summary" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EvidenceItem_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "EvidenceItem_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "StaffAssignment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "clientCompanyId" TEXT,
  "scope" "StaffScope" NOT NULL,
  "role" "UserRole" NOT NULL,
  "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StaffAssignment_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AiArtifact_clientCompanyId_type_createdAt_idx" ON "AiArtifact"("clientCompanyId","type","createdAt");
CREATE INDEX IF NOT EXISTS "SecurityScanRun_clientCompanyId_createdAt_idx" ON "SecurityScanRun"("clientCompanyId","createdAt");
CREATE INDEX IF NOT EXISTS "SecurityScanRun_tool_status_idx" ON "SecurityScanRun"("tool","status");
CREATE INDEX IF NOT EXISTS "CiSecurityResult_clientCompanyId_createdAt_idx" ON "CiSecurityResult"("clientCompanyId","createdAt");
CREATE INDEX IF NOT EXISTS "EvidenceItem_clientCompanyId_createdAt_idx" ON "EvidenceItem"("clientCompanyId","createdAt");
CREATE INDEX IF NOT EXISTS "StaffAssignment_scope_role_active_idx" ON "StaffAssignment"("scope","role","active");
CREATE UNIQUE INDEX IF NOT EXISTS "StaffAssignment_userId_clientCompanyId_scope_key" ON "StaffAssignment"("userId","clientCompanyId","scope");
