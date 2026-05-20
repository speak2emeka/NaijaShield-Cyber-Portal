import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const transporter = env.SMTP_URL ? nodemailer.createTransport(env.SMTP_URL) : null;

export const emailTemplates = {
  verifyEmail: (url: string) => ({
    subject: 'Verify your NaijaShield account',
    text: `Verify your NaijaShield account: ${url}`,
    html: `<p>Welcome to NaijaShield.</p><p><a href="${url}">Verify your account</a></p>`
  }),
  resetPassword: (url: string) => ({
    subject: 'Reset your NaijaShield password',
    text: `Reset your password: ${url}`,
    html: `<p>A password reset was requested.</p><p><a href="${url}">Reset your password</a></p>`
  }),
  otp: (code: string) => ({
    subject: 'Your NaijaShield sign-in code',
    text: `Your NaijaShield OTP is ${code}`,
    html: `<p>Your NaijaShield OTP is <strong>${code}</strong>.</p>`
  })
};

export async function sendEmail(to: string, template: { subject: string; text: string; html: string }) {
  if (!transporter) {
    logger.warn({ to, subject: template.subject }, 'SMTP_URL not configured; email captured in logs');
    return { queued: false };
  }
  await transporter.sendMail({ from: env.EMAIL_FROM, to, ...template });
  return { queued: true };
}
