import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const publicController = {
  async contact(req: Request, res: Response) {
    const { website, ...message } = req.body;
    if (website) return res.status(202).json({ ok: true });
    await prisma.contactMessage.create({ data: message });
    res.status(201).json({ ok: true });
  },

  async blog(_req: Request, res: Response) {
    res.json({
      posts: [
        { slug: 'phishing-readiness', title: 'How Nigerian Businesses Can Improve Phishing Readiness', excerpt: 'Practical controls for staff awareness and incident response.' },
        { slug: 'cloud-security-baseline', title: 'Cloud Security Baseline for Growing Teams', excerpt: 'Identity, logging, backup, and vulnerability hygiene essentials.' }
      ]
    });
  },

  async pricing(_req: Request, res: Response) {
    res.json({
      plans: [
        { name: 'ShieldStart', audience: 'SMEs', price: 'Custom', features: ['Baseline assessment', 'Awareness training', 'Risk report'] },
        { name: 'ShieldOps', audience: 'Growth teams', price: 'Custom', features: ['Managed monitoring', 'Tickets', 'Monthly reporting'] },
        { name: 'ShieldEnterprise', audience: 'Regulated organizations', price: 'Custom', features: ['Dedicated analyst', 'Compliance support', 'Incident response'] }
      ]
    });
  }
};
