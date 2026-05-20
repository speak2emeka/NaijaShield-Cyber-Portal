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
    const plans = await prisma.plan.findMany({
      where: { active: true },
      include: { planFeatures: { include: { feature: true } } },
      orderBy: { priceMonthly: 'asc' }
    });

    res.json({ plans: plans.map(plan => ({
      slug: plan.slug,
      name: plan.name,
      description: plan.description,
      category: plan.category,
      priceMonthly: plan.priceMonthly,
      priceAnnual: plan.priceAnnual,
      features: plan.planFeatures.map(pf => ({
        code: pf.feature.code,
        name: pf.feature.name,
        description: pf.feature.description,
        included: pf.included
      }))
    })) });
  }
};
