import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhook } from "@/lib/payment/stripe";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing stripe signature" },
        { status: 400 }
      );
    }

    const event = await handleStripeWebhook(payload, signature);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { orderId, orderNumber } = paymentIntent.metadata;

        if (orderId || orderNumber) {
          // Update order status
          await prisma.order.updateMany({
            where: orderId ? { id: orderId } : { orderNumber },
            data: {
              status: "processing",
              transactionId: paymentIntent.id,
              datePaid: new Date(),
            },
          });

          // Add order note
          const order = await prisma.order.findFirst({
            where: orderId ? { id: orderId } : { orderNumber },
          });

          if (order) {
            await prisma.orderNote.create({
              data: {
                orderId: order.id,
                content: `Payment received via Stripe. Transaction ID: ${paymentIntent.id}`,
                isCustomerNote: false,
              },
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const { orderId, orderNumber } = paymentIntent.metadata;

        if (orderId || orderNumber) {
          await prisma.order.updateMany({
            where: orderId ? { id: orderId } : { orderNumber },
            data: {
              status: "failed",
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { message: "Webhook error" },
      { status: 400 }
    );
  }
}
