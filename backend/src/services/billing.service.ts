import Stripe from 'stripe';
import { BillingProvider, InvoiceStatus, SubscriptionStatus } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export const billingService = {
  async getPlans() {
    return prisma.plan.findMany({
      where: { active: true },
      include: { planFeatures: { include: { feature: true } } },
      orderBy: { priceMonthly: 'asc' }
    });
  },

  async checkout(clientCompanyId: string, planId: string, provider: BillingProvider) {
    const plan = await prisma.plan.findUnique({ where: { slug: planId }, include: { planFeatures: { include: { feature: true } } } })
      || await prisma.plan.findFirst({ where: { name: planId }, include: { planFeatures: { include: { feature: true } } } });
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
  },

  subscription(clientCompanyId: string) {
    return prisma.subscription.findUnique({
      where: { clientCompanyId },
      include: { invoices: { orderBy: { createdAt: 'desc' } }, clientCompany: true, planRef: true }
    });
  },

  adminSubscriptions() {
    return prisma.subscription.findMany({ include: { clientCompany: true, invoices: { orderBy: { createdAt: 'desc' }, take: 5 } }, orderBy: { updatedAt: 'desc' } });
  },

  async changePlan(subscriptionId: string, planSlug: string, billingInterval = 'monthly') {
    const selected = await prisma.plan.findUnique({ where: { slug: planSlug } })
      || await prisma.plan.findFirst({ where: { name: planSlug } });
    if (!selected) throw new HttpError(400, 'Unknown plan');
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        plan: selected.name,
        planId: selected.id,
        billingInterval,
        featureFlags: selected.featureFlags as never,
        metadata: { planChangedAt: new Date().toISOString() }
      },
      include: { clientCompany: true, invoices: true }
    });
  },

  updateStatus(subscriptionId: string, status: SubscriptionStatus) {
    return prisma.subscription.update({ where: { id: subscriptionId }, data: { status }, include: { clientCompany: true, invoices: true } });
  },

  async setTenantProductPlan(clientCompanyId: string, planSlug: string) {
    const plan = await prisma.plan.findFirst({ where: { slug: planSlug, active: true } });
    if (!plan) throw new HttpError(400, 'Unknown or inactive plan slug');

    return prisma.clientCompany.update({
      where: { id: clientCompanyId },
      data: { productPlanId: plan.id },
      include: { productPlan: true }
    });
  },

  retryInvoice(invoiceId: string) {
    return prisma.invoice.update({ where: { id: invoiceId }, data: { status: InvoiceStatus.OPEN } });
  },

  async handleWebhook(event: { provider?: BillingProvider; type: string; subscriptionId?: string; invoiceId?: string; amount?: number; currency?: string }) {
    if (event.invoiceId && ['payment_success', 'payment_failed'].includes(event.type)) {
      return prisma.invoice.update({
        where: { id: event.invoiceId },
        data: { status: event.type === 'payment_success' ? InvoiceStatus.PAID : InvoiceStatus.FAILED, paidAt: event.type === 'payment_success' ? new Date() : undefined }
      });
    }
    if (event.subscriptionId && event.type === 'subscription_canceled') return this.updateStatus(event.subscriptionId, SubscriptionStatus.CANCELLED);
    if (event.subscriptionId && event.type === 'subscription_renewed') return this.updateStatus(event.subscriptionId, SubscriptionStatus.ACTIVE);
    return { ok: true, ignored: true };
  }
};
