DO $$ BEGIN CREATE TYPE "SecuritySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AssetType" AS ENUM ('DOMAIN', 'IP', 'APP', 'CLOUD'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ComplianceFramework" AS ENUM ('ISO27001', 'SOC2', 'NDPR'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ComplianceItemStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AttackDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AttackPhase" AS ENUM ('RECON', 'INITIAL_ACCESS', 'LATERAL_MOVEMENT', 'EXFILTRATION', 'CONTAINMENT', 'RECOVERY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "ClientCompany" ADD COLUMN IF NOT EXISTS "tenantKeyId" TEXT;
ALTER TABLE "ClientCompany" ADD COLUMN IF NOT EXISTS "keyRotationDueAt" TIMESTAMP(3);
ALTER TABLE "UserSession" ADD COLUMN IF NOT EXISTS "deviceFingerprint" TEXT;
ALTER TABLE "UserSession" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "UserSession" ADD COLUMN IF NOT EXISTS "riskScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserSession" ADD COLUMN IF NOT EXISTS "riskFlags" JSONB;
ALTER TABLE "UserSession" ADD COLUMN IF NOT EXISTS "stepUpRequired" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "SecurityEvent" (
  "id" TEXT NOT NULL,
  "clientCompanyId" TEXT,
  "type" TEXT NOT NULL,
  "severity" "SecuritySeverity" NOT NULL DEFAULT 'LOW',
  "source" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "correlationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SecurityPostureSummary" (
  "id" TEXT NOT NULL,
  "clientCompanyId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "breakdown" JSONB NOT NULL,
  CONSTRAINT "SecurityPostureSummary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ClientAsset" (
  "id" TEXT NOT NULL,
  "clientCompanyId" TEXT NOT NULL,
  "type" "AssetType" NOT NULL,
  "identifier" TEXT NOT NULL,
  "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "ClientAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ComplianceStatus" (
  "id" TEXT NOT NULL,
  "clientCompanyId" TEXT NOT NULL,
  "framework" "ComplianceFramework" NOT NULL,
  "status" "ComplianceItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "score" INTEGER NOT NULL DEFAULT 0,
  "checklist" JSONB NOT NULL,
  "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ComplianceStatus_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ComplianceEvidence" (
  "id" TEXT NOT NULL,
  "complianceStatusId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "reportId" TEXT,
  "fileUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ComplianceEvidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AttackScenario" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "difficulty" "AttackDifficulty" NOT NULL DEFAULT 'BEGINNER',
  "safetyNote" TEXT NOT NULL,
  "eventTemplate" JSONB NOT NULL,
  "attackerTemplate" JSONB NOT NULL,
  "defenderTemplate" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttackScenario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AttackRun" (
  "id" TEXT NOT NULL,
  "scenarioId" TEXT NOT NULL,
  "clientCompanyId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "resultSummary" JSONB,
  "attackerView" JSONB,
  "defenderView" JSONB,
  CONSTRAINT "AttackRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AttackEvent" (
  "id" TEXT NOT NULL,
  "attackRunId" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "phase" "AttackPhase" NOT NULL,
  "description" TEXT NOT NULL,
  "severity" "SecuritySeverity" NOT NULL DEFAULT 'LOW',
  "metadata" JSONB,
  CONSTRAINT "AttackEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SecurityPostureSummary_clientCompanyId_key" ON "SecurityPostureSummary"("clientCompanyId");
CREATE UNIQUE INDEX IF NOT EXISTS "ClientAsset_clientCompanyId_identifier_key" ON "ClientAsset"("clientCompanyId", "identifier");
CREATE UNIQUE INDEX IF NOT EXISTS "ComplianceStatus_clientCompanyId_framework_key" ON "ComplianceStatus"("clientCompanyId", "framework");

CREATE INDEX IF NOT EXISTS "ClientCompany_tenantKeyId_idx" ON "ClientCompany"("tenantKeyId");
CREATE INDEX IF NOT EXISTS "UserSession_riskScore_idx" ON "UserSession"("riskScore");
CREATE INDEX IF NOT EXISTS "SecurityEvent_clientCompanyId_createdAt_idx" ON "SecurityEvent"("clientCompanyId", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityEvent_type_idx" ON "SecurityEvent"("type");
CREATE INDEX IF NOT EXISTS "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");
CREATE INDEX IF NOT EXISTS "SecurityEvent_source_idx" ON "SecurityEvent"("source");
CREATE INDEX IF NOT EXISTS "SecurityPostureSummary_score_idx" ON "SecurityPostureSummary"("score");
CREATE INDEX IF NOT EXISTS "SecurityPostureSummary_lastCalculatedAt_idx" ON "SecurityPostureSummary"("lastCalculatedAt");
CREATE INDEX IF NOT EXISTS "ClientAsset_clientCompanyId_riskLevel_idx" ON "ClientAsset"("clientCompanyId", "riskLevel");
CREATE INDEX IF NOT EXISTS "ClientAsset_type_idx" ON "ClientAsset"("type");
CREATE INDEX IF NOT EXISTS "ComplianceStatus_framework_status_idx" ON "ComplianceStatus"("framework", "status");
CREATE INDEX IF NOT EXISTS "ComplianceEvidence_complianceStatusId_idx" ON "ComplianceEvidence"("complianceStatusId");
CREATE INDEX IF NOT EXISTS "AttackScenario_category_idx" ON "AttackScenario"("category");
CREATE INDEX IF NOT EXISTS "AttackScenario_difficulty_idx" ON "AttackScenario"("difficulty");
CREATE INDEX IF NOT EXISTS "AttackRun_clientCompanyId_startedAt_idx" ON "AttackRun"("clientCompanyId", "startedAt");
CREATE INDEX IF NOT EXISTS "AttackRun_scenarioId_idx" ON "AttackRun"("scenarioId");
CREATE INDEX IF NOT EXISTS "AttackEvent_attackRunId_timestamp_idx" ON "AttackEvent"("attackRunId", "timestamp");
CREATE INDEX IF NOT EXISTS "AttackEvent_phase_idx" ON "AttackEvent"("phase");
CREATE INDEX IF NOT EXISTS "AttackEvent_severity_idx" ON "AttackEvent"("severity");

DO $$ BEGIN ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "SecurityPostureSummary" ADD CONSTRAINT "SecurityPostureSummary_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ClientAsset" ADD CONSTRAINT "ClientAsset_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ComplianceStatus" ADD CONSTRAINT "ComplianceStatus_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ComplianceEvidence" ADD CONSTRAINT "ComplianceEvidence_complianceStatusId_fkey" FOREIGN KEY ("complianceStatusId") REFERENCES "ComplianceStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AttackRun" ADD CONSTRAINT "AttackRun_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "AttackScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AttackRun" ADD CONSTRAINT "AttackRun_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AttackEvent" ADD CONSTRAINT "AttackEvent_attackRunId_fkey" FOREIGN KEY ("attackRunId") REFERENCES "AttackRun"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
