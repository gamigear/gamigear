"use client";

import { useState, useEffect } from "react";
import { User, Store, Bell, Lock, CreditCard, Globe, Image as ImageIcon, Search as SearchIcon, Save, Loader2, Truck, ChevronDown, ChevronUp } from "lucide-react";
import Card from "@/components/admin/Card";

const tabs = [
  { id: "general", label: "Cài đặt chung", icon: Globe },
  { id: "store", label: "Cửa hàng", icon: Store },
  { id: "shipping", label: "Vận chuyển", icon: Truck },
  { id: "profile", label: "Hồ sơ", icon: User },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "security", label: "Bảo mật", icon: Lock },
  { id: "payment", label: "Thanh toán", icon: CreditCard },
];

// Shipping zones configuration
interface ShippingZone {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
}

interface InternationalShipping {
  useGlobalPrice: boolean;
  globalPrice: number;
  zones: ShippingZone[];
}

const defaultInternationalZones: ShippingZone[] = [
  { id: "asia", name: "Châu Á (ngoài VN)", price: 500000, enabled: true },
  { id: "europe", name: "Châu Âu", price: 800000, enabled: true },
  { id: "north_america", name: "Bắc Mỹ", price: 900000, enabled: true },
  { id: "south_america", name: "Nam Mỹ", price: 1000000, enabled: true },
  { id: "africa", name: "Châu Phi", price: 1200000, enabled: false },
  { id: "oceania", name: "Châu Đại Dương", price: 1000000, enabled: true },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [showInternationalZones, setShowInternationalZones] = useState(false);
  
  const [formData, setFormData] = useState({
    // General
    siteName: "Gamigear",
    siteTagline: "Thiết bị gaming cho nhà vô địch",
    siteDescription: "Gaming gear for champions - Thiết bị gaming chất lượng cao",
    logo: "",
    favicon: "",
    // SEO
    metaTitle: "Gamigear - Thiết bị gaming cho nhà vô địch",
    metaDescription: "Cửa hàng thiết bị gaming chất lượng cao với giá tốt nhất",
    metaKeywords: "gaming, gear, keyboard, mouse, headset",
    // Store
    storeName: "Gamigear",
    storeEmail: "support@gamigear.vn",
    storePhone: "1900 1234 56",
    storeAddress: "123 Đường ABC, Quận 1, TP.HCM",
    currency: "VND",
    currencySymbol: "đ",
    currencyPosition: "right",
    language: "vi",
    // Profile
    name: "Admin User",
    email: "admin@gamigear.vn",
    phone: "0123 456 789",
  });

  // Shipping settings
  const [shippingSettings, setShippingSettings] = useState({
    // Vietnam - Inner city (HCM, Hanoi)
    vnInnerCity: {
      enabled: true,
      price: 20000,
      freeShippingThreshold: 500000,
      estimatedDays: "1-2",
    },
    // Vietnam - Other provinces
    vnProvince: {
      enabled: true,
      price: 35000,
      freeShippingThreshold: 1000000,
      estimatedDays: "3-5",
    },
    // International
    international: {
      enabled: true,
      useGlobalPrice: true,
      globalPrice: 800000,
      zones: defaultInternationalZones,
      estimatedDays: "7-14",
    },
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    alert("Đã lưu cài đặt thành công!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Lưu thay đổi
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <nav className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-gray-100 text-black"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "general" && (
            <>
              {/* Site Identity */}
              <Card title="Nhận diện website">
                <div className="p-6 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tên website</label>
                      <input
                        type="text"
                        value={formData.siteName}
                        onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Slogan</label>
                      <input
                        type="text"
                        value={formData.siteTagline}
                        onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mô tả website</label>
                    <textarea
                      value={formData.siteDescription}
                      onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Logo & Favicon */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Logo</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Logo" className="h-16 mx-auto mb-2" />
                        ) : (
                          <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                        )}
                        <input
                          type="text"
                          placeholder="Nhập URL logo"
                          value={formData.logo}
                          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">Khuyến nghị: 200x50px, PNG/SVG</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Favicon</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                        {formData.favicon ? (
                          <img src={formData.favicon} alt="Favicon" className="h-8 mx-auto mb-2" />
                        ) : (
                          <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                        )}
                        <input
                          type="text"
                          placeholder="Nhập URL favicon"
                          value={formData.favicon}
                          onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">Khuyến nghị: 32x32px, ICO/PNG</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* SEO Settings */}
              <Card title="Cài đặt SEO">
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 ký tự</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Description</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 ký tự</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === "store" && (
            <Card title="Cài đặt cửa hàng">
              <div className="p-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên cửa hàng</label>
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.storeEmail}
                      onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.storePhone}
                      onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      value={formData.storeAddress}
                      onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Tiền tệ & Ngôn ngữ</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tiền tệ</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => {
                          const val = e.target.value;
                          const symbols: Record<string, string> = { VND: "đ", USD: "$", KRW: "₩", EUR: "€" };
                          setFormData({ ...formData, currency: val, currencySymbol: symbols[val] || val });
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="VND">VND (đ)</option>
                        <option value="USD">USD ($)</option>
                        <option value="KRW">KRW (₩)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Vị trí ký hiệu</label>
                      <select
                        value={formData.currencyPosition}
                        onChange={(e) => setFormData({ ...formData, currencyPosition: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="left">Trước số ($ 100)</option>
                        <option value="right">Sau số (100 đ)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                        <option value="ko">한국어</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "shipping" && (
            <>
              {/* Vietnam Inner City */}
              <Card title="🏙️ Nội thành HCM & Hà Nội">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Kích hoạt vùng này</p>
                      <p className="text-sm text-gray-500">Áp dụng cho nội thành TP.HCM và Hà Nội</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shippingSettings.vnInnerCity.enabled}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          vnInnerCity: { ...shippingSettings.vnInnerCity, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phí vận chuyển (VNĐ)</label>
                      <input
                        type="number"
                        value={shippingSettings.vnInnerCity.price}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          vnInnerCity: { ...shippingSettings.vnInnerCity, price: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Miễn phí từ (VNĐ)</label>
                      <input
                        type="number"
                        value={shippingSettings.vnInnerCity.freeShippingThreshold}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          vnInnerCity: { ...shippingSettings.vnInnerCity, freeShippingThreshold: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Đặt 0 để không miễn phí</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Thời gian giao hàng</label>
                      <input
                        type="text"
                        value={shippingSettings.vnInnerCity.estimatedDays}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          vnInnerCity: { ...shippingSettings.vnInnerCity, estimatedDays: e.target.value }
                        })}
                        placeholder="VD: 1-2 ngày"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Vietnam Province */}
              <Card title="🏞️ Tỉnh lẻ Việt Nam">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Kích hoạt vùng này</p>
                      <p className="text-sm text-gray-500">Áp dụng cho các tỉnh/thành khác ngoài HCM và Hà Nội</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shippingSettings.vnProvince.enabled}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          vnProvince: { ...shippingSettings.vnProvince, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phí vận chuyển (VNĐ)</label>
                      <input
                        type="number"
                        value={shippingSettings.vnProvince.price}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          vnProvince: { ...shippingSettings.vnProvince, price: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Miễn phí từ (VNĐ)</label>
                      <input
                        type="number"
                        value={shippingSettings.vnProvince.freeShippingThreshold}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          vnProvince: { ...shippingSettings.vnProvince, freeShippingThreshold: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Đặt 0 để không miễn phí</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Thời gian giao hàng</label>
                      <input
                        type="text"
                        value={shippingSettings.vnProvince.estimatedDays}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          vnProvince: { ...shippingSettings.vnProvince, estimatedDays: e.target.value }
                        })}
                        placeholder="VD: 3-5 ngày"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* International */}
              <Card title="🌍 Quốc tế (Ngoài Việt Nam)">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Kích hoạt vận chuyển quốc tế</p>
                      <p className="text-sm text-gray-500">Cho phép giao hàng ra nước ngoài</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shippingSettings.international.enabled}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          international: { ...shippingSettings.international, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {shippingSettings.international.enabled && (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="intlPricing"
                            checked={shippingSettings.international.useGlobalPrice}
                            onChange={() => setShippingSettings({
                              ...shippingSettings,
                              international: { ...shippingSettings.international, useGlobalPrice: true }
                            })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Giá chung toàn cầu</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="intlPricing"
                            checked={!shippingSettings.international.useGlobalPrice}
                            onChange={() => setShippingSettings({
                              ...shippingSettings,
                              international: { ...shippingSettings.international, useGlobalPrice: false }
                            })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Giá theo khu vực</span>
                        </label>
                      </div>

                      {shippingSettings.international.useGlobalPrice ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Phí vận chuyển quốc tế (VNĐ)</label>
                            <input
                              type="number"
                              value={shippingSettings.international.globalPrice}
                              onChange={(e) => setShippingSettings({
                                ...shippingSettings,
                                international: { ...shippingSettings.international, globalPrice: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Thời gian giao hàng</label>
                            <input
                              type="text"
                              value={shippingSettings.international.estimatedDays}
                              onChange={(e) => setShippingSettings({
                                ...shippingSettings,
                                international: { ...shippingSettings.international, estimatedDays: e.target.value }
                              })}
                              placeholder="VD: 7-14 ngày"
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Phí theo khu vực lục địa</p>
                            <button
                              type="button"
                              onClick={() => setShowInternationalZones(!showInternationalZones)}
                              className="text-sm text-blue-600 flex items-center gap-1"
                            >
                              {showInternationalZones ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              {showInternationalZones ? "Thu gọn" : "Mở rộng"}
                            </button>
                          </div>
                          
                          {showInternationalZones && (
                            <div className="space-y-3 border rounded-lg p-4">
                              {shippingSettings.international.zones.map((zone, index) => (
                                <div key={zone.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={zone.enabled}
                                      onChange={(e) => {
                                        const newZones = [...shippingSettings.international.zones];
                                        newZones[index] = { ...zone, enabled: e.target.checked };
                                        setShippingSettings({
                                          ...shippingSettings,
                                          international: { ...shippingSettings.international, zones: newZones }
                                        });
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                  <span className="flex-1 text-sm">{zone.name}</span>
                                  <div className="w-40">
                                    <input
                                      type="number"
                                      value={zone.price}
                                      onChange={(e) => {
                                        const newZones = [...shippingSettings.international.zones];
                                        newZones[index] = { ...zone, price: parseInt(e.target.value) || 0 };
                                        setShippingSettings({
                                          ...shippingSettings,
                                          international: { ...shippingSettings.international, zones: newZones }
                                        });
                                      }}
                                      disabled={!zone.enabled}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                                      placeholder="VNĐ"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Thời gian giao hàng quốc tế</label>
                            <input
                              type="text"
                              value={shippingSettings.international.estimatedDays}
                              onChange={(e) => setShippingSettings({
                                ...shippingSettings,
                                international: { ...shippingSettings.international, estimatedDays: e.target.value }
                              })}
                              placeholder="VD: 7-14 ngày"
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              {/* Summary */}
              <Card title="📋 Tóm tắt cài đặt">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Vùng</th>
                          <th className="text-left py-3 px-4">Trạng thái</th>
                          <th className="text-right py-3 px-4">Phí ship</th>
                          <th className="text-right py-3 px-4">Miễn phí từ</th>
                          <th className="text-left py-3 px-4">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4">Nội thành HCM & Hà Nội</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${shippingSettings.vnInnerCity.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {shippingSettings.vnInnerCity.enabled ? "Bật" : "Tắt"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{shippingSettings.vnInnerCity.price.toLocaleString()}đ</td>
                          <td className="py-3 px-4 text-right">{shippingSettings.vnInnerCity.freeShippingThreshold > 0 ? `${shippingSettings.vnInnerCity.freeShippingThreshold.toLocaleString()}đ` : "-"}</td>
                          <td className="py-3 px-4">{shippingSettings.vnInnerCity.estimatedDays} ngày</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Tỉnh lẻ Việt Nam</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${shippingSettings.vnProvince.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {shippingSettings.vnProvince.enabled ? "Bật" : "Tắt"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{shippingSettings.vnProvince.price.toLocaleString()}đ</td>
                          <td className="py-3 px-4 text-right">{shippingSettings.vnProvince.freeShippingThreshold > 0 ? `${shippingSettings.vnProvince.freeShippingThreshold.toLocaleString()}đ` : "-"}</td>
                          <td className="py-3 px-4">{shippingSettings.vnProvince.estimatedDays} ngày</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4">Quốc tế</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${shippingSettings.international.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {shippingSettings.international.enabled ? "Bật" : "Tắt"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {shippingSettings.international.useGlobalPrice 
                              ? `${shippingSettings.international.globalPrice.toLocaleString()}đ`
                              : "Theo khu vực"
                            }
                          </td>
                          <td className="py-3 px-4 text-right">-</td>
                          <td className="py-3 px-4">{shippingSettings.international.estimatedDays} ngày</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === "profile" && (
            <Card title="Hồ sơ cá nhân">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                  <div>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                      Đổi ảnh đại diện
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG. Tối đa 2MB</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card title="Cài đặt thông báo">
              <div className="p-6 space-y-4">
                {[
                  { label: "Đơn hàng mới", description: "Nhận thông báo khi có đơn hàng mới" },
                  { label: "Cập nhật đơn hàng", description: "Nhận thông báo khi trạng thái đơn hàng thay đổi" },
                  { label: "Khách hàng mới", description: "Nhận thông báo khi có khách hàng đăng ký mới" },
                  { label: "Yêu cầu hoàn tiền", description: "Nhận thông báo khi có yêu cầu hoàn tiền" },
                  { label: "Cảnh báo hết hàng", description: "Nhận thông báo khi sản phẩm sắp hết hàng" },
                  { label: "Liên hệ mới", description: "Nhận thông báo khi có tin nhắn liên hệ mới" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "security" && (
            <Card title="Cài đặt bảo mật">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                  Cập nhật mật khẩu
                </button>
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-medium mb-4">Xác thực hai yếu tố (2FA)</h4>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                    Bật xác thực 2FA
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "payment" && (
            <Card title="Cài đặt thanh toán">
              <div className="p-6 space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Cấu hình phương thức thanh toán và thông tin nhận tiền tại đây.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Tài khoản ngân hàng</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tên ngân hàng</label>
                      <input
                        type="text"
                        placeholder="VD: Vietcombank"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Số tài khoản</label>
                      <input
                        type="text"
                        placeholder="Nhập số tài khoản"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Chủ tài khoản</label>
                      <input
                        type="text"
                        placeholder="Nhập tên chủ tài khoản"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Chi nhánh</label>
                      <input
                        type="text"
                        placeholder="Nhập chi nhánh"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
