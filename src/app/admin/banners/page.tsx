"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  Image as ImageIcon,
  Eye,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  FolderOpen,
  Copy,
} from "lucide-react";
import Card from "@/components/admin/Card";
import MediaPicker from "@/components/admin/MediaPicker";

interface BannerCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  image: string;
  tabletImage?: string;
  mobileImage?: string;
  link: string;
  gradientFrom?: string;
  gradientTo?: string;
  categoryId?: string | null;
  category?: BannerCategory | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BannersPage() {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<BannerCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    image: "",
    tabletImage: "",
    mobileImage: "",
    link: "",
    gradientFrom: "#052566",
    gradientTo: "#3764be",
    categoryId: "",
  });
  
  // Media picker states
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"image" | "tabletImage" | "mobileImage">("image");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannersRes, categoriesRes] = await Promise.all([
        fetch("/api/banners"),
        fetch("/api/banner-categories?active=true"),
      ]);
      const bannersData = await bannersRes.json();
      const categoriesData = await categoriesRes.json();
      setBanners(bannersData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      setBanners(data.data || []);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  const openForm = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setForm({
        title: banner.title,
        subtitle: banner.subtitle || "",
        description: banner.description || "",
        buttonText: banner.buttonText || "",
        image: banner.image,
        tabletImage: banner.tabletImage || "",
        mobileImage: banner.mobileImage || "",
        link: banner.link,
        gradientFrom: banner.gradientFrom || "#052566",
        gradientTo: banner.gradientTo || "#3764be",
        categoryId: banner.categoryId || "",
      });
    } else {
      setEditingBanner(null);
      setForm({
        title: "",
        subtitle: "",
        description: "",
        buttonText: "",
        image: "",
        tabletImage: "",
        mobileImage: "",
        link: "",
        gradientFrom: "#052566",
        gradientTo: "#3764be",
        categoryId: "",
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBanner(null);
    setForm({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      image: "",
      tabletImage: "",
      mobileImage: "",
      link: "",
      gradientFrom: "#052566",
      gradientTo: "#3764be",
      categoryId: "",
    });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.image || !form.link) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSaving(true);
    try {
      const url = editingBanner ? `/api/banners/${editingBanner.id}` : "/api/banners";
      const method = editingBanner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          position: editingBanner?.position ?? banners.length,
          isActive: true,
        }),
      });

      if (res.ok) {
        fetchBanners();
        closeForm();
        alert(editingBanner ? "Cập nhật banner thành công!" : "Thêm banner thành công!");
      } else {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        alert("Có lỗi xảy ra: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Save banner error:", error);
      alert("Có lỗi xảy ra khi lưu banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa banner này?")) return;
    
    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners(banners.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Delete banner error:", error);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      setBanners(banners.map((b) => (b.id === id ? { ...b, isActive } : b)));
    } catch (error) {
      console.error("Toggle banner error:", error);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newBanners = [...banners];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;
    
    [newBanners[index], newBanners[newIndex]] = [newBanners[newIndex], newBanners[index]];
    
    // Update positions
    const updates = newBanners.map((b, i) => ({ ...b, position: i }));
    setBanners(updates);
    
    // Save to server
    try {
      await Promise.all(
        updates.map((b) =>
          fetch(`/api/banners/${b.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: b.position }),
          })
        )
      );
    } catch (error) {
      console.error("Reorder error:", error);
    }
  };

  const handleDuplicate = async (banner: Banner) => {
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${banner.title} (Bản sao)`,
          subtitle: banner.subtitle,
          description: banner.description,
          buttonText: banner.buttonText,
          image: banner.image,
          tabletImage: banner.tabletImage,
          mobileImage: banner.mobileImage,
          link: banner.link,
          gradientFrom: banner.gradientFrom,
          gradientTo: banner.gradientTo,
          categoryId: banner.categoryId || null,
          position: banners.length,
          isActive: false, // Mặc định ẩn bản sao
        }),
      });

      if (res.ok) {
        fetchBanners();
        alert("Nhân bản banner thành công!");
      } else {
        alert("Có lỗi xảy ra khi nhân bản banner");
      }
    } catch (error) {
      console.error("Duplicate banner error:", error);
      alert("Có lỗi xảy ra khi nhân bản banner");
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
        <div>
          <h1 className="text-2xl font-bold">Quản lý Banner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý banner hiển thị trên trang chủ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/banners/categories"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Danh mục
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Eye size={16} />
            Xem trang chủ
          </Link>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Thêm banner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Tổng banner</p>
            <p className="text-2xl font-bold">{banners.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Đang hiển thị</p>
            <p className="text-2xl font-bold text-green-600">
              {banners.filter((b) => b.isActive).length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Đã ẩn</p>
            <p className="text-2xl font-bold text-gray-400">
              {banners.filter((b) => !b.isActive).length}
            </p>
          </div>
        </Card>
      </div>

      {/* Banner List */}
      <Card
        title="Danh sách Banner"
        headerAction={
          <Link
            href="/admin/pages/homepage"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            Chỉnh sửa trang chủ
            <ExternalLink size={14} />
          </Link>
        }
      >
        <div className="p-4">
          {banners.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có banner nào</p>
              <button
                onClick={() => openForm()}
                className="text-blue-600 hover:underline mt-2"
              >
                Thêm banner đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${
                    banner.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <GripVertical size={20} className="text-gray-400 cursor-move flex-shrink-0" />
                  
                  <div className="w-40 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${!banner.isActive && "text-gray-400"}`}>
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">{banner.link}</span>
                      <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                        {banner.category?.name || "Không có danh mục"}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        banner.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {banner.isActive ? "Hiển thị" : "Ẩn"}
                      </span>
                    </div>
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
                      disabled={index === banners.length - 1}
                      className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30"
                      title="Di chuyển xuống"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => openForm(banner)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(banner)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Nhân bản"
                    >
                      <Copy size={16} className="text-gray-400" />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={banner.isActive}
                        onChange={(e) => handleToggle(banner.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      onClick={() => handleDelete(banner.id)}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editingBanner ? "Chỉnh sửa banner" : "Thêm banner mới"}
              </h2>
              <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề banner"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phụ đề
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập phụ đề (tùy chọn)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mô tả (tùy chọn)"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text nút bấm
                </label>
                <input
                  type="text"
                  value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Xem chi tiết, Mua ngay, Khám phá..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh Desktop *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => { setMediaPickerTarget("image"); setShowMediaPicker(true); }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                    title="Chọn từ Media"
                  >
                    <FolderOpen size={16} />
                  </button>
                </div>
                {form.image && (
                  <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 h-32">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh Tablet (768px - 1024px)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.tabletImage}
                    onChange={(e) => setForm({ ...form, tabletImage: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tùy chọn - dùng ảnh desktop nếu để trống"
                  />
                  <button
                    type="button"
                    onClick={() => { setMediaPickerTarget("tabletImage"); setShowMediaPicker(true); }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                    title="Chọn từ Media"
                  >
                    <FolderOpen size={16} />
                  </button>
                </div>
                {form.tabletImage && (
                  <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 h-24">
                    <img src={form.tabletImage} alt="Tablet Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh Mobile (&lt; 768px)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.mobileImage}
                    onChange={(e) => setForm({ ...form, mobileImage: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tùy chọn - dùng ảnh desktop nếu để trống"
                  />
                  <button
                    type="button"
                    onClick={() => { setMediaPickerTarget("mobileImage"); setShowMediaPicker(true); }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                    title="Chọn từ Media"
                  >
                    <FolderOpen size={16} />
                  </button>
                </div>
                {form.mobileImage && (
                  <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 h-24">
                    <img src={form.mobileImage} alt="Mobile Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liên kết *
                </label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/category/sale hoặc https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục hiển thị
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Không có danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Banner sẽ hiển thị khi người dùng chọn tab tương ứng trên trang chủ.{" "}
                  <Link href="/admin/banners/categories" className="text-blue-600 hover:underline">
                    Quản lý danh mục
                  </Link>
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Màu gradient từ
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.gradientFrom}
                      onChange={(e) => setForm({ ...form, gradientFrom: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.gradientFrom}
                      onChange={(e) => setForm({ ...form, gradientFrom: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Màu gradient đến
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.gradientTo}
                      onChange={(e) => setForm({ ...form, gradientTo: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.gradientTo}
                      onChange={(e) => setForm({ ...form, gradientTo: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview gradient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xem trước gradient
                </label>
                <div 
                  className="h-16 rounded-lg"
                  style={{
                    background: `linear-gradient(to right, ${form.gradientFrom}, ${form.gradientTo})`
                  }}
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
                {editingBanner ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        currentImage={form[mediaPickerTarget]}
        onSelect={(url) => {
          setForm({ ...form, [mediaPickerTarget]: url });
          setShowMediaPicker(false);
        }}
      />
    </div>
  );
}
