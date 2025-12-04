"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  FolderOpen,
  Search,
  Plus,
  Trash2,
} from "lucide-react";
import Card from "@/components/admin/Card";
import MediaPicker from "@/components/admin/MediaPicker";

interface Product {
  id: string;
  name: string;
  price: number;
  images: { src: string }[];
}

const TEMPLATES = [
  { id: "hero-product", name: "Hero + Sản phẩm" },
  { id: "countdown-sale", name: "Countdown Sale" },
  { id: "product-showcase", name: "Product Showcase" },
  { id: "minimal-cta", name: "Minimal CTA" },
];

export default function EditLandingPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<string>("");
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    template: "hero-product",
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    heroButtonText: "",
    heroButtonLink: "",
    heroBackground: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    contentTitle: "",
    contentText: "",
    contentImage: "",
    showProducts: true,
    productIds: "[]",
    productTitle: "Sản phẩm nổi bật",
    ctaTitle: "",
    ctaSubtitle: "",
    ctaButtonText: "",
    ctaButtonLink: "",
    ctaBackground: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    countdownEnabled: false,
    countdownEndDate: "",
    countdownTitle: "",
    customCss: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
    isActive: true,
  });

  useEffect(() => {
    if (id) fetchLandingPage();
  }, [id]);

  const fetchLandingPage = async () => {
    try {
      const res = await fetch(`/api/landing-pages/${id}`);
      if (!res.ok) {
        router.push("/admin/landing-pages");
        return;
      }
      const data = await res.json();
      setForm({
        ...form,
        ...data,
        countdownEndDate: data.countdownEndDate
          ? new Date(data.countdownEndDate).toISOString().slice(0, 16)
          : "",
      });

      if (data.productIds) {
        try {
          const productIds = JSON.parse(data.productIds);
          if (productIds.length > 0) {
            const productsRes = await fetch(`/api/products?ids=${productIds.join(",")}`);
            const productsData = await productsRes.json();
            setSelectedProducts(productsData.data || []);
          }
        } catch (e) {
          console.error("Failed to parse productIds:", e);
        }
      }
    } catch (error) {
      console.error("Failed to fetch landing page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        productIds: JSON.stringify(selectedProducts.map((p) => p.id)),
        countdownEndDate: form.countdownEndDate ? new Date(form.countdownEndDate).toISOString() : null,
      };
      const res = await fetch(`/api/landing-pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Lưu thành công!");
      } else {
        const errorData = await res.json();
        alert("Có lỗi xảy ra: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Có lỗi xảy ra khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const searchProducts = async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error("Search products error:", error);
    }
  };

  const addProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch("");
    setSearchResults([]);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const openMediaPicker = (target: string) => {
    setMediaTarget(target);
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (url: string) => {
    setForm({ ...form, [mediaTarget]: url });
    setShowMediaPicker(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/landing-pages" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa Landing Page</h1>
            <p className="text-sm text-gray-500 mt-1">{form.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/events/${form.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Eye size={16} /> Xem trang
          </Link>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Thông tin cơ bản">
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn *</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500">/events/</span>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="flex-1 px-4 py-2 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TEMPLATES.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                </select>
              </div>
            </div>
          </Card>

          <Card title="Hero Section">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Hero</label>
                  <input type="text" value={form.heroTitle || ""} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Black Friday Sale" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phụ đề Hero</label>
                  <input type="text" value={form.heroSubtitle || ""} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Giảm đến 50%" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh Hero</label>
                <div className="flex gap-2">
                  <input type="text" value={form.heroImage || ""} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="URL hình ảnh" />
                  <button type="button" onClick={() => openMediaPicker("heroImage")} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><FolderOpen size={16} /></button>
                </div>
                {form.heroImage && <img src={form.heroImage} alt="Hero" className="mt-2 h-32 rounded-lg object-cover" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text nút</label>
                  <input type="text" value={form.heroButtonText || ""} onChange={(e) => setForm({ ...form, heroButtonText: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Mua ngay" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link nút</label>
                  <input type="text" value={form.heroButtonLink || ""} onChange={(e) => setForm({ ...form, heroButtonLink: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="/shop hoặc #products" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background (CSS)</label>
                <input type="text" value={form.heroBackground || ""} onChange={(e) => setForm({ ...form, heroBackground: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
                <div className="mt-2 h-12 rounded-lg" style={{ background: form.heroBackground || "#667eea" }} />
              </div>
            </div>
          </Card>

          {form.template === "countdown-sale" && (
            <Card title="Countdown">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="countdownEnabled" checked={form.countdownEnabled} onChange={(e) => setForm({ ...form, countdownEnabled: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="countdownEnabled" className="text-sm font-medium text-gray-700">Bật đếm ngược</label>
                </div>
                {form.countdownEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề countdown</label>
                      <input type="text" value={form.countdownTitle || ""} onChange={(e) => setForm({ ...form, countdownTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Kết thúc sau" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                      <input type="datetime-local" value={form.countdownEndDate || ""} onChange={(e) => setForm({ ...form, countdownEndDate: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}


          <Card title="Sản phẩm">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="showProducts" checked={form.showProducts} onChange={(e) => setForm({ ...form, showProducts: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                <label htmlFor="showProducts" className="text-sm font-medium text-gray-700">Hiển thị sản phẩm</label>
              </div>
              {form.showProducts && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề section</label>
                    <input type="text" value={form.productTitle || ""} onChange={(e) => setForm({ ...form, productTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Sản phẩm khuyến mãi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chọn sản phẩm</label>
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={productSearch} onChange={(e) => { setProductSearch(e.target.value); searchProducts(e.target.value); }} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tìm sản phẩm..." />
                        </div>
                      </div>
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((product) => (
                            <button key={product.id} type="button" onClick={() => addProduct(product)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left">
                              {product.images?.[0]?.src ? <img src={product.images[0].src} alt={product.name} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-gray-100" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.price?.toLocaleString()}đ</p>
                              </div>
                              <Plus size={16} className="text-blue-600" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedProducts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">{selectedProducts.length} sản phẩm đã chọn</p>
                      <div className="space-y-2">
                        {selectedProducts.map((product) => (
                          <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {product.images?.[0]?.src ? <img src={product.images[0].src} alt={product.name} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 rounded bg-gray-200" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.price?.toLocaleString()}đ</p>
                            </div>
                            <button type="button" onClick={() => removeProduct(product.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          <Card title="Call to Action">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề CTA</label>
                  <input type="text" value={form.ctaTitle || ""} onChange={(e) => setForm({ ...form, ctaTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Đừng bỏ lỡ!" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phụ đề CTA</label>
                  <input type="text" value={form.ctaSubtitle || ""} onChange={(e) => setForm({ ...form, ctaSubtitle: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Ưu đãi có hạn" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text nút CTA</label>
                  <input type="text" value={form.ctaButtonText || ""} onChange={(e) => setForm({ ...form, ctaButtonText: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Mua ngay" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link nút CTA</label>
                  <input type="text" value={form.ctaButtonLink || ""} onChange={(e) => setForm({ ...form, ctaButtonLink: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="/shop" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background CTA (CSS)</label>
                <input type="text" value={form.ctaBackground || ""} onChange={(e) => setForm({ ...form, ctaBackground: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="mt-2 h-12 rounded-lg" style={{ background: form.ctaBackground || "#f5576c" }} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Trạng thái">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Kích hoạt</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">{form.isActive ? "Landing page đang hiển thị" : "Landing page đang ẩn"}</p>
            </div>
          </Card>

          <Card title="Màu sắc">
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Màu chính</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Màu phụ</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
            </div>
          </Card>

          <Card title="SEO">
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input type="text" value={form.metaTitle || ""} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tiêu đề SEO" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea value={form.metaDescription || ""} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Mô tả SEO" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
                <div className="flex gap-2">
                  <input type="text" value={form.ogImage || ""} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="URL hình ảnh" />
                  <button type="button" onClick={() => openMediaPicker("ogImage")} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><FolderOpen size={16} /></button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Custom CSS">
            <div className="p-4">
              <textarea value={form.customCss || ""} onChange={(e) => setForm({ ...form, customCss: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" rows={6} placeholder=".hero { ... }" />
            </div>
          </Card>
        </div>
      </div>

      <MediaPicker isOpen={showMediaPicker} onClose={() => setShowMediaPicker(false)} currentImage={form[mediaTarget as keyof typeof form] as string} onSelect={handleMediaSelect} />
    </div>
  );
}
