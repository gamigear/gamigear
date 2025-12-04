"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Clock, CheckCircle, Search, Filter, Eye, Truck } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  paymentMethod: string;
  itemCount: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

export default function OrdersPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();
      
      setOrders(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      
      // Fetch stats
      const statsResponse = await fetch('/api/orders/stats');
      const statsData = await statsResponse.json();
      setStats(statsData.data || stats);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(search) ||
      order.customer.name.toLowerCase().includes(search) ||
      order.customer.email.toLowerCase().includes(search)
    );
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t.orders.pending,
      processing: t.orders.processing,
      shipped: t.orders.shipped,
      delivered: t.orders.delivered,
      completed: t.orders.delivered,
      cancelled: t.orders.cancelled,
      refunded: t.orders.refunded,
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.orders.title}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.dashboard.totalOrders}
          value={stats.total.toString()}
          icon={<ShoppingCart size={24} className="text-blue-600" />}
        />
        <StatCard
          title={t.orders.pending}
          value={stats.pending.toString()}
          icon={<Clock size={24} className="text-yellow-600" />}
        />
        <StatCard
          title={t.orders.processing}
          value={stats.processing.toString()}
          icon={<Truck size={24} className="text-blue-600" />}
        />
        <StatCard
          title={t.orders.delivered}
          value={stats.completed.toString()}
          icon={<CheckCircle size={24} className="text-green-600" />}
        />
      </div>

      {/* Orders Table */}
      <Card>
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`${t.orders.orderNumber}, ${t.orders.customer}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.common.all}</option>
              <option value="pending">{t.orders.pending}</option>
              <option value="processing">{t.orders.processing}</option>
              <option value="shipped">{t.orders.shipped}</option>
              <option value="delivered">{t.orders.delivered}</option>
              <option value="completed">{t.orders.delivered}</option>
              <option value="cancelled">{t.orders.cancelled}</option>
              <option value="refunded">{t.orders.refunded}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">{t.orders.orderNumber}</th>
                  <th className="px-6 py-3 font-medium">{t.orders.customer}</th>
                  <th className="px-6 py-3 font-medium">{t.orders.orderItems}</th>
                  <th className="px-6 py-3 font-medium">{t.orders.total}</th>
                  <th className="px-6 py-3 font-medium">{t.orders.paymentMethod}</th>
                  <th className="px-6 py-3 font-medium">{t.common.status}</th>
                  <th className="px-6 py-3 font-medium">{t.orders.orderDate}</th>
                  <th className="px-6 py-3 font-medium">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {t.common.noData}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-sm text-blue-600 hover:underline">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-sm">{order.customer.name}</p>
                          <p className="text-xs text-gray-500">{order.customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{order.itemCount}</td>
                      <td className="px-6 py-4 text-sm font-medium">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4 text-sm">{order.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-2 py-1 text-xs rounded-full border-0 ${statusColors[order.status] || 'bg-gray-100'}`}
                        >
                          <option value="pending">{t.orders.pending}</option>
                          <option value="processing">{t.orders.processing}</option>
                          <option value="shipped">{t.orders.shipped}</option>
                          <option value="delivered">{t.orders.delivered}</option>
                          <option value="completed">{t.orders.delivered}</option>
                          <option value="cancelled">{t.orders.cancelled}</option>
                          <option value="refunded">{t.orders.refunded}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/orders/${order.id}`} className="p-1 hover:bg-gray-100 rounded" title={t.common.view}>
                            <Eye size={16} className="text-gray-400" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredOrders.length} {t.common.items}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {t.common.previous}
            </button>
            <span className="px-3 py-1 text-sm">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {t.common.next}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
