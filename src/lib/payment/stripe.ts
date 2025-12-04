import Stripe from "stripe";

// Server-side Stripe instance
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
    })
  : null;

export function isStripeConfigured(): boolean {
  return !!stripeSecretKey && !!stripe;
}

// Create a payment intent for Stripe
export async function createStripePaymentIntent(
  amount: number,
  currency: string = "vnd",
  metadata?: Record<string, string>
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe expects amount in smallest currency unit
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    throw error;
  }
}

// Verify payment intent status
export async function verifyStripePayment(paymentIntentId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error("Stripe verification error:", error);
    throw error;
  }
}

// Handle Stripe webhook events
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error("Stripe webhook error:", error);
    throw error;
  }
}
