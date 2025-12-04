import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/payment/paypal";

export async function POST(request: NextRequest) {
  try {
    // Check if PayPal is configured
    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { message: "PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment variables." },
        { status: 503 }
      );
    }

    const { amount, currency, description, orderId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Invalid amount" },
        { status: 400 }
      );
    }

    const { orderId: paypalOrderId, approvalUrl } = await createPayPalOrder(
      amount,
      currency || "VND",
      description || `Order ${orderId}`
    );

    return NextResponse.json({
      orderId: paypalOrderId,
      approvalUrl,
    });
  } catch (error) {
    console.error("Create PayPal order error:", error);
    return NextResponse.json(
      { message: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
