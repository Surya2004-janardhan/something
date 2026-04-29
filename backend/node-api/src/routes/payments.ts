import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// POST /api/payments/checkout — create Stripe checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response) => {
  const priceId = process.env.STRIPE_PRO_PRICE_ID || '';
  if (!priceId) {
    res.status(503).json({ error: 'Payments not configured' });
    return;
  }

  // Get or create Stripe customer
  let sub = await prisma.subscription.findUnique({ where: { userId: req.user!.sub } });
  let customerId = sub?.stripeCustomerId;

  if (!customerId) {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    const customer = await stripe.customers.create({ email: user?.email || '' });
    customerId = customer.id;
    if (sub) {
      await prisma.subscription.update({ where: { userId: req.user!.sub }, data: { stripeCustomerId: customerId } });
    } else {
      await prisma.subscription.create({ data: { userId: req.user!.sub, stripeCustomerId: customerId } });
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${FRONTEND_URL}/dashboard/settings?payment=success`,
    cancel_url: `${FRONTEND_URL}/dashboard/settings?payment=cancelled`,
  });

  res.json({ url: session.url });
});

// POST /api/payments/webhook — Stripe webhook
router.post(
  '/webhook',
  // raw body needed for stripe signature verification — mount before express.json()
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch {
      res.status(400).json({ error: 'Webhook signature invalid' });
      return;
    }

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const s = event.data.object as Stripe.Subscription;
        const customerId = typeof s.customer === 'string' ? s.customer : s.customer.id;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: 'pro', status: s.status },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const s = event.data.object as Stripe.Subscription;
        const customerId = typeof s.customer === 'string' ? s.customer : s.customer.id;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: 'free', status: 'cancelled' },
        });
        break;
      }
    }

    res.json({ received: true });
  },
);

// GET /api/payments/subscription — get current user subscription
router.get('/subscription', authenticate, async (req: AuthRequest, res: Response) => {
  const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.sub } });
  res.json(sub || { plan: 'free', status: 'active' });
});

export default router;
