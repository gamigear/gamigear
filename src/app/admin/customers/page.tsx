"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  ShoppingBag,
  Star,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Download,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string | null;
  avatarUrl: string | null;
  phone: string | null;
  provider: string | null;
  isPayingCustomer: boolean;
  ordersCount: number;
  reviewsCount: number;
  totalSpent: number;
  createdAt: string;
  lastActive: string | null;
  billingCity: string | null;
  billingCountry: string | null;
}

interface CustomersResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export default function CustomersPage() {
  const { t } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 20, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [meta.page, searchQuery, statusFilter, sortBy, sortOrder]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: meta.page.toString(),
        per_page: meta.perPage.toString(),
        orderby: sortBy,
        order: sortOrder,
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/customers?${params}`);
      const data: CustomersResponse = await response.json();

      setCustomers(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, perPage: 20, totalPages: 1 });
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta((prev) => ({ ...prev, page: 1 }));
    fetchCustomers();
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
    setActionMenuId(null);
  };

  const getCustomerName = (customer: Customer) => {
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
    }
    return customer.username || customer.email.split("@")[0];
  };

  const getInitials = (customer: Customer) => {
    const name = getCustomerName(customer);
    return name.charAt(0).toUpperCase();
  };

  const getProviderBadge = (provider: string | null) => {
    if (!provider) return null;
    const colors: Record<string, string> = {
      google: "bg-red-100 text-red-700",
      facebook: "bg-blue-100 text-blue-700",
      kakao: "bg-yellow-100 text-yellow-700",
      naver: "bg-green-100 text-green-700",
      apple: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${colors[provider] || "bg-gray-100 text-gray-700"}`}>
        {provider}
      </span>
    );
  };

  const exportCustomers = () => {
    // Create CSV content
    const headers = ["ID", "Email", "Name", "Phone", "Orders", "Total Spent", "Joined"];
    const rows = customers.map((c) => [
      c.id,
      c.email,
      getCustomerName(c),
      c.phone || "",
      c.ordersCount,
      c.totalSpent,
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Stats
  const stats = {
    total: meta.total,
    paying: customers.filter((c) => c.isPayingCustomer).length,
    totalSpent: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
    avgOrders: customers.length > 0 
      ? Math.round(customers.reduce((sum, c) => sum + c.ordersCount, 0) / customers.length * 10) / 10 
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.customers.title}</h1>
          <p className="text-gray-500 mt-1">Manage registered customers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCustomers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paying Customers</p>
              <p className="text-xl font-bold">{stats.paying}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold">{formatPrice(stats.totalSpent)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Orders</p>
              <p className="text-xl font-bold">{stats.avgOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="paying">Paying</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="totalSpent-desc">Highest Spent</option>
              <option value="ordersCount-desc">Most Orders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Orders</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Total Spent</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Joined</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                          {customer.avatarUrl ? (
                            <img src={customer.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-blue-600 font-medium">{getInitials(customer)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{getCustomerName(customer)}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">{customer.email}</p>
                            {getProviderBadge(customer.provider)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Phone size={14} />
                            {customer.phone}
                          </div>
                        )}
                        {customer.billingCity && (
                          <p className="text-sm text-gray-500">
                            {customer.billingCity}, {customer.billingCountry}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag size={16} className="text-gray-400" />
                        <span className="font-medium">{customer.ordersCount}</span>
                      </div>
                      {customer.reviewsCount > 0 && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                          <Star size={14} />
                          {customer.reviewsCount} reviews
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{formatPrice(customer.totalSpent)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                      {customer.lastActive && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last active: {new Date(customer.lastActive).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {customer.isPayingCustomer ? (
                        <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Paying
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDetailModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={18} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => setActionMenuId(actionMenuId === customer.id ? null : customer.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {actionMenuId === customer.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowDetailModal(true);
                                  setActionMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                              <a
                                href={`mailto:${customer.email}`}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                              >
                                <Mail size={16} />
                                Send Email
                              </a>
                              <hr className="my-1" />
                              <button
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                Delete Customer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {(meta.page - 1) * meta.perPage + 1} to{" "}
              {Math.min(meta.page * meta.perPage, meta.total)} of {meta.total} customers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMeta((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={meta.page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-2 text-sm">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setMeta((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={meta.page === meta.totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}


// Customer Detail Modal Component
function CustomerDetailModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders();
  }, [customer.id]);

  const fetchCustomerOrders = async () => {
    try {
      const response = await fetch(`/api/orders?customer_id=${customer.id}&per_page=5`);
      const data = await response.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = () => {
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
    }
    return customer.username || customer.email.split("@")[0];
  };

  const getInitials = () => {
    const name = getCustomerName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Customer Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {customer.avatarUrl ? (
                <img src={customer.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-blue-600 font-medium">{getInitials()}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{getCustomerName()}</h3>
              <p className="text-gray-500">{customer.email}</p>
              {customer.phone && (
                <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                  <Phone size={14} />
                  {customer.phone}
                </p>
              )}
              {customer.provider && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  Signed up via {customer.provider}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{customer.ordersCount}</p>
              <p className="text-sm text-gray-500">Orders</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{formatPrice(customer.totalSpent)}</p>
              <p className="text-sm text-gray-500">Total Spent</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{customer.reviewsCount}</p>
              <p className="text-sm text-gray-500">Reviews</p>
            </div>
          </div>

          {/* Account Info */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-3">Account Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Customer ID</p>
                <p className="font-mono">{customer.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Username</p>
                <p>{customer.username || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Joined</p>
                <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Active</p>
                <p>{customer.lastActive ? new Date(customer.lastActive).toLocaleDateString() : "Never"}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p>
                  {customer.isPayingCustomer ? (
                    <span className="text-green-600">Paying Customer</span>
                  ) : (
                    <span className="text-gray-600">Inactive</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p>
                  {customer.billingCity && customer.billingCountry
                    ? `${customer.billingCity}, ${customer.billingCountry}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-3">Recent Orders</h4>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={`mailto:${customer.email}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Mail size={18} />
              Send Email
            </a>
            <Link
              href={`/admin/orders?customer_id=${customer.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <ShoppingBag size={18} />
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
