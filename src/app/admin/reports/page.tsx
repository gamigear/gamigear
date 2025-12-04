"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Package, Download, Loader2 } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type ReportType = "sales" | "orders" | "customers" | "products";
type Period = "24h" | "7d" | "30d" | "90d" | "1y";

interface SalesData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalDiscount: number;
    totalShipping: number;
    totalTax: number;
  };
  chartData: Array<{ date: string; revenue: number; orders: number }>;
}

interface ProductsData {
  topProducts: Array<{
    id: string;
    name: string;
    sku: string;
    image: string | null;
    quantity: number;
    revenue: number;
  }>;
  totalProductsSold: number;
  uniqueProducts: number;
}

interface CustomersData {
  newCustomers: number;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    ordersCount: number;
    totalSpent: number;
  }>;
  orderBreakdown: {
    newCustomerOrders: number;
    returningCustomerOrders: number;
  };
}

interface OrdersData {
  byStatus: Array<{ status: string; count: number; total: number }>;
  byPaymentMethod: Array<{ method: string; count: number; total: number }>;
  dailyOrders: Array<{ date: string; count: number }>;
}

export default function ReportsPage() {
  const { t } = useI18n();
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [productsData, setProductsData] = useState<ProductsData | null>(null);
  const [customersData, setCustomersData] = useState<CustomersData | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?type=${reportType}&period=${period}`);
      const data = await response.json();
      
      switch (reportType) {
        case "sales":
          setSalesData(data);
          break;
        case "products":
          setProductsData(data);
          break;
        case "customers":
          setCustomersData(data);
          break;
        case "orders":
          setOrdersData(data);
          break;
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      refunded: "Hoàn tiền",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Báo cáo</h1>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="24h">24 giờ qua</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Download size={16} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: "sales", label: "Doanh thu", icon: DollarSign },
          { id: "orders", label: "Đơn hàng", icon: ShoppingCart },
          { id: "customers", label: "Khách hàng", icon: Users },
          { id: "products", label: "Sản phẩm", icon: Package },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as ReportType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === tab.id
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Sales Report */}
          {reportType === "sales" && salesData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Tổng doanh thu"
                  value={formatPrice(salesData.summary.totalRevenue)}
                  icon={<DollarSign size={24} className="text-green-600" />}
                />
                <StatCard
                  title="Tổng đơn hàng"
                  value={salesData.summary.totalOrders.toString()}
                  icon={<ShoppingCart size={24} className="text-blue-600" />}
                />
                <StatCard
                  title="Giá trị TB/đơn"
                  value={formatPrice(salesData.summary.averageOrderValue)}
                  icon={<TrendingUp size={24} className="text-purple-600" />}
                />
                <StatCard
                  title="Tổng giảm giá"
                  value={formatPrice(salesData.summary.totalDiscount)}
                  icon={<Package size={24} className="text-orange-600" />}
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card title="Biểu đồ doanh thu" className="lg:col-span-2">
                  <div className="p-4">
                    {salesData.chartData.length > 0 ? (
                      <>
                        <div className="h-64 flex items-end gap-2">
                          {salesData.chartData.map((item, index) => {
                            const maxRevenue = Math.max(...salesData.chartData.map(d => d.revenue));
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                                  style={{ height: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%`, minHeight: item.revenue > 0 ? '4px' : '0' }}
                                  title={formatPrice(item.revenue)}
                                />
                                <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-center gap-6 mt-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded" />
                            <span className="text-gray-600">Doanh thu</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        Chưa có dữ liệu trong khoảng thời gian này
                      </div>
                    )}
                  </div>
                </Card>

                <Card title="Tổng kết">
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Doanh thu gộp</span>
                      <span className="font-medium">{formatPrice(salesData.summary.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Giảm giá</span>
                      <span className="font-medium text-red-600">-{formatPrice(salesData.summary.totalDiscount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="font-medium">{formatPrice(salesData.summary.totalShipping)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Thuế</span>
                      <span className="font-medium">{formatPrice(salesData.summary.totalTax)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 font-bold">
                      <span>Doanh thu ròng</span>
                      <span>{formatPrice(salesData.summary.totalRevenue - salesData.summary.totalDiscount)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Products Report */}
          {reportType === "products" && productsData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  title="Tổng SP đã bán"
                  value={productsData.totalProductsSold.toString()}
                  icon={<Package size={24} className="text-blue-600" />}
                />
                <StatCard
                  title="Số loại SP"
                  value={productsData.uniqueProducts.toString()}
                  icon={<BarChart3 size={24} className="text-green-600" />}
                />
              </div>

              <Card title="Sản phẩm bán chạy nhất">
                <div className="overflow-x-auto">
                  {productsData.topProducts.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                          <th className="px-6 py-3 font-medium">#</th>
                          <th className="px-6 py-3 font-medium">Sản phẩm</th>
                          <th className="px-6 py-3 font-medium">SKU</th>
                          <th className="px-6 py-3 font-medium">Số lượng</th>
                          <th className="px-6 py-3 font-medium">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsData.topProducts.map((product, index) => (
                          <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-400">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{product.sku || "-"}</td>
                            <td className="px-6 py-4 text-sm">{product.quantity}</td>
                            <td className="px-6 py-4 text-sm font-medium">{formatPrice(product.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Chưa có dữ liệu sản phẩm trong khoảng thời gian này
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* Customers Report */}
          {reportType === "customers" && customersData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Khách hàng mới"
                  value={customersData.newCustomers.toString()}
                  icon={<Users size={24} className="text-blue-600" />}
                />
                <StatCard
                  title="Đơn từ KH mới"
                  value={customersData.orderBreakdown.newCustomerOrders.toString()}
                  icon={<ShoppingCart size={24} className="text-green-600" />}
                />
                <StatCard
                  title="Đơn từ KH cũ"
                  value={customersData.orderBreakdown.returningCustomerOrders.toString()}
                  icon={<TrendingUp size={24} className="text-purple-600" />}
                />
              </div>

              <Card title="Khách hàng chi tiêu nhiều nhất">
                <div className="overflow-x-auto">
                  {customersData.topCustomers.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                          <th className="px-6 py-3 font-medium">#</th>
                          <th className="px-6 py-3 font-medium">Khách hàng</th>
                          <th className="px-6 py-3 font-medium">Email</th>
                          <th className="px-6 py-3 font-medium">Số đơn</th>
                          <th className="px-6 py-3 font-medium">Tổng chi tiêu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customersData.topCustomers.map((customer, index) => (
                          <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-400">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{customer.email}</td>
                            <td className="px-6 py-4 text-sm">{customer.ordersCount}</td>
                            <td className="px-6 py-4 text-sm font-medium">{formatPrice(customer.totalSpent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Chưa có dữ liệu khách hàng trong khoảng thời gian này
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* Orders Report */}
          {reportType === "orders" && ordersData && (
            <>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card title="Đơn hàng theo trạng thái">
                  <div className="p-4 space-y-3">
                    {ordersData.byStatus.length > 0 ? (
                      ordersData.byStatus.map((item) => (
                        <div key={item.status} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                              {getStatusLabel(item.status)}
                            </span>
                            <span className="text-sm text-gray-600">{item.count} đơn</span>
                          </div>
                          <span className="font-medium">{formatPrice(item.total)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">Chưa có dữ liệu</div>
                    )}
                  </div>
                </Card>

                <Card title="Đơn hàng theo phương thức thanh toán">
                  <div className="p-4 space-y-3">
                    {ordersData.byPaymentMethod.length > 0 ? (
                      ordersData.byPaymentMethod.map((item) => (
                        <div key={item.method} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{item.method}</span>
                            <span className="text-sm text-gray-600">{item.count} đơn</span>
                          </div>
                          <span className="font-medium">{formatPrice(item.total)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">Chưa có dữ liệu</div>
                    )}
                  </div>
                </Card>
              </div>

              <Card title="Số đơn hàng theo ngày">
                <div className="p-4">
                  {ordersData.dailyOrders.length > 0 ? (
                    <div className="h-64 flex items-end gap-2">
                      {ordersData.dailyOrders.map((item, index) => {
                        const maxCount = Math.max(...ordersData.dailyOrders.map(d => d.count));
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div
                              className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                              style={{ height: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                              title={`${item.count} đơn`}
                            />
                            <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Chưa có dữ liệu trong khoảng thời gian này
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
