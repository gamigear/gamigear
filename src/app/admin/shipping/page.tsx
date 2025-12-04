"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit, Loader2, X, ChevronUp, ChevronDown,
  Truck, Settings, MapPin, Globe, Building2,
} from "lucide-react";
import Card from "@/components/admin/Card";

interface ShippingZone {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  priority: number;
  isActive: boolean;
  locations: ShippingLocation[];
  methods: ShippingMethod[];
  _count?: { locations: number; methods: number };
}

interface ShippingLocation {
  id: string;
  type: string;
  code: string;
  name: string;
  nameEn?: string;
  nameKo?: string;
  isActive: boolean;
}

interface ShippingMethod {
  id: string;
  zoneId?: string;
  name: string;
  nameEn?: string;
  nameKo?: string;
  description?: string;
  type: string;
  cost: number;
  minAmount?: number;
  maxAmount?: number;
  estimatedDays?: string;
  isActive: boolean;
  position: number;
}

const ZONE_TYPES = [
  { value: "vietnam_urban", label: "Việt Nam - Nội thành", icon: Building2, emoji: "🏙️" },
  { value: "vietnam_province", label: "Việt Nam - Tỉnh lẻ", icon: MapPin, emoji: "🏘️" },
  { value: "international", label: "Quốc tế - Theo lục địa", icon: Globe, emoji: "🌍" },
  { value: "global", label: "Quốc tế - Toàn cầu", icon: Globe, emoji: "🌐" },
];

const METHOD_TYPES = [
  { value: "flat_rate", label: "Phí cố định" },
  { value: "free_shipping", label: "Miễn phí vận chuyển" },
  { value: "express", label: "Giao hàng nhanh" },
  { value: "local_pickup", label: "Nhận tại cửa hàng" },
];

