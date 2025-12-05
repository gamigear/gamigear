"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Package, Truck, Check, CreditCard, Copy, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image: string;
  productId: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  paymentMethod: string;
  paymentMethodTitle: string;
  customerNote: string;
  billingFirstName: string;
  billingLastName: string;
  billingPhone: string;
  billingEmail: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingCountry: string;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
  "on-hold": { label: "Tạm giữ", color: "bg-gray-100 text-gray-700" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
  refunded: { label: "Đã hoàn tiền", color: "bg-purple-100 text-purple-700" },
  failed: { label: "Thất bại", color: "bg-red-100 text-red-700" },
  shipped: { label: "Đang giao", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
};

const statusSteps = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/mypage/orders/${orderNumber}`);
      return;
    }

    if (isAuthenticated && orderNumber) {
      fetchOrder();
    }
  }, [isAuthenticated, authLoading, orderNumber, router]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/by-number/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentStep = () => {
    if (order?.status === "cancelled" || order?.status === "refunded" || order?.status === "failed") {
      return -1;
    }
    return statusSteps.indexOf(order?.status || "pending");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Package size={64} className="text-gray-200 mb-4" />
        <h2 className="text-lg font-bold mb-2">Không tìm thấy đơn hàng</h2>
        <Link href="/mypage/orders" className="text-primary hover:underline">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="pb-20 pc:pb-10 bg-gray-50 min-h-screen">
      {/* Mobile Header */}
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/mypage/orders" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">Chi tiết đơn hàng</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[800px] px-4 py-6">
        {/* Order Header */}
        <div className="bg-white rounded-xl p-4 pc:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{order.orderNumber}</span>
                <button onClick={copyOrderNumber} className="p-1 hover:bg-gray-100 rounded">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
              <span className="text-sm text-gray-500" suppressHydrationWarning>
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[order.status]?.color || "bg-gray-100"}`}>
              {statusLabels[order.status]?.label || order.status}
            </span>
          </div>

          {/* Status Steps */}
          {currentStep >= 0 && (
            <div className="flex items-center justify-between mt-6">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {index < currentStep ? (
                        <Check size={16} />
                      ) : index === 0 ? (
                        <CreditCard size={14} />
                      ) : index === 1 ? (
                        <Package size={14} />
                      ) : index === 2 ? (
                        <Truck size={14} />
                      ) : (
                        <Check size={14} />
                      )}
                    </div>
                    <span className={`text-xs mt-1 ${index <= currentStep ? "text-green-600" : "text-gray-400"}`}>
                      {statusLabels[step]?.label}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? "bg-green-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-4 pc:p-6 mb-4">
          <h2 className="font-bold mb-4">Sản phẩm ({order.items.length})</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <Link
                key={item.id}
                href={`/goods/detail/${item.productId}`}
                className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium line-clamp-2 mb-1">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <span className="font-bold">{formatPrice(item.total)}</span>
              </Link>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span>{order.shippingTotal === 0 ? "Miễn phí" : formatPrice(order.shippingTotal)}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span>
                <span>-{formatPrice(order.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Tổng cộng</span>
              <span className="text-red-500">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="grid pc:grid-cols-2 gap-4 mb-4">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl p-4 pc:p-6">
            <h2 className="font-bold mb-4">Địa chỉ giao hàng</h2>
            <div className="text-sm space-y-2">
              <p className="font-medium">
                {order.billingLastName} {order.billingFirstName}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <Phone size={14} />
                {order.billingPhone}
              </p>
              {order.billingEmail && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} />
                  {order.billingEmail}
                </p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress1}
                {order.shippingAddress2 && `, ${order.shippingAddress2}`}
              </p>
              <p className="text-gray-600">
                {order.shippingCity}, {order.shippingState}
              </p>
              <p className="text-gray-600">{order.shippingCountry}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl p-4 pc:p-6">
            <h2 className="font-bold mb-4">Thanh toán</h2>
            <p className="text-sm mb-2">{order.paymentMethodTitle}</p>
            {order.customerNote && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Ghi chú:</p>
                <p className="text-sm">{order.customerNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/mypage/orders"
            className="flex-1 py-3 border border-gray-300 font-medium rounded-lg text-center hover:bg-gray-50"
          >
            Quay lại
          </Link>
          {(order.status === "pending" || order.status === "processing") && (
            <button className="flex-1 py-3 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50">
              Hủy đơn hàng
            </button>
          )}
          {order.status === "delivered" && (
            <button className="flex-1 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800">
              Mua lại
            </button>
          )}
        </div>

        {/* Help */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Cần hỗ trợ? Liên hệ hotline: <span className="font-medium text-black">1900 1234</span></p>
        </div>
      </div>
    </div>
  );
}
