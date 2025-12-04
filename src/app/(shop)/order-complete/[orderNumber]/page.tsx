"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, Package, Truck, CreditCard, Copy, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  paymentMethod: string;
  paymentMethodTitle: string;
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
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    image: string;
  }[];
}

export default function OrderCompletePage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pc:py-12">
      <div className="mx-auto w-full max-w-[800px] px-4">
        {/* Success Header */}
        <div className="bg-white rounded-2xl p-6 pc:p-10 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-2xl pc:text-3xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-4">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.
          </p>
          
          {/* Order Number */}
          <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="text-gray-600">Mã đơn hàng:</span>
            <span className="font-bold">{orderNumber}</span>
            <button
              onClick={copyOrderNumber}
              className="p-1 hover:bg-gray-200 rounded transition"
              title="Sao chép"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Order Status Steps */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="font-bold mb-4">Trạng thái đơn hàng</h2>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
                <Check size={20} />
              </div>
              <span className="text-xs text-center">Đã đặt hàng</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-green-500 w-0"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
                <CreditCard size={20} />
              </div>
              <span className="text-xs text-center text-gray-400">Xác nhận</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
                <Package size={20} />
              </div>
              <span className="text-xs text-center text-gray-400">Đang giao</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
                <Truck size={20} />
              </div>
              <span className="text-xs text-center text-gray-400">Hoàn thành</span>
            </div>
          </div>
        </div>

        {order && (
          <>
            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 mb-6">
              <h2 className="font-bold mb-4">Sản phẩm đã đặt</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold">{formatPrice(item.total)}</span>
                  </div>
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

            {/* Shipping & Payment Info */}
            <div className="grid pc:grid-cols-2 gap-6 mb-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-bold mb-4">Địa chỉ giao hàng</h2>
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    {order.billingLastName} {order.billingFirstName}
                  </p>
                  <p className="text-gray-600">{order.billingPhone}</p>
                  <p className="text-gray-600">{order.billingEmail}</p>
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
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-bold mb-4">Phương thức thanh toán</h2>
                <p className="text-sm">{order.paymentMethodTitle}</p>
                {order.paymentMethod === "bank" && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-2">
                      Thông tin chuyển khoản:
                    </p>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <p>Ngân hàng: Vietcombank</p>
                      <p>Số TK: 1234567890</p>
                      <p>Chủ TK: CONG TY ABC</p>
                      <p>Nội dung: {orderNumber}</p>
                    </div>
                  </div>
                )}
                {order.paymentMethod === "cod" && (
                  <p className="text-sm text-gray-500 mt-2">
                    Bạn sẽ thanh toán khi nhận hàng
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col pc:flex-row gap-4">
          <Link
            href="/mypage/orders"
            className="flex-1 py-4 bg-black text-white font-medium rounded-lg text-center hover:bg-gray-800 transition"
          >
            Xem đơn hàng của tôi
          </Link>
          <Link
            href="/"
            className="flex-1 py-4 border border-gray-300 font-medium rounded-lg text-center hover:bg-gray-50 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Help */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Bạn cần hỗ trợ? Liên hệ hotline: <span className="font-medium text-black">1900 1234</span></p>
          <p>hoặc email: <span className="font-medium text-black">support@histore.vn</span></p>
        </div>
      </div>
    </div>
  );
}
