"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Globe, GripVertical, Plus, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Card from "@/components/admin/Card";

interface MobileMenuItem {
  id: string;
  name: { ko: string; en: string; vi: string };
  icon: string;
  href: string;
  isActive: boolean;
  position: number;
}

type Lang = "ko" | "en" | "vi";

const availableIcons = [
  "Home", "Search", "Grid3X3", "User", "ShoppingCart", "Heart", "Bell", 
  "Menu", "Settings", "Star", "Tag", "Gift", "Percent", "Package",
  "MapPin", "Phone", "Mail", "MessageCircle", "HelpCircle", "Info"
];

export default function MobileMenuPage() {
  const [items, setItems] = useState<MobileMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>("ko");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/mobile-menu");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/mobile-menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        alert("Đã lưu thành công!");
      } else {
        alert("Lỗi khi lưu!");
      }
    } catch (error) {
      alert("Lỗi: " + (error instanceof Error ? error.message : "Unknown"));
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (id: string, field: keyof MobileMenuItem, value: unknown) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateItemName = (id: string, lang: Lang, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, name: { ...item.name, [lang]: value } } : item
    ));
  };

  const addItem = () => {
    const newItem: MobileMenuItem = {
      id: `item-${Date.now()}`,
      name: { ko: "새 메뉴", en: "New Menu", vi: "Menu mới" },
      icon: "Star",
      href: "/",
      isActive: true,
      position: items.length,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 3) {
      alert("Cần ít nhất 3 menu items!");
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => item.position = i);
    setItems(newItems);
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[iconName];
    return Icon ? <Icon size={20} /> : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  const langs: { code: Lang; name: string }[] = [
    { code: "ko", name: "한국어" },
    { code: "en", name: "English" },
    { code: "vi", name: "Tiếng Việt" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Mobile Bottom</h1>
        <div className="flex gap-2">
          <button
            onClick={addItem}
            disabled={items.length >= 5}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <Plus size={18} />
            Thêm menu
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="flex gap-2 border-b">
        {langs.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setActiveLang(lang.code)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 -mb-px ${
              activeLang === lang.code
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Globe size={16} />
            {lang.name}
          </button>
        ))}
      </div>

      {/* Preview */}
      <Card title="Xem trước">
        <div className="p-4">
          <div className="max-w-sm mx-auto bg-gray-100 rounded-lg overflow-hidden">
            <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400">
              Nội dung trang
            </div>
            <div className="bg-white border-t grid" style={{ gridTemplateColumns: `repeat(${items.filter(i => i.isActive).length}, 1fr)` }}>
              {items.filter(i => i.isActive).sort((a, b) => a.position - b.position).map((item) => (
                <div key={item.id} className="flex flex-col items-center justify-center py-2 gap-0.5">
                  {getIcon(item.icon)}
                  <span className="text-[10px]">{item.name[activeLang]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Menu Items */}
      <Card title="Danh sách menu">
        <div className="divide-y">
          {items.sort((a, b) => a.position - b.position).map((item, index) => (
            <div key={item.id} className="p-4 flex items-start gap-4">
              {/* Drag Handle & Position */}
              <div className="flex flex-col items-center gap-1 pt-2">
                <button
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <LucideIcons.ChevronUp size={16} />
                </button>
                <GripVertical size={16} className="text-gray-400" />
                <button
                  onClick={() => moveItem(index, "down")}
                  disabled={index === items.length - 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <LucideIcons.ChevronDown size={16} />
                </button>
              </div>

              {/* Icon Preview */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {getIcon(item.icon)}
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tên ({activeLang})</label>
                  <input
                    type="text"
                    value={item.name[activeLang]}
                    onChange={(e) => updateItemName(item.id, activeLang, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Icon</label>
                  <select
                    value={item.icon}
                    onChange={(e) => updateItem(item.id, "icon", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {availableIcons.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Link</label>
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => updateItem(item.id, "href", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => updateItem(item.id, "isActive", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Hiển thị</span>
                  </label>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-auto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-sm text-gray-500">
        * Tối đa 5 menu items. Các menu bị ẩn sẽ không hiển thị trên mobile.
      </p>
    </div>
  );
}
