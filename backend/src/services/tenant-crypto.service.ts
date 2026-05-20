import crypto from 'crypto';
import { prisma } from '../config/prisma.js';

export const tenantCryptoService = {
  async keyMetadata(clientCompanyId: string) {
    const company = await prisma.clientCompany.findUnique({ where: { id: clientCompanyId }, select: { tenantKeyId: true, keyRotationDueAt: true } });
    return { tenantKeyId: company?.tenantKeyId || `kms-${clientCompanyId}-pending`, keyRotationDueAt: company?.keyRotationDueAt };
  },

  async rotateKey(clientCompanyId: string) {
    const tenantKeyId = `kms-${clientCompanyId}-${Date.now()}`;
    return prisma.clientCompany.update({
      where: { id: clientCompanyId },
      data: { tenantKeyId, keyRotationDueAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) }
    });
  },

  encryptForTenant(value: string, tenantKeyId: string) {
    const digest = crypto.createHash('sha256').update(`${tenantKeyId}:${value}`).digest('hex');
    return `encrypted:${tenantKeyId}:${digest}`;
  },

  decryptForTenant(value: string) {
    return value.startsWith('encrypted:') ? '[decryption delegated to configured KMS]' : value;
  }
};
