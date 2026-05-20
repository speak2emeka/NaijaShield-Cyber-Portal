ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "billingInterval" TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS "featureFlags" JSONB,
  ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE INDEX IF NOT EXISTS "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "AttackRun_startedAt_idx" ON "AttackRun"("startedAt");
CREATE INDEX IF NOT EXISTS "Subscription_renewalDate_idx" ON "Subscription"("renewalDate");
