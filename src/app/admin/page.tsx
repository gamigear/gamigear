"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { DollarSign, ShoppingCart, Users, Star, Package } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  revenueChange: number;
  ordersChange: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  sales: number;
  rating: number;
  status: string;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  ordersCount: number;
  totalSpent: number;
}

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    revenueChange: 0,
    ordersChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        fetch('/api/orders?per_page=10'),
        fetch('/api/products?per_page=10&status=all'),
        fetch('/api/customers?per_page=10&orderby=totalSpent&order=desc'),
      ]);

      const [ordersData, productsData, customersData] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        customersRes.json(),
      ]);

      // Calculate stats
      const orders = ordersData.data || [];
      const products = productsData.data || [];
      const customers = customersData.data || [];

      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

      setStats({
        totalRevenue,
        totalOrders: ordersData.meta?.total || orders.length,
        totalCustomers: customersData.meta?.total || customers.length,
        totalProducts: productsData.meta?.total || products.length,
        pendingOrders,
        revenueChange: 12.5,
        ordersChange: 8.2,
      });

      // Set recent orders
      setRecentOrders(orders.slice(0, 5).map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.customer?.name || 'Guest',
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })));

      // Set top products
      setTopProducts(products.slice(0, 5).map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0]?.src || p.images?.[0] || '',
        price: p.salePrice || p.price,
        sales: p.salesCount || 0,
        rating: p.averageRating || 0,
        status: p.status,
      })));

      // Set top customers
      setTopCustomers(customers.slice(0, 5).map((c: any) => ({
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email.split('@')[0],
        email: c.email,
        avatar: c.avatarUrl || '',
        ordersCount: c.ordersCount || 0,
        totalSpent: c.totalSpent || 0,
      })));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t.orders.pending,
      processing: t.orders.processing,
      shipped: t.orders.shipped,
      delivered: t.orders.delivered,
      completed: t.orders.delivered,
      cancelled: t.orders.cancelled,
      published: t.common.published,
      draft: t.common.draft,
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.dashboard.totalSales}
          value={formatPrice(stats.totalRevenue)}
          change={stats.revenueChange}
          icon={<DollarSign size={24} className="text-green-600" />}
        />
        <StatCard
          title={t.dashboard.totalOrders}
          value={stats.totalOrders.toString()}
          change={stats.ordersChange}
          icon={<ShoppingCart size={24} className="text-blue-600" />}
        />
        <StatCard
          title={t.dashboard.totalCustomers}
          value={stats.totalCustomers.toLocaleString()}
          icon={<Users size={24} className="text-purple-600" />}
        />
        <StatCard
          title={t.dashboard.totalProducts}
          value={stats.totalProducts.toString()}
          icon={<Package size={24} className="text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card
          title={t.dashboard.recentOrders}
          className="lg:col-span-2"
          headerAction={
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
              {t.common.view}
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">{t.orders.orderNumber}</th>
                  <th className="px-6 py-3 font-medium">{t.orders.customer}</th>
                  <th className="px-6 py-3 font-medium">{t.orders.total}</th>
                  <th className="px-6 py-3 font-medium">{t.common.status}</th>
                  <th className="px-6 py-3 font-medium">{t.common.date}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {t.common.noData}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">{order.customer}</td>
                      <td className="px-6 py-4 text-sm">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Customers */}
        <Card
          title={t.nav.customers}
          headerAction={
            <Link href="/admin/customers" className="text-sm text-blue-600 hover:underline">
              {t.common.view}
            </Link>
          }
        >
          <div className="p-4 space-y-4">
            {topCustomers.length === 0 ? (
              <p className="text-center text-gray-500 py-4">{t.common.noData}</p>
            ) : (
              topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                    {customer.avatar ? (
                      <Image src={customer.avatar} alt={customer.name} fill className="object-cover" />
                    ) : (
                      <span className="text-blue-600 font-medium">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.ordersCount} {t.nav.orders}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(customer.totalSpent)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Popular Products */}
      <Card
        title={t.dashboard.topProducts}
        headerAction={
          <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
            {t.common.view}
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">{t.nav.products}</th>
                <th className="px-6 py-3 font-medium">{t.products.price}</th>
                <th className="px-6 py-3 font-medium">Sales</th>
                <th className="px-6 py-3 font-medium">{t.products.rating}</th>
                <th className="px-6 py-3 font-medium">{t.common.status}</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {t.common.noData}
                  </td>
                </tr>
              ) : (
                topProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-3 hover:text-blue-600">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-sm">{product.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 text-sm">{product.sales}</td>
                    <td className="px-6 py-4">
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm">{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
