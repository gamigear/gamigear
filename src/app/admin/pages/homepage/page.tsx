"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  Loader2,
  Image as ImageIcon,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  ChevronUp,
  ChevronDown,
  X,
  Edit,
  Settings,
  FolderOpen,
} from "lucide-react";
import Card from "@/components/admin/Card";
import MediaPicker from "@/components/admin/MediaPicker";
import { useI18n } from "@/lib/i18n/context";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  tabletImage?: string;
  mobileImage?: string;
  link: string;
  position: number;
  isActive: boolean;
}

interface HomepageSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  settings: Record<string, any>;
}

interface Promotion {
  id: string;
  title: string;
  description?: string;
  image: string;
  link: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  image?: string;
}

interface BlogPost {
  id: string;
  title: string;
  featuredImage?: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}


export default function HomepageEditorPage() {
  const { t, setLocale, locale } = useI18n();
  const hp = t.homepageEditor;
  
  // Force Vietnamese on first load
  useEffect(() => {
    if (locale !== 'vi') {
      setLocale('vi');
    }
  }, []);
  
  const defaultSections: HomepageSection[] = [
    { id: "hero", type: "hero", title: hp.sections.types.hero, enabled: true, settings: {} },
    { id: "quick-menu", type: "quick-menu", title: hp.sections.types.quickMenu, enabled: true, settings: {} },
    { id: "best-products", type: "products", title: hp.sections.types.bestProducts, enabled: true, settings: { limit: 12, featured: true } },
    { id: "trending", type: "trending", title: hp.sections.types.trending || "Xem giỏ hàng của người khác", enabled: true, settings: { limit: 16 } },
    { id: "new-products", type: "products", title: hp.sections.types.newProducts, enabled: true, settings: { limit: 8, tag: "new" } },
    { id: "promotions", type: "promotions", title: hp.sections.types.promotions, enabled: true, settings: {} },
    { id: "reviews", type: "reviews", title: hp.sections.types.reviews, enabled: true, settings: { limit: 6 } },
    { id: "books", type: "products", title: hp.sections.types.books, enabled: true, settings: { limit: 8, category: "books" } },
    { id: "tickets", type: "products", title: hp.sections.types.tickets, enabled: true, settings: { limit: 8, category: "tickets" } },
    { id: "coupon-banner", type: "coupon-banner", title: hp.sections.types.couponBanner, enabled: true, settings: {} },
    { id: "blog", type: "blog", title: "Blog & Tin tức", enabled: true, settings: { limit: 8, source: "latest" } },
  ];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>(defaultSections);
  const [activeTab, setActiveTab] = useState<"sections" | "banners" | "promotions" | "settings">("sections");
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogSearchResults, setBlogSearchResults] = useState<BlogPost[]>([]);
  
  const [settings, setSettings] = useState({
    heroTitle: "Thiết bị gaming cho nhà vô địch",
    heroSubtitle: "Khám phá sản phẩm gaming chất lượng cao tại Gamigear",
    couponBannerTitle: "Giảm 50.000đ cho đơn đầu tiên",
    couponBannerSubtitle: "Ưu đãi thành viên mới",
    couponBannerButtonText: "Nhận mã",
    couponBannerLink: "/coupons",
    couponBannerEnabled: true,
  });

  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    tabletImage: "",
    mobileImage: "",
    link: "",
  });
  const [showBannerForm, setShowBannerForm] = useState(false);
  
  // Media picker states
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"image" | "tabletImage" | "mobileImage">("image");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannersRes, promotionsRes, homepageRes, categoriesRes, productsRes, blogPostsRes, blogCategoriesRes] = await Promise.all([
        fetch("/api/banners"),
        fetch("/api/promotions"),
        fetch("/api/homepage"),
        fetch("/api/categories"),
        fetch("/api/products?per_page=100"),
        fetch("/api/posts?per_page=100&status=publish"),
        fetch("/api/post-categories"),
      ]);

      const [bannersData, promotionsData, homepageData, categoriesData, productsData, blogPostsData, blogCategoriesData] = await Promise.all([
        bannersRes.json(),
        promotionsRes.json(),
        homepageRes.json(),
        categoriesRes.json(),
        productsRes.json(),
        blogPostsRes.json(),
        blogCategoriesRes.json(),
      ]);

      setBanners(bannersData.data || []);
      setPromotions(promotionsData.data || []);
      setCategories(categoriesData.data || []);
      setProducts((productsData.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0]?.src || "",
      })));
      setBlogPosts((blogPostsData.data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        featuredImage: p.featuredImage || "",
      })));
      setBlogCategories(blogCategoriesData.data || []);
      
      if (homepageData.settings?.sections) {
        setSections(homepageData.settings.sections);
      }
      if (homepageData.settings) {
        setSettings((prev) => ({ ...prev, ...homepageData.settings }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = (query: string) => {
    setProductSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    setSearchResults(results);
  };

  const searchBlogPosts = (query: string) => {
    setBlogSearch(query);
    if (query.length < 2) {
      setBlogSearchResults([]);
      return;
    }
    const results = blogPosts.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    setBlogSearchResults(results);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { settings: { ...settings, sections } };
      console.log("Saving homepage settings:", Object.keys(payload.settings));
      
      const response = await fetch("/api/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify(payload),
      });
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        alert(hp.saveFailed + ": Invalid response from server");
        return;
      }
      
      if (!response.ok) {
        console.error("API Error:", response.status, data);
        alert(hp.saveFailed + (data.error ? `: ${data.error}` : ` (Status: ${response.status})`));
        return;
      }
      
      console.log("Save successful:", data);
      alert(hp.saved);
    } catch (error) {
      console.error("Save error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert(hp.saveFailed + `: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBanner = async () => {
    if (!bannerForm.title || !bannerForm.image || !bannerForm.link) {
      alert(hp.banners.titleRequired);
      return;
    }

    try {
      const url = editingBanner ? `/api/banners/${editingBanner.id}` : "/api/banners";
      const method = editingBanner ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bannerForm,
          position: editingBanner?.position ?? banners.length,
          isActive: true,
        }),
      });

      if (response.ok) {
        fetchData();
        closeBannerForm();
        alert(editingBanner ? "Cập nhật banner thành công!" : "Thêm banner thành công!");
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        alert("Có lỗi xảy ra: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Banner error:", error);
      alert("Có lỗi xảy ra khi lưu banner");
    }
  };

  const openEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      tabletImage: banner.tabletImage || "",
      mobileImage: banner.mobileImage || "",
      link: banner.link,
    });
    setShowBannerForm(true);
  };

  const closeBannerForm = () => {
    setShowBannerForm(false);
    setEditingBanner(null);
    setBannerForm({ title: "", subtitle: "", image: "", tabletImage: "", mobileImage: "", link: "" });
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm(hp.banners.deleteBanner)) return;
    try {
      await fetch(`/api/banners/${id}`, { method: "DELETE" });
      setBanners(banners.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Delete banner error:", error);
    }
  };

  const handleToggleBanner = async (id: string, isActive: boolean) => {
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

  const handleToggleSection = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSections(newSections);
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
          <h1 className="text-2xl font-bold">{hp.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{hp.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Eye size={16} />
            {hp.preview}
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {hp.save}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: "sections", label: hp.tabs.sections },
            { id: "banners", label: hp.tabs.banners },
            { id: "promotions", label: hp.tabs.promotions },
            { id: "settings", label: hp.tabs.settings },
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

      {/* Sections Tab */}
      {activeTab === "sections" && (
        <Card 
          title={hp.sections.title}
          headerAction={
            <button
              onClick={() => {
                const newSection: HomepageSection = {
                  id: `custom-${Date.now()}`,
                  type: "products",
                  title: hp.sections.newProductSection,
                  enabled: true,
                  settings: { limit: 8 },
                };
                setSections([...sections, newSection]);
                setEditingSection(newSection);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              {hp.sections.addSection}
            </button>
          }
        >
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">{hp.sections.dragToReorder}</p>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${
                    section.enabled ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <GripVertical size={20} className="text-gray-400 cursor-move" />
                  <div className="flex-1">
                    <h3 className={`font-medium ${!section.enabled && "text-gray-400"}`}>
                      {section.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{section.type}</span>
                      {section.type === "products" && section.settings.category && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {categories.find(c => c.slug === section.settings.category)?.name || section.settings.category}
                        </span>
                      )}
                      {section.settings.featured && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">{hp.sections.types.featured}</span>
                      )}
                      {section.settings.onSale && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">{hp.sections.types.onSale}</span>
                      )}
                      {section.settings.limit && (
                        <span className="text-xs text-gray-400">{section.settings.limit} {hp.sections.types.products}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(section.type === "products" || section.type === "reviews" || section.type === "trending" || section.type === "blog") && (
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title={hp.sections.sectionSettings}
                      >
                        <Settings size={16} className="text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={() => handleMoveSection(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveSection(index, "down")}
                      disabled={index === sections.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => handleToggleSection(section.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    {section.id.startsWith("custom-") && (
                      <button
                        onClick={() => {
                          if (confirm(hp.sections.deleteSection)) {
                            setSections(sections.filter((s) => s.id !== section.id));
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title={t.common.delete}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}


      {/* Banners Tab */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          <Card
            title={hp.banners.title}
            headerAction={
              <button
                onClick={() => setShowBannerForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                {hp.banners.addBanner}
              </button>
            }
          >
            <div className="p-4">
              {banners.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>{hp.banners.noBanners}</p>
                  <button
                    onClick={() => setShowBannerForm(true)}
                    className="text-blue-600 hover:underline mt-2"
                  >
                    {hp.banners.addFirstBanner}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {banners.map((banner) => (
                    <div
                      key={banner.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg ${
                        banner.isActive ? "border-gray-200" : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{banner.title}</h3>
                        {banner.subtitle && (
                          <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{banner.link}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditBanner(banner)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title={t.common.edit}
                        >
                          <Edit size={16} className="text-gray-400" />
                        </button>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={banner.isActive}
                            onChange={(e) => handleToggleBanner(banner.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
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
        </div>
      )}

      {/* Promotions Tab */}
      {activeTab === "promotions" && (
        <Card title={hp.promotions.title}>
          <div className="p-4">
            {promotions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
                <p>{hp.promotions.noPromotions}</p>
                <p className="text-sm mt-2">{hp.promotions.managedViaApi}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {promotions.map((promo) => (
                  <div key={promo.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={promo.image}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">{promo.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{promo.link}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${
                        promo.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {promo.isActive ? hp.promotions.active : hp.promotions.inactive}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}


      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title={hp.settings.heroSection}>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.settings.heroTitle}</label>
                <input
                  type="text"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.settings.heroSubtitle}</label>
                <input
                  type="text"
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          <Card title={hp.settings.couponBanner}>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="couponEnabled"
                  checked={settings.couponBannerEnabled}
                  onChange={(e) => setSettings({ ...settings, couponBannerEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="couponEnabled" className="text-sm font-medium">{hp.settings.couponEnabled}</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.settings.couponTitle}</label>
                <input
                  type="text"
                  value={settings.couponBannerTitle}
                  onChange={(e) => setSettings({ ...settings, couponBannerTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.settings.couponSubtitle}</label>
                <input
                  type="text"
                  value={settings.couponBannerSubtitle}
                  onChange={(e) => setSettings({ ...settings, couponBannerSubtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.settings.couponButtonText}</label>
                <input
                  type="text"
                  value={settings.couponBannerButtonText}
                  onChange={(e) => setSettings({ ...settings, couponBannerButtonText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.settings.couponLink}</label>
                <input
                  type="text"
                  value={settings.couponBannerLink}
                  onChange={(e) => setSettings({ ...settings, couponBannerLink: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>
        </div>
      )}


      {/* Banner Form Modal */}
      {showBannerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingBanner ? hp.banners.editBanner : hp.banners.addBanner}</h2>
              <button onClick={closeBannerForm} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.banners.bannerTitle} *</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={hp.banners.bannerTitle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.banners.bannerSubtitle}</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={hp.banners.optional}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.banners.imageUrl} * (Desktop)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerForm.image}
                    onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
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
                {bannerForm.image && (
                  <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 h-32">
                    <img src={bannerForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh Tablet (768px - 1024px)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerForm.tabletImage}
                    onChange={(e) => setBannerForm({ ...bannerForm, tabletImage: e.target.value })}
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
                {bannerForm.tabletImage && (
                  <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 h-24">
                    <img src={bannerForm.tabletImage} alt="Tablet Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh Mobile (&lt; 768px)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerForm.mobileImage}
                    onChange={(e) => setBannerForm({ ...bannerForm, mobileImage: e.target.value })}
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
                {bannerForm.mobileImage && (
                  <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 h-24">
                    <img src={bannerForm.mobileImage} alt="Mobile Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.banners.link} *</label>
                <input
                  type="text"
                  value={bannerForm.link}
                  onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/category/sale"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeBannerForm}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleAddBanner}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                {editingBanner ? t.common.edit : t.common.create}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Section Settings Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingSection.title} {hp.sections.sectionSettings}</h2>
              <button onClick={() => { setEditingSection(null); setProductSearch(""); setSearchResults([]); }} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Section Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{hp.sections.sectionTitle}</label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => {
                    setEditingSection({ ...editingSection, title: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Selection Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chế độ hiển thị</label>
                <select
                  value={editingSection.settings.selectionMode || "auto"}
                  onChange={(e) => {
                    const newSettings: Record<string, any> = { ...editingSection.settings, selectionMode: e.target.value };
                    if (e.target.value === "auto") {
                      delete newSettings.productIds;
                    }
                    setEditingSection({ ...editingSection, settings: newSettings });
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">Tự động (theo danh mục/bộ lọc)</option>
                  <option value="manual">Chọn thủ công</option>
                </select>
              </div>

              {/* Manual Product Selection */}
              {editingSection.settings.selectionMode === "manual" && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Chọn sản phẩm</label>
                  
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => searchProducts(e.target.value)}
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              const currentIds = editingSection.settings.productIds || [];
                              if (!currentIds.includes(product.id)) {
                                const newSettings = { ...editingSection.settings, productIds: [...currentIds, product.id] };
                                setEditingSection({ ...editingSection, settings: newSettings });
                              }
                              setProductSearch("");
                              setSearchResults([]);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                          >
                            {product.image && (
                              <img src={product.image} alt="" className="w-8 h-8 object-cover rounded" />
                            )}
                            <span className="truncate">{product.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Products */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Sản phẩm đã chọn ({(editingSection.settings.productIds || []).length})</p>
                    {(editingSection.settings.productIds || []).map((productId: string) => {
                      const product = products.find(p => p.id === productId);
                      if (!product) return null;
                      return (
                        <div key={productId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          {product.image && (
                            <img src={product.image} alt="" className="w-10 h-10 object-cover rounded" />
                          )}
                          <span className="flex-1 text-sm truncate">{product.name}</span>
                          <button
                            onClick={() => {
                              const newIds = (editingSection.settings.productIds || []).filter((id: string) => id !== productId);
                              const newSettings = { ...editingSection.settings, productIds: newIds };
                              setEditingSection({ ...editingSection, settings: newSettings });
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Auto Mode Settings */}
              {editingSection.settings.selectionMode !== "manual" && (
                <>
                  {/* Product Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{hp.sections.displayCount}</label>
                    <input
                      type="number"
                      value={editingSection.settings.limit || 8}
                      onChange={(e) => {
                        const newSettings = { ...editingSection.settings, limit: parseInt(e.target.value) };
                        setEditingSection({ ...editingSection, settings: newSettings });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={1}
                      max={24}
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{hp.sections.category}</label>
                    <select
                      value={editingSection.settings.category || ""}
                      onChange={(e) => {
                        const newSettings = { ...editingSection.settings, category: e.target.value || undefined };
                        setEditingSection({ ...editingSection, settings: newSettings });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{hp.sections.allProducts}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">{hp.sections.categoryNote}</p>
                  </div>

                  {/* Featured Products */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={editingSection.settings.featured || false}
                      onChange={(e) => {
                        const newSettings = { ...editingSection.settings, featured: e.target.checked };
                        setEditingSection({ ...editingSection, settings: newSettings });
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="featured" className="text-sm">{hp.sections.featuredOnly}</label>
                  </div>

                  {/* On Sale Products */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="onSale"
                      checked={editingSection.settings.onSale || false}
                      onChange={(e) => {
                        const newSettings = { ...editingSection.settings, onSale: e.target.checked };
                        setEditingSection({ ...editingSection, settings: newSettings });
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="onSale" className="text-sm">{hp.sections.onSaleOnly}</label>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{hp.sections.sortOrder}</label>
                    <select
                      value={editingSection.settings.orderBy || "createdAt"}
                      onChange={(e) => {
                        const newSettings = { ...editingSection.settings, orderBy: e.target.value };
                        setEditingSection({ ...editingSection, settings: newSettings });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="createdAt">{hp.sections.sortNewest}</option>
                      <option value="price">{hp.sections.sortPrice}</option>
                      <option value="rating">{hp.sections.sortRating}</option>
                      <option value="sales">{hp.sections.sortSales}</option>
                    </select>
                  </div>
                </>
              )}

              {/* Blog Section Settings */}
              {editingSection.type === "blog" && (
                <>
                  {/* Source Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn bài viết</label>
                    <select
                      value={editingSection.settings.source || "latest"}
                      onChange={(e) => {
                        const newSettings: Record<string, any> = { ...editingSection.settings, source: e.target.value };
                        if (e.target.value !== "manual") {
                          delete newSettings.postIds;
                        }
                        setEditingSection({ ...editingSection, settings: newSettings });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="latest">Bài viết mới nhất</option>
                      <option value="category">Theo danh mục</option>
                      <option value="manual">Chọn thủ công</option>
                    </select>
                  </div>

                  {/* Blog Count */}
                  {editingSection.settings.source !== "manual" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số bài viết hiển thị</label>
                      <input
                        type="number"
                        value={editingSection.settings.limit || 8}
                        onChange={(e) => {
                          const newSettings = { ...editingSection.settings, limit: parseInt(e.target.value) };
                          setEditingSection({ ...editingSection, settings: newSettings });
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={1}
                        max={20}
                      />
                    </div>
                  )}

                  {/* Blog Category Selection */}
                  {editingSection.settings.source === "category" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục bài viết</label>
                      <select
                        value={editingSection.settings.blogCategory || ""}
                        onChange={(e) => {
                          const newSettings = { ...editingSection.settings, blogCategory: e.target.value || undefined };
                          setEditingSection({ ...editingSection, settings: newSettings });
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Tất cả danh mục</option>
                        {blogCategories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Manual Blog Selection */}
                  {editingSection.settings.source === "manual" && (
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Chọn bài viết</label>
                      
                      {/* Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={blogSearch}
                          onChange={(e) => searchBlogPosts(e.target.value)}
                          placeholder="Tìm kiếm bài viết..."
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {blogSearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                            {blogSearchResults.map((post) => (
                              <button
                                key={post.id}
                                onClick={() => {
                                  const currentIds = editingSection.settings.postIds || [];
                                  if (!currentIds.includes(post.id)) {
                                    const newSettings = { ...editingSection.settings, postIds: [...currentIds, post.id] };
                                    setEditingSection({ ...editingSection, settings: newSettings });
                                  }
                                  setBlogSearch("");
                                  setBlogSearchResults([]);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                              >
                                {post.featuredImage && (
                                  <img src={post.featuredImage} alt="" className="w-8 h-8 object-cover rounded" />
                                )}
                                <span className="truncate">{post.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Posts */}
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Bài viết đã chọn ({(editingSection.settings.postIds || []).length})</p>
                        {(editingSection.settings.postIds || []).map((postId: string) => {
                          const post = blogPosts.find(p => p.id === postId);
                          if (!post) return null;
                          return (
                            <div key={postId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                              {post.featuredImage && (
                                <img src={post.featuredImage} alt="" className="w-10 h-10 object-cover rounded" />
                              )}
                              <span className="flex-1 text-sm truncate">{post.title}</span>
                              <button
                                onClick={() => {
                                  const newIds = (editingSection.settings.postIds || []).filter((id: string) => id !== postId);
                                  const newSettings = { ...editingSection.settings, postIds: newIds };
                                  setEditingSection({ ...editingSection, settings: newSettings });
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setEditingSection(null); setProductSearch(""); setSearchResults([]); }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  setSections(sections.map((s) => 
                    s.id === editingSection.id 
                      ? { ...editingSection } 
                      : s
                  ));
                  setEditingSection(null);
                  setProductSearch("");
                  setSearchResults([]);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        currentImage={bannerForm[mediaPickerTarget]}
        onSelect={(url) => {
          setBannerForm({ ...bannerForm, [mediaPickerTarget]: url });
          setShowMediaPicker(false);
        }}
      />
    </div>
  );
}
