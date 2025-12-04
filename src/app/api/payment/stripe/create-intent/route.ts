import { NextRequest, NextResponse } from "next/server";
import { createStripePaymentIntent, isStripeConfigured } from "@/lib/payment/stripe";

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { message: "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables." },
        { status: 503 }
      );
    }

    const { amount, currency, orderId, orderNumber } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Invalid amount" },
        { status: 400 }
      );
    }

    const { clientSecret, paymentIntentId } = await createStripePaymentIntent(
      amount,
      currency || "vnd",
      {
        orderId: orderId || "",
        orderNumber: orderNumber || "",
      }
    );

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { message: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
