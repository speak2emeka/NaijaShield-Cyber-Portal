import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';

export const featureFlagService = {
  async listFlags() {
    return prisma.featureFlag.findMany({ orderBy: { code: 'asc' } });
  },

  async listClientFlags(clientCompanyId: string) {
    return prisma.clientFeatureFlag.findMany({
      where: { clientCompanyId },
      include: { featureFlag: true }
    });
  },

  async setClientFlag(clientCompanyId: string, featureFlagId: string, enabled: boolean) {
    const featureFlag = await prisma.featureFlag.findUnique({ where: { id: featureFlagId } });
    if (!featureFlag) throw new HttpError(404, 'Feature flag not found');

    return prisma.clientFeatureFlag.upsert({
      where: { clientCompanyId_featureFlagId: { clientCompanyId, featureFlagId } },
      create: { clientCompanyId, featureFlagId, enabled },
      update: { enabled },
      include: { featureFlag: true }
    });
  }
};
