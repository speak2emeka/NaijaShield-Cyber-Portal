import Stripe from 'stripe';
import { BillingProvider } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export const billingService = {
  plans: [
    { id: 'basic', name: 'Basic', priceMonthly: 150000, features: ['Portal access', 'Ticket support', 'Quarterly reports'] },
    { id: 'pro', name: 'Pro', priceMonthly: 350000, features: ['Managed triage', 'Monthly reports', 'Security score tracking'] },
    { id: 'enterprise', name: 'Enterprise', priceMonthly: 900000, features: ['Dedicated analyst', 'SSO', 'Custom SLAs'] }
  ],

  async checkout(clientCompanyId: string, planId: string, provider: BillingProvider) {
    const plan = this.plans.find(item => item.id === planId);
    if (!plan) throw new HttpError(400, 'Unknown plan');
    if (provider === BillingProvider.STRIPE && stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        success_url: `${env.FRONTEND_ORIGIN}/client/subscription?checkout=success`,
        cancel_url: `${env.FRONTEND_ORIGIN}/client/subscription?checkout=cancelled`,
        line_items: [{ price_data: { currency: 'ngn', product_data: { name: `NaijaShield ${plan.name}` }, recurring: { interval: 'month' }, unit_amount: plan.priceMonthly }, quantity: 1 }]
      });
      return { provider, checkoutUrl: session.url };
    }
    return { provider, checkoutUrl: `${env.FRONTEND_ORIGIN}/client/subscription?demoCheckout=${plan.id}` };
  },

  async invoices(clientCompanyId: string) {
    const subscription = await prisma.subscription.findUnique({ where: { clientCompanyId }, include: { invoices: { orderBy: { createdAt: 'desc' } } } });
    return subscription?.invoices || [];
  }
};
