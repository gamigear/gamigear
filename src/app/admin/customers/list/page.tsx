"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Filter, Eye, Edit, MoreHorizontal, Mail, Phone } from "lucide-react";
import Card from "@/components/admin/Card";
import { formatPrice } from "@/lib/utils";

// Mock data
const mockCustomers = [
  {
    id: "cust-001",
    name: "홍길동",
    email: "hong@example.com",
    phone: "010-1234-5678",
    avatar: "https://i.pravatar.cc/150?img=1",
    ordersCount: 12,
    totalSpent: 1250000,
    status: "active",
    lastOrder: "2025-11-30",
    createdAt: "2024-06-15",
  },
  {
    id: "cust-002",
    name: "김철수",
    email: "kim@example.com",
    phone: "010-2345-6789",
    avatar: "https://i.pravatar.cc/150?img=2",
    ordersCount: 8,
    totalSpent: 890000,
    status: "active",
    lastOrder: "2025-11-28",
    createdAt: "2024-08-20",
  },
  {
    id: "cust-003",
    name: "이영희",
    email: "lee@example.com",
    phone: "010-3456-7890",
    avatar: "https://i.pravatar.cc/150?img=3",
    ordersCount: 5,
    totalSpent: 456000,
    status: "active",
    lastOrder: "2025-11-25",
    createdAt: "2024-09-10",
  },
  {
    id: "cust-004",
    name: "박민수",
    email: "park@example.com",
    phone: "010-4567-8901",
    avatar: "https://i.pravatar.cc/150?img=4",
    ordersCount: 3,
    totalSpent: 234000,
    status: "inactive",
    lastOrder: "2025-10-15",
    createdAt: "2024-10-05",
  },
  {
    id: "cust-005",
    name: "최지은",
    email: "choi@example.com",
    phone: "010-5678-9012",
    avatar: "https://i.pravatar.cc/150?img=5",
    ordersCount: 15,
    totalSpent: 2340000,
    status: "active",
    lastOrder: "2025-11-29",
    createdAt: "2024-03-22",
  },
];

export default function CustomerListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.includes(searchTerm) ||
      customer.email.includes(searchTerm) ||
      customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customer List</h1>

      <Card>
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Orders</th>
                <th className="px-6 py-3 font-medium">Total Spent</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last Order</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <Image src={customer.avatar} alt={customer.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-gray-500">Since {customer.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail size={14} className="text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone size={14} className="text-gray-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{customer.ordersCount}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatPrice(customer.totalSpent)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        customer.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {customer.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{customer.lastOrder}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View">
                        <Eye size={16} className="text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                        <Edit size={16} className="text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="More">
                        <MoreHorizontal size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredCustomers.length} of {mockCustomers.length} customers
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
