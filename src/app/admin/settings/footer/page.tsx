"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Globe } from "lucide-react";
import Card from "@/components/admin/Card";

interface FooterSettings {
  companyName: { ko: string; en: string; vi: string };
  ceo: { ko: string; en: string; vi: string };
  address: { ko: string; en: string; vi: string };
  businessNo: string;
  salesNo: string;
  phone: string;
  fax: string;
  email: string;
  hours: { ko: string; en: string; vi: string };
  lunchTime: { ko: string; en: string; vi: string };
  disclaimer: { ko: string; en: string; vi: string };
  copyright: { ko: string; en: string; vi: string };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    kakao?: string;
    naver?: string;
  };
}

type Lang = "ko" | "en" | "vi";

export default function FooterSettingsPage() {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>("ko");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/footer");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
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

  const updateField = (field: string, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const updateLocalizedField = (field: keyof FooterSettings, lang: Lang, value: string) => {
    if (!settings) return;
    const current = settings[field] as { ko: string; en: string; vi: string };
    setSettings({
      ...settings,
      [field]: { ...current, [lang]: value },
    });
  };

  const updateSocialLink = (platform: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialLinks: { ...settings.socialLinks, [platform]: value },
    });
  };

  if (loading || !settings) {
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
        <h1 className="text-2xl font-bold">Cài đặt Footer</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          Lưu thay đổi
        </button>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card title="Thông tin công ty">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên công ty ({activeLang})</label>
              <input
                type="text"
                value={settings.companyName[activeLang]}
                onChange={(e) => updateLocalizedField("companyName", activeLang, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEO / Đại diện ({activeLang})</label>
              <input
                type="text"
                value={settings.ceo[activeLang]}
                onChange={(e) => updateLocalizedField("ceo", activeLang, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ ({activeLang})</label>
              <input
                type="text"
                value={settings.address[activeLang]}
                onChange={(e) => updateLocalizedField("address", activeLang, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mã số doanh nghiệp</label>
                <input
                  type="text"
                  value={settings.businessNo}
                  onChange={(e) => updateField("businessNo", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số đăng ký kinh doanh</label>
                <input
                  type="text"
                  value={settings.salesNo}
                  onChange={(e) => updateField("salesNo", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card title="Thông tin liên hệ">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fax</label>
                <input
                  type="text"
                  value={settings.fax}
                  onChange={(e) => updateField("fax", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giờ làm việc ({activeLang})</label>
              <input
                type="text"
                value={settings.hours[activeLang]}
                onChange={(e) => updateLocalizedField("hours", activeLang, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giờ nghỉ trưa ({activeLang})</label>
              <input
                type="text"
                value={settings.lunchTime[activeLang]}
                onChange={(e) => updateLocalizedField("lunchTime", activeLang, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </Card>

        {/* Legal */}
        <Card title="Pháp lý">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Disclaimer ({activeLang})</label>
              <textarea
                value={settings.disclaimer[activeLang]}
                onChange={(e) => updateLocalizedField("disclaimer", activeLang, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Copyright ({activeLang})</label>
              <input
                type="text"
                value={settings.copyright[activeLang]}
                onChange={(e) => updateLocalizedField("copyright", activeLang, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card title="Mạng xã hội">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="url"
                value={settings.socialLinks.facebook || ""}
                onChange={(e) => updateSocialLink("facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="url"
                value={settings.socialLinks.instagram || ""}
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">YouTube</label>
              <input
                type="url"
                value={settings.socialLinks.youtube || ""}
                onChange={(e) => updateSocialLink("youtube", e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">KakaoTalk</label>
              <input
                type="url"
                value={settings.socialLinks.kakao || ""}
                onChange={(e) => updateSocialLink("kakao", e.target.value)}
                placeholder="https://pf.kakao.com/..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Naver Blog</label>
              <input
                type="url"
                value={settings.socialLinks.naver || ""}
                onChange={(e) => updateSocialLink("naver", e.target.value)}
                placeholder="https://blog.naver.com/..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
