"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  X,
  Edit,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/admin/Card";
import { useI18n } from "@/lib/i18n/context";

interface MenuItem {
  id: string;
  name: string;
  href: string;
  isExternal: boolean;
  isActive: boolean;
  highlight?: boolean;
}

interface MenuData {
  topbar: MenuItem[];
  main: MenuItem[];
}

const defaultMenus: MenuData = {
  topbar: [
    { id: "1", name: "Gamigear", href: "/", isExternal: false, isActive: true },
    { id: "2", name: "Blog", href: "/blog", isExternal: false, isActive: true },
    { id: "3", name: "Liên hệ", href: "/contact", isExternal: false, isActive: true },
  ],
  main: [
    { id: "1", name: "Bán chạy", href: "/category/best", isExternal: false, isActive: true, highlight: false },
    { id: "2", name: "Sản phẩm mới", href: "/category/new", isExternal: false, isActive: true, highlight: false },
    { id: "3", name: "Khuyến mãi", href: "/category/sale", isExternal: false, isActive: true, highlight: true },
    { id: "4", name: "Blog", href: "/blog", isExternal: false, isActive: true, highlight: false },
  ],
};

export default function MenusEditorPage() {
  const { t, setLocale, locale } = useI18n();
  
  useEffect(() => {
    if (locale !== 'vi') {
      setLocale('vi');
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menus, setMenus] = useState<MenuData>(defaultMenus);
  const [activeTab, setActiveTab] = useState<"topbar" | "main">("main");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    href: "",
    isExternal: false,
    highlight: false,
  });


  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/menus");
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setMenus(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch menus:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/menus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menus),
      });
      alert("Đã lưu thành công!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const openAddForm = () => {
    setEditingItem(null);
    setFormData({ name: "", href: "", isExternal: false, highlight: false });
    setShowForm(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      href: item.href,
      isExternal: item.isExternal,
      highlight: item.highlight || false,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ name: "", href: "", isExternal: false, highlight: false });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.href) {
      alert("Vui lòng nhập tên và đường dẫn!");
      return;
    }

    const currentMenu = menus[activeTab];
    
    if (editingItem) {
      // Update existing
      const updated = currentMenu.map((item) =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      );
      setMenus({ ...menus, [activeTab]: updated });
    } else {
      // Add new
      const newItem: MenuItem = {
        id: `${Date.now()}`,
        name: formData.name,
        href: formData.href,
        isExternal: formData.isExternal,
        isActive: true,
        highlight: formData.highlight,
      };
      setMenus({ ...menus, [activeTab]: [...currentMenu, newItem] });
    }
    
    closeForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xóa mục menu này?")) return;
    const updated = menus[activeTab].filter((item) => item.id !== id);
    setMenus({ ...menus, [activeTab]: updated });
  };

  const handleToggle = (id: string) => {
    const updated = menus[activeTab].map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setMenus({ ...menus, [activeTab]: updated });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const items = [...menus[activeTab]];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setMenus({ ...menus, [activeTab]: items });
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
          <h1 className="text-2xl font-bold">Quản lý Menu</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý menu chính và topbar của website</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Eye size={16} />
            Xem trước
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Lưu
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: "main", label: "Menu chính" },
            { id: "topbar", label: "Topbar Menu" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Menu Items */}
      <Card
        title={activeTab === "main" ? "Menu chính" : "Topbar Menu"}
        headerAction={
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Thêm mục
          </button>
        }
      >
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">
            {activeTab === "main" 
              ? "Menu hiển thị ở thanh điều hướng chính của website"
              : "Menu hiển thị ở thanh trên cùng (topbar) của website"
            }
          </p>
          
          {menus[activeTab].length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <LinkIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có mục menu nào</p>
              <button
                onClick={openAddForm}
                className="text-blue-600 hover:underline mt-2"
              >
                Thêm mục menu đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {menus[activeTab].map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${
                    item.isActive ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <GripVertical size={20} className="text-gray-400 cursor-move" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${!item.isActive && "text-gray-400"}`}>
                        {item.name}
                      </h3>
                      {item.highlight && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                          Nổi bật
                        </span>
                      )}
                      {item.isExternal && (
                        <ExternalLink size={14} className="text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.href}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditForm(item)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Sửa"
                    >
                      <Edit size={16} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 text-sm"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === menus[activeTab].length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 text-sm"
                    >
                      ↓
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={() => handleToggle(item.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      onClick={() => handleDelete(item.id)}
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
                {editingItem ? "Sửa mục menu" : "Thêm mục menu"}
              </h2>
              <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hiển thị *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Sản phẩm mới"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đường dẫn (URL) *
                </label>
                <input
                  type="text"
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: /category/new hoặc https://..."
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isExternal}
                    onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Mở tab mới</span>
                </label>
                {activeTab === "main" && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.highlight}
                      onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Nổi bật (màu sắc)</span>
                  </label>
                )}
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
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                {editingItem ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
