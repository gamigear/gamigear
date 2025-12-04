import { NextRequest, NextResponse } from "next/server";
import { capturePayPalPayment } from "@/lib/payment/paypal";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const { paypalOrderId, orderId, orderNumber } = await request.json();

    if (!paypalOrderId) {
      return NextResponse.json(
        { message: "PayPal order ID is required" },
        { status: 400 }
      );
    }

    const { status, transactionId, amount } = await capturePayPalPayment(paypalOrderId);

    if (status === "COMPLETED") {
      // Update order status
      if (orderId || orderNumber) {
        await prisma.order.updateMany({
          where: orderId ? { id: orderId } : { orderNumber },
          data: {
            status: "processing",
            transactionId: transactionId,
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
              content: `Payment received via PayPal. Transaction ID: ${transactionId}`,
              isCustomerNote: false,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        status,
        transactionId,
        amount,
      });
    }

    return NextResponse.json({
      success: false,
      status,
      message: "Payment not completed",
    });
  } catch (error) {
    console.error("Capture PayPal payment error:", error);
    return NextResponse.json(
      { message: "Failed to capture PayPal payment" },
      { status: 500 }
    );
  }
}
