"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Layers,
} from "lucide-react";
import Card from "@/components/admin/Card";

interface BannerCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  position: number;
  isActive: boolean;
  _count?: {
    banners: number;
  };
}

export default function BannerCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<BannerCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BannerCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/banner-categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };


  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const openForm = (category?: BannerCategory) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setForm({
        name: "",
        slug: "",
        description: "",
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setForm({
      name: "",
      slug: "",
      description: "",
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSaving(true);
    try {
      const url = editingCategory
        ? `/api/banner-categories/${editingCategory.id}`
        : "/api/banner-categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          position: editingCategory?.position ?? categories.length,
          isActive: true,
        }),
      });

      if (res.ok) {
        fetchCategories();
        closeForm();
        alert(editingCategory ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!");
      } else {
        const errorData = await res.json();
        alert("Có lỗi xảy ra: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Save category error:", error);
      alert("Có lỗi xảy ra khi lưu danh mục");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, bannerCount: number) => {
    if (bannerCount > 0) {
      if (!confirm(`Danh mục này có ${bannerCount} banner. Xóa danh mục sẽ bỏ liên kết với các banner đó. Bạn có chắc muốn xóa?`)) {
        return;
      }
    } else {
      if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    }

    try {
      const res = await fetch(`/api/banner-categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Delete category error:", error);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/banner-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      setCategories(categories.map((c) => (c.id === id ? { ...c, isActive } : c)));
    } catch (error) {
      console.error("Toggle category error:", error);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newCategories = [...categories];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];

    const updates = newCategories.map((c, i) => ({ ...c, position: i }));
    setCategories(updates);

    try {
      await Promise.all(
        updates.map((c) =>
          fetch(`/api/banner-categories/${c.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: c.position }),
          })
        )
      );
    } catch (error) {
      console.error("Reorder error:", error);
    }
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
        <div className="flex items-center gap-4">
          <Link
            href="/admin/banners"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Danh mục Banner</h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý các danh mục để phân loại banner
            </p>
          </div>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Thêm danh mục
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Tổng danh mục</p>
            <p className="text-2xl font-bold">{categories.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {categories.filter((c) => c.isActive).length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Tổng banner</p>
            <p className="text-2xl font-bold text-blue-600">
              {categories.reduce((sum, c) => sum + (c._count?.banners || 0), 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Category List */}
      <Card title="Danh sách danh mục">
        <div className="p-4">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Layers size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có danh mục nào</p>
              <button
                onClick={() => openForm()}
                className="text-blue-600 hover:underline mt-2"
              >
                Thêm danh mục đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${
                    category.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${!category.isActive && "text-gray-400"}`}>
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">/{category.slug}</span>
                      <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                        {category._count?.banners || 0} banner
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        category.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {category.isActive ? "Hoạt động" : "Ẩn"}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{category.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30"
                      title="Di chuyển lên"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === categories.length - 1}
                      className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30"
                      title="Di chuyển xuống"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => openForm(category)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} className="text-gray-400" />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={category.isActive}
                        onChange={(e) => handleToggle(category.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      onClick={() => handleDelete(category.id, category._count?.banners || 0)}
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


      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm({
                      ...form,
                      name,
                      slug: editingCategory ? form.slug : generateSlug(name),
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Bàn phím, Chuột, Tai nghe..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="vd: ban-phim, chuot, tai-nghe..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Slug dùng để phân loại banner, không chứa dấu và khoảng trắng
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn về danh mục (tùy chọn)"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeForm}
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
                {editingCategory ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
