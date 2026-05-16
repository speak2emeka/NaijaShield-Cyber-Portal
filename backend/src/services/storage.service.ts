import crypto from 'crypto';
import fs from 'fs/promises';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

const enabled = Boolean(env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY);

const s3 = enabled ? new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: { accessKeyId: env.S3_ACCESS_KEY_ID!, secretAccessKey: env.S3_SECRET_ACCESS_KEY! },
  forcePathStyle: Boolean(env.S3_ENDPOINT)
}) : null;

export async function uploadReportObject(file: Express.Multer.File, clientCompanyId: string) {
  const bytes = await fs.readFile(file.path);
  const checksum = crypto.createHash('sha256').update(bytes).digest('hex');
  const key = `reports/${clientCompanyId}/${Date.now()}-${file.originalname}`;
  if (s3 && env.S3_BUCKET) {
    await s3.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: bytes, ContentType: file.mimetype, ChecksumSHA256: checksum }));
  }
  return { key, checksum, mimeType: file.mimetype, sizeBytes: file.size, localPath: file.path };
}

export async function signedReportUrl(storageKey?: string | null, fallback?: string | null) {
  if (!storageKey || !s3 || !env.S3_BUCKET) return fallback;
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: storageKey }), { expiresIn: 300 });
}
