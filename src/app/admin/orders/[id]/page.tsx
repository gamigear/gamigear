"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Printer, Mail } from "lucide-react";
import Card from "@/components/admin/Card";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  billingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: OrderItem[];
  notes: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "대기중", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  processing: { label: "처리중", color: "bg-blue-100 text-blue-700", icon: Package },
  shipped: { label: "배송중", color: "bg-indigo-100 text-indigo-700", icon: Truck },
  delivered: { label: "배송완료", color: "bg-green-100 text-green-700", icon: CheckCircle },
  completed: { label: "완료", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "취소", color: "bg-red-100 text-red-700", icon: Clock },
  refunded: { label: "환불", color: "bg-purple-100 text-purple-700", icon: Clock },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
        setTrackingNumber(data.data.trackingNumber || "");
      } else {
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (updates: Partial<Order>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
        alert('주문이 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">주문을 찾을 수 없습니다.</p>
        <Link href="/admin/orders" className="text-blue-600 hover:underline mt-2 inline-block">
          주문 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">주문 #{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Printer size={16} />
            인쇄
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Mail size={16} />
            이메일 발송
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card title="주문 상품">
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.productImage && (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/products/${item.productId}`} className="font-medium text-sm hover:text-blue-600">
                      {item.productName}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="p-4 bg-gray-50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">소계</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">배송비</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">할인</span>
                  <span className="text-red-500">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                <span>총액</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </Card>

          {/* Shipping Info */}
          <Card title="배송 정보">
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">배송지</h4>
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city} {order.shippingAddress.postalCode}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">청구지</h4>
                <p className="font-medium">{order.billingAddress.name}</p>
                <p className="text-sm text-gray-600">{order.billingAddress.phone}</p>
                <p className="text-sm text-gray-600">{order.billingAddress.address}</p>
                <p className="text-sm text-gray-600">
                  {order.billingAddress.city} {order.billingAddress.postalCode}
                </p>
              </div>
            </div>
          </Card>

          {/* Tracking */}
          <Card title="배송 추적">
            <div className="p-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="운송장 번호 입력"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => updateOrder({ trackingNumber })}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  저장
                </button>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card title="주문 메모">
              <div className="p-6">
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card title="주문 상태">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${statusConfig[order.status]?.color}`}>
                  <StatusIcon size={20} />
                </div>
                <div>
                  <p className="font-medium">{statusConfig[order.status]?.label}</p>
                  <p className="text-xs text-gray-500">
                    마지막 업데이트: {new Date(order.updatedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              
              <select
                value={order.status}
                onChange={(e) => updateOrder({ status: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">대기중</option>
                <option value="processing">처리중</option>
                <option value="shipped">배송중</option>
                <option value="delivered">배송완료</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
                <option value="refunded">환불</option>
              </select>
            </div>
          </Card>

          {/* Customer */}
          <Card title="고객 정보">
            <div className="p-6 space-y-3">
              <div>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm text-gray-500">{order.customer.email}</p>
                <p className="text-sm text-gray-500">{order.customer.phone}</p>
              </div>
              <Link
                href={`/admin/customers/${order.customer.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                고객 상세보기 →
              </Link>
            </div>
          </Card>

          {/* Payment */}
          <Card title="결제 정보">
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">결제 방법</span>
                <span className="text-sm font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">결제 상태</span>
                <span className={`text-sm font-medium ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus === 'paid' ? '결제완료' : '미결제'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">결제 금액</span>
                <span className="text-sm font-bold">{formatPrice(order.total)}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card title="액션">
            <div className="p-6 space-y-3">
              {order.status === 'pending' && (
                <button
                  onClick={() => updateOrder({ status: 'processing' })}
                  disabled={saving}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  주문 처리 시작
                </button>
              )}
              {order.status === 'processing' && (
                <button
                  onClick={() => updateOrder({ status: 'shipped' })}
                  disabled={saving}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  배송 시작
                </button>
              )}
              {order.status === 'shipped' && (
                <button
                  onClick={() => updateOrder({ status: 'delivered' })}
                  disabled={saving}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  배송 완료
                </button>
              )}
              {!['cancelled', 'refunded', 'completed'].includes(order.status) && (
                <button
                  onClick={() => {
                    if (confirm('정말 이 주문을 취소하시겠습니까?')) {
                      updateOrder({ status: 'cancelled' });
                    }
                  }}
                  disabled={saving}
                  className="w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  주문 취소
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
