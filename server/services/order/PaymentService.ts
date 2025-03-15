// server/services/order/PaymentService.ts
import Stripe from 'stripe'
import { prisma } from "~/server/lib/prisma"

export class PaymentService {
  public stripe: Stripe; // Changed to public
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia'
    });
  }

  async createPaymentSession(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) throw new Error('Order not found');
    
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Hosting Order #${order.id}` },
          unit_amount: Math.round(order.totalAmount * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/order/${order.id}/success`,
      cancel_url: `${process.env.BASE_URL}/order/${order.id}/cancel`,
      metadata: { orderId }
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id }
    });

    return session;
  }

  async handleWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.fulfillOrder(session.metadata.orderId);
    }
  }

  private async fulfillOrder(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId, status: 'DRAFT' },
        data: { status: 'PAID' },
        include: { items: true }
      });

      // Create invoices
      const invoice = await tx.invoice.create({
        data: {
          userId: order.userId,
          amount: order.totalAmount,
          status: 'PAID',
          paidAt: new Date(),
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          order: { connect: { id: orderId } }
        }
      });

      // Provision services
      const provisioningService = new ProvisioningService();
      for (const item of order.items) {
        await provisioningService.provisionService({
          userId: order.userId,
          serviceType: item.plan.serviceType,
          configuration: item.configuration
        });
      }

      return invoice;
    });
  }
}