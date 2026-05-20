CREATE TYPE "CrmTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'BLOCKED');
CREATE TYPE "CrmTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "CrmLifecycleStage" AS ENUM ('ONBOARDING', 'IMPLEMENTATION', 'ADOPTION', 'QBR', 'RENEWAL', 'EXPANSION');
CREATE TYPE "RenewalStage" AS ENUM ('DISCOVERY', 'VALUE_REVIEW', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

CREATE TABLE "CrmContact" (
  "id" TEXT NOT NULL,
  "clientCompanyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "title" TEXT,
  "role" TEXT NOT NULL DEFAULT 'STAKEHOLDER',
  "primary" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmTask" (
  "id" TEXT NOT NULL,
  "clientCompanyId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "CrmTaskStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "CrmTaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "dueDate" TIMESTAMP(3),
  "assignedUserId" TEXT,
  "source" TEXT NOT NULL DEFAULT 'MANUAL',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmLifecycleEvent" (
  "id" TEXT NOT NULL,
  "clientCompanyId" TEXT NOT NULL,
  "stage" "CrmLifecycleStage" NOT NULL,
  "summary" TEXT NOT NULL,
  "owner" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CrmLifecycleEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RenewalOpportunity" (
  "id" TEXT NOT NULL,
  "clientCompanyId" TEXT NOT NULL,
  "stage" "RenewalStage" NOT NULL DEFAULT 'DISCOVERY',
  "contractValue" INTEGER NOT NULL DEFAULT 0,
  "probability" INTEGER NOT NULL DEFAULT 50,
  "renewalDate" TIMESTAMP(3),
  "churnRisk" TEXT NOT NULL DEFAULT 'MEDIUM',
  "upsellNotes" TEXT,
  "nextStep" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RenewalOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CrmContact_clientCompanyId_primary_idx" ON "CrmContact"("clientCompanyId", "primary");
CREATE INDEX "CrmContact_email_idx" ON "CrmContact"("email");
CREATE INDEX "CrmTask_clientCompanyId_status_idx" ON "CrmTask"("clientCompanyId", "status");
CREATE INDEX "CrmTask_assignedUserId_idx" ON "CrmTask"("assignedUserId");
CREATE INDEX "CrmTask_dueDate_idx" ON "CrmTask"("dueDate");
CREATE INDEX "CrmLifecycleEvent_clientCompanyId_occurredAt_idx" ON "CrmLifecycleEvent"("clientCompanyId", "occurredAt");
CREATE INDEX "CrmLifecycleEvent_stage_idx" ON "CrmLifecycleEvent"("stage");
CREATE INDEX "RenewalOpportunity_clientCompanyId_stage_idx" ON "RenewalOpportunity"("clientCompanyId", "stage");
CREATE INDEX "RenewalOpportunity_renewalDate_idx" ON "RenewalOpportunity"("renewalDate");

ALTER TABLE "CrmContact" ADD CONSTRAINT "CrmContact_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrmLifecycleEvent" ADD CONSTRAINT "CrmLifecycleEvent_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RenewalOpportunity" ADD CONSTRAINT "RenewalOpportunity_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
