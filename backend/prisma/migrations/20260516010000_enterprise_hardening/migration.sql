DO $$ BEGIN CREATE TYPE "AuthTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "BillingProvider" AS ENUM ('PAYSTACK', 'STRIPE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'FAILED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERVISOR';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'AUDITOR';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaSecret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "ClientCompany" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "KnowledgeBaseArticle" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "fileUrl" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "storageKey" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "checksum" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "sizeBytes" INTEGER;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "provider" "BillingProvider";
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "providerCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "providerSubscriptionId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "graceEndsAt" TIMESTAMP(3);
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "correlationId" TEXT;

CREATE TABLE IF NOT EXISTS "AuthToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "AuthTokenType" NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "deviceLabel" TEXT,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BackupCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BackupCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Invoice" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "provider" "BillingProvider" NOT NULL,
  "providerInvoiceId" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "status" "InvoiceStatus" NOT NULL DEFAULT 'OPEN',
  "hostedUrl" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuthToken_tokenHash_key" ON "AuthToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_clientCompanyId_idx" ON "User"("clientCompanyId");
CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX IF NOT EXISTS "ClientCompany_industry_idx" ON "ClientCompany"("industry");
CREATE INDEX IF NOT EXISTS "ClientCompany_deletedAt_idx" ON "ClientCompany"("deletedAt");
CREATE INDEX IF NOT EXISTS "Ticket_clientCompanyId_status_idx" ON "Ticket"("clientCompanyId", "status");
CREATE INDEX IF NOT EXISTS "Ticket_createdByUserId_idx" ON "Ticket"("createdByUserId");
CREATE INDEX IF NOT EXISTS "Ticket_priority_idx" ON "Ticket"("priority");
CREATE INDEX IF NOT EXISTS "Ticket_updatedAt_idx" ON "Ticket"("updatedAt");
CREATE INDEX IF NOT EXISTS "Ticket_deletedAt_idx" ON "Ticket"("deletedAt");
CREATE INDEX IF NOT EXISTS "TicketComment_ticketId_idx" ON "TicketComment"("ticketId");
CREATE INDEX IF NOT EXISTS "TicketComment_userId_idx" ON "TicketComment"("userId");
CREATE INDEX IF NOT EXISTS "ServiceRequest_clientCompanyId_status_idx" ON "ServiceRequest"("clientCompanyId", "status");
CREATE INDEX IF NOT EXISTS "ServiceRequest_type_idx" ON "ServiceRequest"("type");
CREATE INDEX IF NOT EXISTS "ServiceRequest_updatedAt_idx" ON "ServiceRequest"("updatedAt");
CREATE INDEX IF NOT EXISTS "ServiceRequest_deletedAt_idx" ON "ServiceRequest"("deletedAt");
CREATE INDEX IF NOT EXISTS "Report_clientCompanyId_createdAt_idx" ON "Report"("clientCompanyId", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_deletedAt_idx" ON "Report"("deletedAt");
CREATE INDEX IF NOT EXISTS "SecurityScoreHistory_clientCompanyId_calculatedAt_idx" ON "SecurityScoreHistory"("clientCompanyId", "calculatedAt");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX IF NOT EXISTS "Subscription_provider_idx" ON "Subscription"("provider");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_idx" ON "AuditLog"("entityType");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_correlationId_idx" ON "AuditLog"("correlationId");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX IF NOT EXISTS "Notification_clientCompanyId_read_idx" ON "Notification"("clientCompanyId", "read");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX IF NOT EXISTS "KnowledgeBaseArticle_category_idx" ON "KnowledgeBaseArticle"("category");
CREATE INDEX IF NOT EXISTS "KnowledgeBaseArticle_deletedAt_idx" ON "KnowledgeBaseArticle"("deletedAt");
CREATE INDEX IF NOT EXISTS "AuthToken_userId_type_idx" ON "AuthToken"("userId", "type");
CREATE INDEX IF NOT EXISTS "AuthToken_expiresAt_idx" ON "AuthToken"("expiresAt");
CREATE INDEX IF NOT EXISTS "UserSession_userId_revokedAt_idx" ON "UserSession"("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "BackupCode_userId_usedAt_idx" ON "BackupCode"("userId", "usedAt");
CREATE INDEX IF NOT EXISTS "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX IF NOT EXISTS "Invoice_createdAt_idx" ON "Invoice"("createdAt");

DO $$ BEGIN ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "BackupCode" ADD CONSTRAINT "BackupCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
