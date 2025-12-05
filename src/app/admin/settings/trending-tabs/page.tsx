"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical, Eye, EyeOff,
  Smartphone, Monitor, Search, X, ChevronDown, ChevronUp
} from "lucide-react";
import Image from "next/image";

interface TrendingTab {
  id: string;
  label: string;
  emoji: string;
  enabled: boolean;
  hideOnMobile?: boolean;
  selectionMode: "auto" | "manual";
  autoFilter?: "featured" | "newest" | "on_sale" | "popular" | "category";
  categorySlug?: string;
  productIds?: string[];
  limit?: number;
}

interface TrendingTabsConfig {
  title: string;
  subtitle: string;
  showEmoji: boolean;
  defaultLimit: number;
  tabs: TrendingTab[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { src: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const autoFilterOptions = [
  { value: "featured", label: "Sản phẩm nổi bật (Featured)" },
  { value: "newest", label: "Mới nhất" },
  { value: "on_sale", label: "Đang giảm giá" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "category", label: "Theo danh mục" },
];

const emojiOptions = ["🥇", "🔥", "✨", "💰", "⭐", "💎", "🎁", "🏆", "❤️", "👍", "🛒", "📦"];

export default function TrendingTabsSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const [config, setConfig] = useState<TrendingTabsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedTab, setExpandedTab] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    fetchConfig();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/settings/trending-tabs");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        if (data.tabs?.length > 0) {
          setExpandedTab(data.tabs[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?per_page=100");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?per_page=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&per_page=20`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data || []);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings/trending-tabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert("Đã lưu cấu hình thành công!");
      } else {
        alert("Lỗi khi lưu cấu hình");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  const addTab = () => {
    if (!config) return;
    const newTab: TrendingTab = {
      id: `tab_${Date.now()}`,
      label: "Tab mới",
      emoji: "⭐",
      enabled: true,
      selectionMode: "auto",
      autoFilter: "featured",
      limit: 16,
    };
    setConfig({ ...config, tabs: [...config.tabs, newTab] });
    setExpandedTab(newTab.id);
  };

  const removeTab = (tabId: string) => {
    if (!config) return;
    if (config.tabs.length <= 1) {
      alert("Phải có ít nhất 1 tab");
      return;
    }
    setConfig({ ...config, tabs: config.tabs.filter((t) => t.id !== tabId) });
  };

  const updateTab = (tabId: string, updates: Partial<TrendingTab>) => {
    if (!config) return;
    setConfig({
      ...config,
      tabs: config.tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
    });
  };

  const moveTab = (index: number, direction: "up" | "down") => {
    if (!config) return;
    const newTabs = [...config.tabs];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newTabs.length) return;
    [newTabs[index], newTabs[newIndex]] = [newTabs[newIndex], newTabs[index]];
    setConfig({ ...config, tabs: newTabs });
  };

  const addProductToTab = (tabId: string, product: Product) => {
    if (!config) return;
    const tab = config.tabs.find((t) => t.id === tabId);
    if (!tab) return;
    const currentIds = tab.productIds || [];
    if (currentIds.includes(product.id)) return;
    updateTab(tabId, { productIds: [...currentIds, product.id] });
  };

  const removeProductFromTab = (tabId: string, productId: string) => {
    if (!config) return;
    const tab = config.tabs.find((t) => t.id === tabId);
    if (!tab) return;
    updateTab(tabId, { productIds: (tab.productIds || []).filter((id) => id !== productId) });
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) return null;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Cài đặt Trending Tabs</h1>
              <p className="text-sm text-gray-500">Quản lý section &quot;Xem giỏ hàng người khác&quot;</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Cài đặt chung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phụ đề</label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số sản phẩm mặc định</label>
              <input
                type="number"
                value={config.defaultLimit}
                onChange={(e) => setConfig({ ...config, defaultLimit: parseInt(e.target.value) || 16 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                min={4}
                max={50}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showEmoji"
                checked={config.showEmoji}
                onChange={(e) => setConfig({ ...config, showEmoji: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="showEmoji" className="text-sm">Hiển thị emoji trên tab</label>
            </div>
          </div>
        </div>

        {/* Tabs Management */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quản lý Tabs</h2>
            <button
              onClick={addTab}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              <Plus size={16} />
              Thêm tab
            </button>
          </div>

          <div className="space-y-3">
            {config.tabs.map((tab, index) => (
              <div key={tab.id} className="border rounded-lg overflow-hidden">
                {/* Tab Header */}
                <div
                  className={`flex items-center gap-3 p-4 cursor-pointer ${
                    expandedTab === tab.id ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setExpandedTab(expandedTab === tab.id ? null : tab.id)}
                >
                  <GripVertical size={18} className="text-gray-400" />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xl">{tab.emoji}</span>
                    <span className="font-medium">{tab.label}</span>
                    {!tab.enabled && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">Ẩn</span>
                    )}
                    {tab.hideOnMobile && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded flex items-center gap-1">
                        <Smartphone size={12} /> Ẩn mobile
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                      {tab.selectionMode === "auto" ? "Tự động" : "Thủ công"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveTab(index, "up"); }}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveTab(index, "down"); }}
                      disabled={index === config.tabs.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
                      className="p-1 hover:bg-red-100 text-red-500 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>


                {/* Tab Content */}
                {expandedTab === tab.id && (
                  <div className="p-4 border-t bg-white space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tên tab</label>
                        <input
                          type="text"
                          value={tab.label}
                          onChange={(e) => updateTab(tab.id, { label: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Emoji</label>
                        <div className="flex gap-2 flex-wrap">
                          {emojiOptions.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => updateTab(tab.id, { emoji })}
                              className={`w-10 h-10 text-xl rounded-lg border ${
                                tab.emoji === emoji ? "border-primary bg-primary/10" : "hover:bg-gray-100"
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Số sản phẩm</label>
                        <input
                          type="number"
                          value={tab.limit || config.defaultLimit}
                          onChange={(e) => updateTab(tab.id, { limit: parseInt(e.target.value) || 16 })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          min={4}
                          max={50}
                        />
                      </div>
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tab.enabled}
                          onChange={(e) => updateTab(tab.id, { enabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Eye size={16} />
                        <span className="text-sm">Hiển thị tab</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tab.hideOnMobile}
                          onChange={(e) => updateTab(tab.id, { hideOnMobile: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Smartphone size={16} />
                        <span className="text-sm">Ẩn trên mobile</span>
                      </label>
                    </div>

                    {/* Selection Mode */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Chế độ chọn sản phẩm</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`mode_${tab.id}`}
                            checked={tab.selectionMode === "auto"}
                            onChange={() => updateTab(tab.id, { selectionMode: "auto" })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Tự động</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`mode_${tab.id}`}
                            checked={tab.selectionMode === "manual"}
                            onChange={() => updateTab(tab.id, { selectionMode: "manual" })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Chọn thủ công</span>
                        </label>
                      </div>
                    </div>

                    {/* Auto Mode Settings */}
                    {tab.selectionMode === "auto" && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Bộ lọc tự động</label>
                          <select
                            value={tab.autoFilter || "featured"}
                            onChange={(e) => updateTab(tab.id, { autoFilter: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            {autoFilterOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        {tab.autoFilter === "category" && (
                          <div>
                            <label className="block text-sm font-medium mb-1">Chọn danh mục</label>
                            <select
                              value={tab.categorySlug || ""}
                              onChange={(e) => updateTab(tab.id, { categorySlug: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                              <option value="">-- Chọn danh mục --</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}


                    {/* Manual Mode Settings */}
                    {tab.selectionMode === "manual" && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                        {/* Search Products */}
                        <div>
                          <label className="block text-sm font-medium mb-1">Tìm sản phẩm</label>
                          <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              placeholder="Nhập tên sản phẩm..."
                              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                          {/* Search Results */}
                          {productSearch && (
                            <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto bg-white">
                              {searching ? (
                                <div className="p-4 text-center text-gray-500">Đang tìm...</div>
                              ) : searchResults.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm</div>
                              ) : (
                                searchResults.map((product) => (
                                  <div
                                    key={product.id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => {
                                      addProductToTab(tab.id, product);
                                      setProductSearch("");
                                      setSearchResults([]);
                                    }}
                                  >
                                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                      {product.images?.[0]?.src && (
                                        <Image
                                          src={product.images[0].src}
                                          alt={product.name}
                                          width={40}
                                          height={40}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{product.name}</p>
                                      <p className="text-xs text-gray-500">{product.price?.toLocaleString()}đ</p>
                                    </div>
                                    <Plus size={16} className="text-primary" />
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* Selected Products */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Sản phẩm đã chọn ({tab.productIds?.length || 0})
                          </label>
                          {(!tab.productIds || tab.productIds.length === 0) ? (
                            <p className="text-sm text-gray-500 italic">Chưa chọn sản phẩm nào</p>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {tab.productIds.map((productId) => {
                                const product = getProductById(productId);
                                if (!product) return null;
                                return (
                                  <div key={productId} className="relative group bg-white border rounded-lg p-2">
                                    <button
                                      onClick={() => removeProductFromTab(tab.id, productId)}
                                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X size={14} />
                                    </button>
                                    <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
                                      {product.images?.[0]?.src && (
                                        <Image
                                          src={product.images[0].src}
                                          alt={product.name}
                                          width={100}
                                          height={100}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Xem trước</h2>
          <div className="border rounded-lg p-4">
            <h3 className="text-xl font-bold mb-1">{config.title} 👀</h3>
            <p className="text-gray-500 text-sm mb-4">{config.subtitle}</p>
            <div className="flex gap-2 flex-wrap">
              {config.tabs.filter((t) => t.enabled).map((tab) => (
                <button
                  key={tab.id}
                  className="px-4 py-2 rounded-full border text-sm font-medium bg-white text-gray-600 border-gray-200"
                >
                  {tab.label}
                  {config.showEmoji && <span className="ml-1">{tab.emoji}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
