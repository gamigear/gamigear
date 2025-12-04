"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Package, ChevronRight, Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
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

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/mypage/orders");
      return;
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/customer/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 pc:pb-10">
      {/* Mobile Header */}
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/mypage" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">Đơn hàng của tôi</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-6">
        <h1 className="hidden pc:block text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          {Object.entries(statusLabels).map(([key, { label }]) => {
            const count = orders.filter(o => o.status === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  statusFilter === key
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-lg font-bold mb-2">Chưa có đơn hàng</h2>
            <p className="text-sm text-gray-500 mb-6">Hãy bắt đầu mua sắm ngay!</p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-black text-white font-medium rounded-lg"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/mypage/orders/${order.orderNumber}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm font-medium">{order.orderNumber}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[order.status]?.color || "bg-gray-100"}`}>
                    {statusLabels[order.status]?.label || order.status}
                  </span>
                </div>

                {/* Order Items Preview */}
                <div className="flex gap-2 mb-3">
                  {order.items.slice(0, 4).map((item, index) => (
                    <div
                      key={item.id}
                      className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {index === 3 && order.items.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">
                      {order.items.length} sản phẩm
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatPrice(order.total)}</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
