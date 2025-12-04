"use client";

import { useState } from "react";
import { Search, Filter, Check, X, Eye, AlertCircle } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";
import { refundRequests } from "@/data/admin";
import { formatPrice } from "@/lib/utils";

const allRefunds = [
  ...refundRequests,
  { id: "REF-003", customer: "이지은", product: "스트라이프 셔츠", amount: 42000, reason: "단순 변심", date: "2024-11-26", status: "approved" },
  { id: "REF-004", customer: "정우진", product: "미니멀 토트백", amount: 38000, reason: "배송 지연", date: "2024-11-25", status: "rejected" },
  { id: "REF-005", customer: "최서연", product: "크롭 가디건", amount: 45000, reason: "색상 불일치", date: "2024-11-24", status: "approved" },
];

export default function RefundsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const pendingCount = allRefunds.filter((r) => !r.status).length;
  const approvedCount = allRefunds.filter((r) => r.status === "approved").length;
  const totalRefunded = allRefunds
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0);

  const filteredRefunds = allRefunds.filter((refund) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") return !refund.status;
    return refund.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Refunds</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={allRefunds.length.toString()} />
        <StatCard title="Pending" value={pendingCount.toString()} />
        <StatCard title="Approved" value={approvedCount.toString()} />
        <StatCard title="Total Refunded" value={formatPrice(totalRefunded)} />
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search refunds..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Refund ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((refund) => (
                <tr key={refund.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{refund.id}</td>
                  <td className="px-6 py-4 text-sm">{refund.customer}</td>
                  <td className="px-6 py-4 text-sm">{refund.product}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatPrice(refund.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{refund.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        refund.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : refund.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {refund.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{refund.date}</td>
                  <td className="px-6 py-4">
                    {!refund.status ? (
                      <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-green-100 rounded-lg" title="Approve">
                          <Check size={16} className="text-green-600" />
                        </button>
                        <button className="p-2 hover:bg-red-100 rounded-lg" title="Reject">
                          <X size={16} className="text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                        <Eye size={16} className="text-gray-400" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
