import { prisma } from '../config/prisma.js';
import { SubscriptionStatus } from '@prisma/client';

export async function isFeatureEnabledForClient(clientCompanyId: string, featureCode: string) {
  if (!clientCompanyId) return false;

  // Load subscription and plan features
  const subscription = await prisma.subscription.findUnique({
    where: { clientCompanyId },
    include: {
      planRef: { include: { planFeatures: { include: { feature: true } } } }
    }
  });

  // If subscription missing or inactive -> treat as disabled
  if (!subscription) return false;
  if (subscription.status !== SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.TRIAL) return false;

  const planFeatureEnabled = Boolean(
    subscription.planRef?.planFeatures.some(pf => pf.feature.code === featureCode && pf.included)
  );

  // Legacy subscription-level feature flags (json blob)
  const legacyFlagEnabled = Boolean((subscription.featureFlags as Record<string, boolean> | null)?.[featureCode]);

  // Tenant-level explicit feature flags: fetch tenant override for this exact feature code
  const tenantFlag = await prisma.clientFeatureFlag.findFirst({
    where: {
      clientCompanyId,
      featureFlag: { code: featureCode }
    },
    include: { featureFlag: true }
  });
  const tenantFlagEnabled = Boolean(tenantFlag?.enabled);

  return planFeatureEnabled || legacyFlagEnabled || tenantFlagEnabled;
}