export default function ShippingPage() {
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [zoneForm, setZoneForm] = useState({
    name: "", slug: "", description: "", type: "vietnam_urban",
  });

  const [methodForm, setMethodForm] = useState({
    zoneId: "", name: "", nameEn: "", nameKo: "", description: "",
    type: "flat_rate", cost: 0, minAmount: "", maxAmount: "", estimatedDays: "",
  });

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shipping-zones");
      const data = await res.json();
      setZones(data.data || []);
    } catch (error) {
      console.error("Failed to fetch zones:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const openZoneForm = (zone?: ShippingZone) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({ name: zone.name, slug: zone.slug, description: zone.description || "", type: zone.type });
    } else {
      setEditingZone(null);
      setZoneForm({ name: "", slug: "", description: "", type: "vietnam_urban" });
    }
    setShowZoneForm(true);
  };

  const closeZoneForm = () => {
    setShowZoneForm(false);
    setEditingZone(null);
    setZoneForm({ name: "", slug: "", description: "", type: "vietnam_urban" });
  };

  const openMethodForm = (zoneId: string, method?: ShippingMethod) => {
    if (method) {
      setEditingMethod(method);
      setMethodForm({
        zoneId: method.zoneId || zoneId, name: method.name, nameEn: method.nameEn || "",
        nameKo: method.nameKo || "", description: method.description || "", type: method.type,
        cost: method.cost, minAmount: method.minAmount?.toString() || "",
        maxAmount: method.maxAmount?.toString() || "", estimatedDays: method.estimatedDays || "",
      });
    } else {
      setEditingMethod(null);
      setMethodForm({
        zoneId, name: "", nameEn: "", nameKo: "", description: "",
        type: "flat_rate", cost: 0, minAmount: "", maxAmount: "", estimatedDays: "",
      });
    }
    setSelectedZoneId(zoneId);
    setShowMethodForm(true);
  };

  const closeMethodForm = () => {
    setShowMethodForm(false);
    setEditingMethod(null);
    setSelectedZoneId("");
    setMethodForm({
      zoneId: "", name: "", nameEn: "", nameKo: "", description: "",
      type: "flat_rate", cost: 0, minAmount: "", maxAmount: "", estimatedDays: "",
    });
  };

  const handleZoneSubmit = async () => {
    if (!zoneForm.name || !zoneForm.slug) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    try {
      const url = editingZone ? `/api/shipping-zones/${editingZone.id}` : "/api/shipping-zones";
      const method = editingZone ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...zoneForm, priority: editingZone?.priority ?? zones.length }),
      });
      if (res.ok) {
        fetchZones();
        closeZoneForm();
        alert(editingZone ? "Cập nhật khu vực thành công!" : "Thêm khu vực thành công!");
      } else {
        const errorData = await res.json();
        alert("Có lỗi xảy ra: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Save zone error:", error);
      alert("Có lỗi xảy ra khi lưu khu vực");
    } finally {
      setSaving(false);
    }
  };

  const handleMethodSubmit = async () => {
    if (!methodForm.name || !methodForm.type) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    try {
      const url = editingMethod ? `/api/shipping-methods/${editingMethod.id}` : "/api/shipping-methods";
      const method = editingMethod ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...methodForm,
          cost: parseFloat(methodForm.cost.toString()) || 0,
          minAmount: methodForm.minAmount ? parseFloat(methodForm.minAmount) : null,
          maxAmount: methodForm.maxAmount ? parseFloat(methodForm.maxAmount) : null,
        }),
      });
      if (res.ok) {
        fetchZones();
        closeMethodForm();
        alert(editingMethod ? "Cập nhật phương thức thành công!" : "Thêm phương thức thành công!");
      } else {
        const errorData = await res.json();
        alert("Có lỗi xảy ra: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Save method error:", error);
      alert("Có lỗi xảy ra khi lưu phương thức");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (id: string, methodCount: number) => {
    const msg = methodCount > 0
      ? `Khu vực này có ${methodCount} phương thức vận chuyển. Xóa khu vực sẽ xóa tất cả. Bạn có chắc?`
      : "Bạn có chắc muốn xóa khu vực này?";
    if (!confirm(msg)) return;
    try {
      const res = await fetch(`/api/shipping-zones/${id}`, { method: "DELETE" });
      if (res.ok) setZones(zones.filter((z) => z.id !== id));
    } catch (error) {
      console.error("Delete zone error:", error);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa phương thức này?")) return;
    try {
      const res = await fetch(`/api/shipping-methods/${id}`, { method: "DELETE" });
      if (res.ok) fetchZones();
    } catch (error) {
      console.error("Delete method error:", error);
    }
  };

  const handleToggleZone = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/shipping-zones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      setZones(zones.map((z) => (z.id === id ? { ...z, isActive } : z)));
    } catch (error) {
      console.error("Toggle zone error:", error);
    }
  };

  const handleToggleMethod = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/shipping-methods/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      fetchZones();
    } catch (error) {
      console.error("Toggle method error:", error);
    }
  };

  const handleMoveZone = async (index: number, direction: "up" | "down") => {
    const newZones = [...zones];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= zones.length) return;
    [newZones[index], newZones[newIndex]] = [newZones[newIndex], newZones[index]];
    const updates = newZones.map((z, i) => ({ ...z, priority: i }));
    setZones(updates);
    try {
      await Promise.all(
        updates.map((z) =>
          fetch(`/api/shipping-zones/${z.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priority: z.priority }),
          })
        )
      );
    } catch (error) {
      console.error("Reorder error:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
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
          <h1 className="text-2xl font-bold">Cài đặt vận chuyển</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý khu vực và phương thức vận chuyển</p>
        </div>
        <button
          onClick={() => openZoneForm()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Thêm khu vực
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Tổng khu vực</p>
            <p className="text-2xl font-bold">{zones.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">{zones.filter((z) => z.isActive).length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Tổng phương thức</p>
            <p className="text-2xl font-bold text-blue-600">
              {zones.reduce((sum, z) => sum + (z._count?.methods || z.methods?.length || 0), 0)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Miễn phí vận chuyển</p>
            <p className="text-2xl font-bold text-purple-600">
              {zones.reduce((sum, z) => sum + z.methods.filter(m => m.type === 'free_shipping').length, 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Zone List */}
      <Card title="Danh sách khu vực vận chuyển">
        <div className="p-4">
          {zones.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Truck size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có khu vực vận chuyển nào</p>
              <button onClick={() => openZoneForm()} className="text-blue-600 hover:underline mt-2">
                Thêm khu vực đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {zones.map((zone, index) => (
                <div
                  key={zone.id}
                  className={`border rounded-lg ${zone.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"}`}
                >
                  {/* Zone Header */}
                  <div className="flex items-center gap-4 p-4 border-b">
                    <div className="text-2xl">{ZONE_TYPES.find(t => t.value === zone.type)?.emoji || "📦"}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${!zone.isActive && "text-gray-400"}`}>{zone.name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400">/{zone.slug}</span>
                        <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                          {ZONE_TYPES.find(t => t.value === zone.type)?.label}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">
                          {zone._count?.methods || zone.methods?.length || 0} phương thức
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${zone.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {zone.isActive ? "Hoạt động" : "Ẩn"}
                        </span>
                      </div>
                      {zone.description && <p className="text-sm text-gray-500 mt-1 truncate">{zone.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleMoveZone(index, "up")} disabled={index === 0}
                        className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30" title="Di chuyển lên">
                        <ChevronUp size={16} />
                      </button>
                      <button onClick={() => handleMoveZone(index, "down")} disabled={index === zones.length - 1}
                        className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30" title="Di chuyển xuống">
                        <ChevronDown size={16} />
                      </button>
                      <button onClick={() => openZoneForm(zone)} className="p-2 hover:bg-gray-100 rounded-lg" title="Chỉnh sửa">
                        <Edit size={16} className="text-gray-400" />
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={zone.isActive} onChange={(e) => handleToggleZone(zone.id, e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <button onClick={() => handleDeleteZone(zone.id, zone._count?.methods || zone.methods?.length || 0)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Methods */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">Phương thức vận chuyển</h4>
                      <button onClick={() => openMethodForm(zone.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        <Plus size={14} />
                        Thêm phương thức
                      </button>
                    </div>
                    {zone.methods.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        <Settings size={24} className="mx-auto mb-2" />
                        <p>Chưa có phương thức vận chuyển</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {zone.methods.map((method) => (
                          <div key={method.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${method.isActive ? "border-gray-100 bg-gray-50" : "border-gray-100 bg-gray-25"}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-medium text-sm ${!method.isActive && "text-gray-400"}`}>{method.name}</span>
                                <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                                  {METHOD_TYPES.find(t => t.value === method.type)?.label}
                                </span>
                                {method.estimatedDays && <span className="text-xs text-gray-500">{method.estimatedDays} ngày</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-medium text-green-600">
                                  {method.cost > 0 ? formatPrice(method.cost) : "Miễn phí"}
                                </span>
                                {method.minAmount && method.minAmount > 0 && (
                                  <span className="text-xs text-gray-500">Miễn phí từ {formatPrice(method.minAmount)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => openMethodForm(zone.id, method)} className="p-1.5 hover:bg-gray-100 rounded" title="Chỉnh sửa">
                                <Edit size={14} className="text-gray-400" />
                              </button>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={method.isActive} onChange={(e) => handleToggleMethod(method.id, e.target.checked)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                              <button onClick={() => handleDeleteMethod(method.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Xóa">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Zone Form Modal */}
      {showZoneForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingZone ? "Chỉnh sửa khu vực" : "Thêm khu vực mới"}</h2>
              <button onClick={closeZoneForm} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khu vực *</label>
                <input type="text" value={zoneForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setZoneForm({ ...zoneForm, name, slug: editingZone ? zoneForm.slug : generateSlug(name) });
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Việt Nam - Nội thành HCM, Hà Nội"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input type="text" value={zoneForm.slug}
                  onChange={(e) => setZoneForm({ ...zoneForm, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="vd: vietnam-urban"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại khu vực *</label>
                <select value={zoneForm.type} onChange={(e) => setZoneForm({ ...zoneForm, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ZONE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.emoji} {type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={zoneForm.description}
                  onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả về khu vực vận chuyển" rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeZoneForm} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={handleZoneSubmit} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingZone ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Method Form Modal */}
      {showMethodForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingMethod ? "Chỉnh sửa phương thức" : "Thêm phương thức mới"}</h2>
              <button onClick={closeMethodForm} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên phương thức *</label>
                  <input type="text" value={methodForm.name}
                    onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Giao hàng tiêu chuẩn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại phương thức *</label>
                  <select value={methodForm.type} onChange={(e) => setMethodForm({ ...methodForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {METHOD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tiếng Anh</label>
                  <input type="text" value={methodForm.nameEn}
                    onChange={(e) => setMethodForm({ ...methodForm, nameEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Standard Shipping"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tiếng Hàn</label>
                  <input type="text" value={methodForm.nameKo}
                    onChange={(e) => setMethodForm({ ...methodForm, nameKo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="표준 배송"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={methodForm.description}
                  onChange={(e) => setMethodForm({ ...methodForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả về phương thức vận chuyển" rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phí vận chuyển (₫)</label>
                  <input type="number" value={methodForm.cost}
                    onChange={(e) => setMethodForm({ ...methodForm, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0" min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miễn phí từ (₫)</label>
                  <input type="number" value={methodForm.minAmount}
                    onChange={(e) => setMethodForm({ ...methodForm, minAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500000" min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian giao</label>
                  <input type="text" value={methodForm.estimatedDays}
                    onChange={(e) => setMethodForm({ ...methodForm, estimatedDays: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeMethodForm} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={handleMethodSubmit} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingMethod ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
