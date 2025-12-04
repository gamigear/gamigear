"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";

interface PayPalPaymentProps {
  amount: number;
  currency?: string;
  orderId?: string;
  orderNumber?: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

export default function PayPalPayment({
  amount,
  currency = "VND",
  orderId,
  orderNumber,
  onSuccess,
  onError,
  onCancel,
}: PayPalPaymentProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="text-center py-4 text-red-500">
        PayPal chưa được cấu hình
      </div>
    );
  }

  // Convert VND to USD for PayPal (PayPal doesn't support VND)
  const usdAmount = currency === "VND" ? (amount / 24000).toFixed(2) : amount.toString();

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD", // PayPal doesn't support VND
        intent: "capture",
      }}
    >
      <div className="paypal-button-container">
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 48,
          }}
          createOrder={async () => {
            try {
              const response = await fetch("/api/payment/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  amount,
                  currency,
                  orderId,
                  description: `Order ${orderNumber || orderId}`,
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to create PayPal order");
              }

              const data = await response.json();
              return data.orderId;
            } catch (error) {
              onError("Không thể tạo đơn hàng PayPal");
              throw error;
            }
          }}
          onApprove={async (data) => {
            try {
              const response = await fetch("/api/payment/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paypalOrderId: data.orderID,
                  orderId,
                  orderNumber,
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to capture PayPal payment");
              }

              const result = await response.json();
              
              if (result.success) {
                onSuccess(result.transactionId);
              } else {
                onError("Thanh toán không thành công");
              }
            } catch (error) {
              onError("Lỗi xử lý thanh toán PayPal");
            }
          }}
          onCancel={() => {
            onCancel?.();
          }}
          onError={(err) => {
            console.error("PayPal error:", err);
            onError("Lỗi PayPal");
          }}
        />
        
        {/* Amount display */}
        <div className="text-center text-sm text-gray-500 mt-2">
          Số tiền: ${usdAmount} USD
          {currency === "VND" && (
            <span className="block text-xs">
              (≈ {amount.toLocaleString()}đ)
            </span>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
