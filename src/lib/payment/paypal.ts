// PayPal configuration and utilities

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_API_URL = process.env.PAYPAL_MODE === "live" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}

// Create PayPal order
export async function createPayPalOrder(
  amount: number,
  currency: string = "USD",
  description?: string
) {
  const accessToken = await getPayPalAccessToken();

  // Convert VND to USD if needed (PayPal doesn't support VND directly)
  let finalAmount = amount;
  let finalCurrency = currency.toUpperCase();
  
  if (finalCurrency === "VND") {
    // Convert VND to USD (approximate rate)
    finalAmount = Math.round((amount / 24000) * 100) / 100;
    finalCurrency = "USD";
  }

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: finalCurrency,
            value: finalAmount.toFixed(2),
          },
          description: description || "Order payment",
        },
      ],
      application_context: {
        brand_name: "Gamigear",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/paypal/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/paypal/cancel`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("PayPal create order error:", error);
    throw new Error("Failed to create PayPal order");
  }

  const order = await response.json();
  return {
    orderId: order.id,
    approvalUrl: order.links.find((link: { rel: string }) => link.rel === "approve")?.href,
  };
}

// Capture PayPal payment
export async function capturePayPalPayment(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("PayPal capture error:", error);
    throw new Error("Failed to capture PayPal payment");
  }

  const captureData = await response.json();
  return {
    status: captureData.status,
    transactionId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
    amount: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount,
  };
}

// Verify PayPal order
export async function verifyPayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to verify PayPal order");
  }

  const order = await response.json();
  return {
    status: order.status,
    amount: order.purchase_units?.[0]?.amount,
    payer: order.payer,
  };
}
