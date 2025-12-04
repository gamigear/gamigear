"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  X,
  Plus,
  Save,
  ImageIcon,
  FolderOpen,
} from "lucide-react";
import Card from "@/components/admin/Card";
import MediaPicker from "@/components/admin/MediaPicker";
import { useI18n } from "@/lib/i18n";
import { generateSlug } from "@/lib/utils";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="border border-gray-200 rounded-lg min-h-[200px] p-4 text-gray-400">Đang tải editor...</div>,
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  visible: boolean;
  variation: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    sku: "",
    regularPrice: "",
    salePrice: "",
    status: "draft",
    featured: false,
    categoryId: "",
    manageStock: false,
    stockQuantity: "0",
    stockStatus: "instock",
    weight: "",
    length: "",
    width: "",
    height: "",
    // Affiliate fields
    productType: "simple",
    affiliateUrl: "",
    affiliatePlatform: "",
    affiliateButtonText: "",
  });

  const [activeTab, setActiveTab] = useState("general");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [newAttribute, setNewAttribute] = useState({ name: "", value: "", visible: true, variation: false });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Auto-generate slug from name
    if (name === "name") {
      const slug = generateSlug(value);
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addAttribute = () => {
    if (newAttribute.name.trim() && newAttribute.value.trim()) {
      setAttributes([
        ...attributes,
        { ...newAttribute, id: `attr-${Date.now()}` },
      ]);
      setNewAttribute({ name: "", value: "", visible: true, variation: false });
    }
  };

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter((attr) => attr.id !== id));
  };

  const updateAttribute = (id: string, field: keyof ProductAttribute, value: string | boolean) => {
    setAttributes(
      attributes.map((attr) =>
        attr.id === id ? { ...attr, [field]: value } : attr
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: publish ? 'published' : formData.status,
          regularPrice: parseFloat(formData.regularPrice) || 0,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          images: images,
          attributes: attributes.map((attr) => ({
            name: attr.name,
            value: attr.value,
            visible: attr.visible,
            variation: attr.variation,
          })),
        }),
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const error = await response.json();
        alert(error.error || '상품 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('상품 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: t.products.general },
    { id: "affiliate", label: t.products.affiliate || "Affiliate" },
    { id: "inventory", label: t.products.inventory },
    { id: "shipping", label: t.products.shipping },
    { id: "attributes", label: t.products.attributes },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">{t.products.addProduct}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {t.products.saveDraft}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? t.common.saving : t.common.publish}
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, true)}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card title={t.products.general}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.products.productName} *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.products.productName}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.products.slug}</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="product-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.products.shortDescription}</label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.products.shortDescription}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.products.description}</label>
                  <RichTextEditor
                    content={formData.description}
                    onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
                    placeholder="Mô tả chi tiết sản phẩm..."
                  />
                </div>
              </div>
            </Card>

            {/* Product Data Tabs */}
            <Card>
              <div className="border-b border-gray-200">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === "general" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.products.productType || "Loại sản phẩm"}</label>
                      <select
                        name="productType"
                        value={formData.productType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="simple">{t.products.simpleProduct || "Sản phẩm đơn giản"}</option>
                        <option value="affiliate">{t.products.affiliateProduct || "Sản phẩm Affiliate"}</option>
                        <option value="variable">{t.products.variableProduct || "Sản phẩm có biến thể"}</option>
                      </select>
                      {formData.productType === "affiliate" && (
                        <p className="text-xs text-orange-600 mt-1">
                          {t.products.affiliateNote || "Sản phẩm affiliate sẽ chuyển hướng đến sàn TMĐT khi khách hàng click mua"}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.products.regularPrice} *</label>
                        <input
                          type="number"
                          name="regularPrice"
                          value={formData.regularPrice}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.products.salePrice}</label>
                        <input
                          type="number"
                          name="salePrice"
                          value={formData.salePrice}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.products.sku}</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SKU-001"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "affiliate" && (
                  <div className="space-y-4">
                    {formData.productType !== "affiliate" ? (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-500">
                          {t.products.selectAffiliateType || "Vui lòng chọn loại sản phẩm là 'Affiliate' trong tab General để sử dụng tính năng này"}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">{t.products.affiliatePlatform || "Sàn TMĐT"}</label>
                          <select
                            name="affiliatePlatform"
                            value={formData.affiliatePlatform}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Chọn sàn --</option>
                            <option value="shopee">Shopee</option>
                            <option value="lazada">Lazada</option>
                            <option value="tiki">Tiki</option>
                            <option value="sendo">Sendo</option>
                            <option value="amazon">Amazon</option>
                            <option value="coupang">Coupang</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">{t.products.affiliateUrl || "Link Affiliate"} *</label>
                          <input
                            type="url"
                            name="affiliateUrl"
                            value={formData.affiliateUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://shopee.vn/product/..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {t.products.affiliateUrlNote || "Nhập link affiliate có chứa mã tracking của bạn"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">{t.products.affiliateButtonText || "Text nút mua hàng"}</label>
                          <input
                            type="text"
                            name="affiliateButtonText"
                            value={formData.affiliateButtonText}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mua trên Shopee"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {t.products.affiliateButtonNote || "Để trống sẽ hiển thị mặc định theo sàn đã chọn"}
                          </p>
                        </div>
                        
                        {/* Preview */}
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm font-medium text-orange-800 mb-2">Preview nút mua hàng:</p>
                          <button className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600">
                            {formData.affiliateButtonText || 
                              (formData.affiliatePlatform === "shopee" ? "Mua trên Shopee" :
                               formData.affiliatePlatform === "lazada" ? "Mua trên Lazada" :
                               formData.affiliatePlatform === "tiki" ? "Mua trên Tiki" :
                               formData.affiliatePlatform === "amazon" ? "Buy on Amazon" :
                               "Mua ngay")}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "inventory" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="manageStock"
                        checked={formData.manageStock}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <label className="text-sm">{t.products.manageStock}</label>
                    </div>
                    {formData.manageStock && (
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.products.stockQuantity}</label>
                        <input
                          type="number"
                          name="stockQuantity"
                          value={formData.stockQuantity}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.products.stockStatus}</label>
                      <select
                        name="stockStatus"
                        value={formData.stockStatus}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="instock">{t.products.inStock}</option>
                        <option value="outofstock">{t.products.outOfStock}</option>
                        <option value="onbackorder">{t.products.onBackorder}</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.products.weight} (kg)</label>
                      <input
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.5"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.products.length} (cm)</label>
                        <input
                          type="text"
                          name="length"
                          value={formData.length}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.products.width} (cm)</label>
                        <input
                          type="text"
                          name="width"
                          value={formData.width}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.products.height} (cm)</label>
                        <input
                          type="text"
                          name="height"
                          value={formData.height}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "attributes" && (
                  <div className="space-y-4">
                    {/* Add new attribute */}
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">{t.products.attributeName}</label>
                          <input
                            type="text"
                            value={newAttribute.name}
                            onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Color, Size, Material..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">{t.products.attributeValue}</label>
                          <input
                            type="text"
                            value={newAttribute.value}
                            onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Red, Blue | S, M, L..."
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newAttribute.visible}
                            onChange={(e) => setNewAttribute({ ...newAttribute, visible: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          {t.products.visibleOnProduct}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newAttribute.variation}
                            onChange={(e) => setNewAttribute({ ...newAttribute, variation: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          {t.products.usedForVariations}
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={addAttribute}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        <Plus size={16} />
                        {t.products.addAttribute}
                      </button>
                    </div>

                    {/* Attributes list */}
                    {attributes.length > 0 ? (
                      <div className="space-y-3">
                        {attributes.map((attr) => (
                          <div key={attr.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={attr.name}
                                onChange={(e) => updateAttribute(attr.id, "name", e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                placeholder={t.products.attributeName}
                              />
                              <input
                                type="text"
                                value={attr.value}
                                onChange={(e) => updateAttribute(attr.id, "value", e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                placeholder={t.products.attributeValue}
                              />
                            </div>
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={attr.visible}
                                onChange={(e) => updateAttribute(attr.id, "visible", e.target.checked)}
                                className="w-3 h-3 rounded"
                              />
                              Visible
                            </label>
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={attr.variation}
                                onChange={(e) => updateAttribute(attr.id, "variation", e.target.checked)}
                                className="w-3 h-3 rounded"
                              />
                              Variation
                            </label>
                            <button
                              type="button"
                              onClick={() => removeAttribute(attr.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">{t.common.noData}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Images */}
            <Card title={t.products.productImages}>
              <div className="p-6 space-y-4">
                {/* Buttons to add images */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FolderOpen size={18} />
                    {t.media.selectFromLibrary}
                  </button>
                </div>

                {/* URL input option */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.products.imageUrl}
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {images.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                            {t.products.mainImage}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">{t.products.noImages}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card title={t.common.publish}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.common.status}</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">{t.common.draft}</option>
                    <option value="published">{t.common.published}</option>
                    <option value="pending">{t.common.pending}</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label className="text-sm">{t.products.featuredProduct}</label>
                </div>
              </div>
            </Card>

            {/* Category */}
            <Card title={t.products.category}>
              <div className="p-6">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.products.category}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Preview */}
            <Card title={t.common.preview}>
              <div className="p-6">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt="Preview"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={48} className="text-gray-300" />
                  )}
                </div>
                <h3 className="font-medium">{formData.name || t.products.productName}</h3>
                <p className="text-lg font-bold mt-1">
                  {formData.regularPrice
                    ? `₩${Number(formData.regularPrice).toLocaleString()}`
                    : "₩0"}
                </p>
                {formData.salePrice && (
                  <p className="text-sm text-red-500">
                    {t.products.salePrice}: ₩{Number(formData.salePrice).toLocaleString()}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => {
          setImages([...images, url]);
          setShowMediaPicker(false);
        }}
      />
    </div>
  );
}
