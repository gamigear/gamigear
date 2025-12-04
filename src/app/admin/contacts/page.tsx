"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Search,
  Eye,
  Trash2,
  Archive,
  Reply,
  X,
  Clock,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface Counts {
  all: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  read: "bg-yellow-100 text-yellow-700",
  replied: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<string, string> = {
  new: "Mới",
  read: "Đã đọc",
  replied: "Đã trả lời",
  archived: "Lưu trữ",
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, new: 0, read: 0, replied: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchContacts();
  }, [filter, search]);

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/contacts?${params.toString()}`);
      const data = await res.json();
      setContacts(data.data || []);
      setCounts(data.counts || { all: 0, new: 0, read: 0, replied: 0, archived: 0 });
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const openContact = async (contact: Contact) => {
    setSelectedContact(contact);
    setReplyText(contact.reply || "");
    setShowModal(true);

    // Mark as read
    if (contact.status === "new") {
      await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      fetchContacts();
    }
  };

  const handleReply = async () => {
    if (!selectedContact || !replyText.trim()) return;

    setSending(true);
    try {
      await fetch(`/api/contacts/${selectedContact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      });
      setShowModal(false);
      fetchContacts();
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchContacts();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa liên hệ này?")) return;

    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      fetchContacts();
      if (selectedContact?.id === id) setShowModal(false);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý liên hệ</h1>
        <p className="text-gray-600">Xem và phản hồi tin nhắn từ khách hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { key: "all", label: "Tất cả", icon: Mail, color: "bg-gray-500" },
          { key: "new", label: "Mới", icon: AlertCircle, color: "bg-blue-500" },
          { key: "read", label: "Đã đọc", icon: Eye, color: "bg-yellow-500" },
          { key: "replied", label: "Đã trả lời", icon: CheckCircle, color: "bg-green-500" },
          { key: "archived", label: "Lưu trữ", icon: Archive, color: "bg-gray-400" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`p-4 rounded-xl border-2 transition-all ${
              filter === item.key
                ? "border-blue-500 bg-blue-50"
                : "border-transparent bg-white hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">{counts[item.key as keyof Counts]}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, chủ đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Không có liên hệ nào</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  contact.status === "new" ? "bg-blue-50/50" : ""
                }`}
                onClick={() => openContact(contact)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{contact.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[contact.status]}`}>
                        {statusLabels[contact.status]}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{contact.subject}</p>
                    <p className="text-sm text-gray-500 truncate">{contact.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {contact.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatDate(contact.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(contact.id, "archived");
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Lưu trữ"
                    >
                      <Archive size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteContact(contact.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Chi tiết liên hệ</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-gray-500">Họ tên</label>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Điện thoại</label>
                  <p className="font-medium">{selectedContact.phone || "—"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Thời gian</label>
                  <p className="font-medium">{formatDate(selectedContact.createdAt)}</p>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="text-sm text-gray-500">Chủ đề</label>
                <p className="font-medium text-lg mb-2">{selectedContact.subject}</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              {/* Reply Section */}
              <div>
                <label className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                  <Reply size={16} /> Phản hồi
                </label>
                {selectedContact.reply ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{selectedContact.reply}</p>
                    {selectedContact.repliedAt && (
                      <p className="text-xs text-green-600 mt-2">
                        Đã trả lời lúc {formatDate(selectedContact.repliedAt)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi..."
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handleReply}
                      disabled={sending || !replyText.trim()}
                      className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Reply size={18} />
                          Gửi phản hồi
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
