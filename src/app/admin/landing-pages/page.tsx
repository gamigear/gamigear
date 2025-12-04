"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  Eye,
  X,
  Copy,
  ExternalLink,
  Layout,
  BarChart3,
} from "lucide-react";
import Card from "@/components/admin/Card";

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  template: string;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATES = [
  { id: "hero-product", name: "Hero + Sản phẩm", description: "Banner lớn với danh sách sản phẩm bên dưới" },
  { id: "countdown-sale", name: "Countdown Sale", description: "Đếm ngược khuyến mãi với sản phẩm nổi bật" },
  { id: "product-showcase", name: "Product Showcase", description: "Trưng bày sản phẩm dạng grid với CTA" },
  { id: "minimal-cta", name: "Minimal CTA", description: "Thiết kế tối giản với nút CTA nổi bật" },
];

export default function LandingPagesPage() {
  const [loading, setLoading] = useState(true);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    template: "hero-product",
  });

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/landing-pages");
      const data = await res.json();
      setLandingPages(data.data || []);
    } catch (error) {
      console.error("Failed to fetch landing pages:", error);
    } finally {
      setLoading(false);
    }
  };


  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const newPage = await res.json();
        fetchLandingPages();
        setShowForm(false);
        setForm({ title: "", slug: "", description: "", template: "hero-product" });
        // Redirect to edit page
        window.location.href = `/admin/landing-pages/${newPage.id}`;
      } else {
        const errorData = await res.json();
        alert("Có lỗi xảy ra: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Create landing page error:", error);
      alert("Có lỗi xảy ra khi tạo landing page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa landing page này?")) return;

    try {
      const res = await fetch(`/api/landing-pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLandingPages(landingPages.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Delete landing page error:", error);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/landing-pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      setLandingPages(landingPages.map((p) => (p.id === id ? { ...p, isActive } : p)));
    } catch (error) {
      console.error("Toggle landing page error:", error);
    }
  };

  const handleDuplicate = async (page: LandingPage) => {
    try {
      const res = await fetch("/api/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${page.title} (Bản sao)`,
          slug: `${page.slug}-copy-${Date.now()}`,
          description: page.description,
          template: page.template,
          isActive: false,
        }),
      });

      if (res.ok) {
        fetchLandingPages();
        alert("Nhân bản thành công!");
      }
    } catch (error) {
      console.error("Duplicate error:", error);
    }
  };

  const getTemplateName = (templateId: string) => {
    return TEMPLATES.find((t) => t.id === templateId)?.name || templateId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Landing Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các trang landing page cho sự kiện, khuyến mãi
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Tạo Landing Page
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Tổng Landing Pages</p>
            <p className="text-2xl font-bold">{landingPages.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {landingPages.filter((p) => p.isActive).length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Tổng lượt xem</p>
            <p className="text-2xl font-bold text-blue-600">
              {landingPages.reduce((sum, p) => sum + p.viewCount, 0).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>


      {/* Landing Pages List */}
      <Card title="Danh sách Landing Pages">
        <div className="p-4">
          {landingPages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Layout size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có landing page nào</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:underline mt-2"
              >
                Tạo landing page đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {landingPages.map((page) => (
                <div
                  key={page.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${
                    page.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Layout size={24} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${!page.isActive && "text-gray-400"}`}>
                      {page.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">/events/{page.slug}</span>
                      <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">
                        {getTemplateName(page.template)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        page.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {page.isActive ? "Hoạt động" : "Tắt"}
                      </span>
                    </div>
                    {page.description && (
                      <p className="text-sm text-gray-500 truncate mt-1">{page.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BarChart3 size={14} />
                    <span>{page.viewCount.toLocaleString()} views</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/events/${page.slug}`}
                      target="_blank"
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Xem trang"
                    >
                      <ExternalLink size={16} className="text-gray-400" />
                    </Link>
                    <Link
                      href={`/admin/landing-pages/${page.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} className="text-gray-400" />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(page)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Nhân bản"
                    >
                      <Copy size={16} className="text-gray-400" />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={page.isActive}
                        onChange={(e) => handleToggle(page.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Tạo Landing Page mới</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Black Friday Sale 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đường dẫn (slug) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500">
                    /events/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="black-friday-2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn về landing page"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Template *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setForm({ ...form, template: template.id })}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        form.template === template.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Tạo & Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
