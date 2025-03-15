// server/services/order/CheckoutService.ts
import { prisma } from "~/server/lib/prisma"
import { PricingService } from "~/server/services/core/PricingService"
import { ProvisioningService } from "~/server/services/core/ProvisioningService"

interface CartItemWithPrice {
    item: any // Replace with proper type
    price: {
      total: number
    }
}
  

export class CheckoutService {
  private pricingService = new PricingService();
  private provisioningService = new ProvisioningService();

  async initiateCheckout(userId: string) {
    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { plan: true } } },
        rejectOnNotFound: true
      });

      // Calculate total price
      const itemsWithPrice = await Promise.all(
        cart.items.map(async (item) => ({
          item,
          price: await this.pricingService.calculatePrice({
            planId: item.planId,
            configuration: item.configuration,
            duration: 'monthly'
          })
        }))
      );

      const total = itemsWithPrice.reduce(
        (sum: number, { price }: CartItemWithPrice) => sum + price.total,
        0
      );

      // Create order draft
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: total,
          status: 'DRAFT',
          items: {
            create: itemsWithPrice.map(({ item, price }) => ({
              planId: item.planId,
              configuration: item.configuration,
              unitPrice: price.total,
              quantity: item.quantity
            }))
          }
        }
      });

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }
}