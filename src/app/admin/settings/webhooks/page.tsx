"use client";

import { useState } from "react";
import { Webhook, Plus, Edit, Trash2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import Card from "@/components/admin/Card";

interface WebhookItem {
  id: string;
  name: string;
  topic: string;
  deliveryUrl: string;
  status: "active" | "paused" | "disabled";
  lastDelivery?: { date: string; success: boolean };
  failureCount: number;
}

const mockWebhooks: WebhookItem[] = [
  {
    id: "wh-1",
    name: "Order Notification",
    topic: "order.created",
    deliveryUrl: "https://example.com/webhooks/orders",
    status: "active",
    lastDelivery: { date: "2025-11-30 14:30", success: true },
    failureCount: 0,
  },
  {
    id: "wh-2",
    name: "Inventory Sync",
    topic: "product.updated",
    deliveryUrl: "https://inventory.example.com/sync",
    status: "active",
    lastDelivery: { date: "2025-11-30 12:15", success: false },
    failureCount: 2,
  },
  {
    id: "wh-3",
    name: "Customer CRM",
    topic: "customer.created",
    deliveryUrl: "https://crm.example.com/api/customers",
    status: "paused",
    lastDelivery: { date: "2025-11-28 09:00", success: true },
    failureCount: 0,
  },
];

const topicOptions = [
  { value: "order.created", label: "Order Created" },
  { value: "order.updated", label: "Order Updated" },
  { value: "order.deleted", label: "Order Deleted" },
  { value: "product.created", label: "Product Created" },
  { value: "product.updated", label: "Product Updated" },
  { value: "product.deleted", label: "Product Deleted" },
  { value: "customer.created", label: "Customer Created" },
  { value: "customer.updated", label: "Customer Updated" },
  { value: "coupon.created", label: "Coupon Created" },
  { value: "coupon.updated", label: "Coupon Updated" },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(mockWebhooks);
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookItem | null>(null);

  const toggleStatus = (id: string) => {
    setWebhooks(webhooks.map(wh => {
      if (wh.id === id) {
        return { ...wh, status: wh.status === "active" ? "paused" : "active" };
      }
      return wh;
    }));
  };

  const deleteWebhook = (id: string) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      setWebhooks(webhooks.filter(wh => wh.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-gray-500 text-sm mt-1">
            Webhooks allow external services to be notified when certain events happen.
          </p>
        </div>
        <button
          onClick={() => { setEditingWebhook(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Webhook
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Topic</th>
                <th className="px-6 py-3 font-medium">Delivery URL</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last Delivery</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Webhook size={16} className="text-blue-600" />
                      <span className="font-medium text-sm">{webhook.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {webhook.topic}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {webhook.deliveryUrl}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        webhook.status === "active"
                          ? "bg-green-100 text-green-700"
                          : webhook.status === "paused"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {webhook.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {webhook.lastDelivery ? (
                      <div className="flex items-center gap-2">
                        {webhook.lastDelivery.success ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : (
                          <XCircle size={14} className="text-red-500" />
                        )}
                        <span className="text-sm text-gray-500">{webhook.lastDelivery.date}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(webhook.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title={webhook.status === "active" ? "Pause" : "Activate"}
                      >
                        <RefreshCw size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => { setEditingWebhook(webhook); setShowModal(true); }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteWebhook(webhook.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Webhook Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingWebhook ? "Edit Webhook" : "Add Webhook"}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={editingWebhook?.name}
                  placeholder="e.g., Order Notification"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <select
                  defaultValue={editingWebhook?.topic}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  {topicOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery URL</label>
                <input
                  type="url"
                  defaultValue={editingWebhook?.deliveryUrl}
                  placeholder="https://example.com/webhook"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  defaultValue={editingWebhook?.status || "active"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  {editingWebhook ? "Save Changes" : "Create Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
