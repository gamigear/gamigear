"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit, Loader2, X, DollarSign, RefreshCw, Star, ArrowRightLeft,
} from "lucide-react";
import Card from "@/components/admin/Card";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  symbolPosition: string;
  exchangeRate: number;
  decimalPlaces: number;
  thousandSep: string;
  decimalSep: string;
  isBase: boolean;
  isActive: boolean;
  position: number;
}

const COMMON_CURRENCIES = [
  { code: "VND", name: "Việt Nam Đồng", symbol: "₫", symbolPosition: "after", decimalPlaces: 0 },
  { code: "USD", name: "US Dollar", symbol: "$", symbolPosition: "before", decimalPlaces: 2 },
  { code: "KRW", name: "Korean Won", symbol: "₩", symbolPosition: "before", decimalPlaces: 0 },
  { code: "EUR", name: "Euro", symbol: "€", symbolPosition: "before", decimalPlaces: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", symbolPosition: "before", decimalPlaces: 0 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", symbolPosition: "before", decimalPlaces: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", symbolPosition: "before", decimalPlaces: 2 },
  { code: "THB", name: "Thai Baht", symbol: "฿", symbolPosition: "before", decimalPlaces: 2 },
];

export default function CurrenciesPage() {
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [editing, setEditing] = useState<Currency | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "", name: "", symbol: "", symbolPosition: "after",
    exchangeRate: 1, decimalPlaces: 0, thousandSep: ".", decimalSep: ",",
  });

  const [converter, setConverter] = useState({
    amount: 1000000, from: "VND", to: "USD", result: null as any,
  });

  useEffect(() => { fetchCurrencies(); }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/currencies");
      const data = await res.json();
      setCurrencies(data.data || []);
    } catch (error) {
      console.error("Failed to fetch currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (currency?: Currency) => {
    if (currency) {
      setEditing(currency);
      setForm({
        code: currency.code, name: currency.name, symbol: currency.symbol,
        symbolPosition: currency.symbolPosition, exchangeRate: currency.exchangeRate,
        decimalPlaces: currency.decimalPlaces, thousandSep: currency.thousandSep,
        decimalSep: currency.decimalSep,
      });
    } else {
      setEditing(null);
      setForm({
        code: "", name: "", symbol: "", symbolPosition: "after",
        exchangeRate: 1, decimalPlaces: 0, thousandSep: ".", decimalSep: ",",
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const selectCommonCurrency = (c: typeof COMMON_CURRENCIES[0]) => {
    setForm({ ...form, code: c.code, name: c.name, symbol: c.symbol, 
      symbolPosition: c.symbolPosition, decimalPlaces: c.decimalPlaces });
  };

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.symbol) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/currencies/${editing.id}` : "/api/currencies";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        fetchCurrencies();
        closeForm();
        alert(editing ? "Cập nhật thành công!" : "Thêm tiền tệ thành công!");
      } else {
        const err = await res.json();
        alert("Lỗi: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, isBase: boolean) => {
    if (isBase) {
      alert("Không thể xóa tiền tệ cơ sở!");
      return;
    }
    if (!confirm("Bạn có chắc muốn xóa tiền tệ này?")) return;
    try {
      const res = await fetch(`/api/currencies/${id}`, { method: "DELETE" });
      if (res.ok) setCurrencies(currencies.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/currencies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      setCurrencies(currencies.map((c) => (c.id === id ? { ...c, isActive } : c)));
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const handleSetBase = async (id: string) => {
    if (!confirm("Đặt tiền tệ này làm tiền tệ cơ sở? Tỉ giá sẽ được tính dựa trên tiền tệ này.")) return;
    try {
      await fetch(`/api/currencies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBase: true, exchangeRate: 1 }),
      });
      fetchCurrencies();
    } catch (error) {
      console.error("Set base error:", error);
    }
  };

  const handleConvert = async () => {
    try {
      const res = await fetch(`/api/currencies/convert?amount=${converter.amount}&from=${converter.from}&to=${converter.to}`);
      const data = await res.json();
      setConverter({ ...converter, result: data });
    } catch (error) {
      console.error("Convert error:", error);
    }
  };

  const formatPreview = (amount: number) => {
    const fixed = amount.toFixed(form.decimalPlaces);
    const [intPart, decPart] = fixed.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, form.thousandSep);
    const formatted = decPart ? `${formattedInt}${form.decimalSep}${decPart}` : formattedInt;
    return form.symbolPosition === "before" ? `${form.symbol}${formatted}` : `${formatted}${form.symbol}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const baseCurrency = currencies.find(c => c.isBase);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tiền tệ</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tiền tệ cơ sở: <span className="font-medium text-blue-600">{baseCurrency?.code || "Chưa thiết lập"}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowConverter(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">
            <ArrowRightLeft size={16} />
            Chuyển đổi
          </button>
          <button onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus size={16} />
            Thêm tiền tệ
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Tổng tiền tệ</p>
            <p className="text-2xl font-bold">{currencies.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">{currencies.filter(c => c.isActive).length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Tiền tệ cơ sở</p>
            <p className="text-2xl font-bold text-blue-600">{baseCurrency?.symbol || "-"} {baseCurrency?.code || "-"}</p>
          </div>
        </Card>
      </div>

      {/* Currency List */}
      <Card title="Danh sách tiền tệ">
        <div className="p-4">
          {currencies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có tiền tệ nào</p>
              <button onClick={() => openForm()} className="text-blue-600 hover:underline mt-2">
                Thêm tiền tệ đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Mã</th>
                    <th className="pb-3 font-medium">Tên</th>
                    <th className="pb-3 font-medium">Ký hiệu</th>
                    <th className="pb-3 font-medium">Tỉ giá (VND)</th>
                    <th className="pb-3 font-medium">Ví dụ</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                    <th className="pb-3 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies.map((currency) => (
                    <tr key={currency.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{currency.code}</span>
                          {currency.isBase && (
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-sm">{currency.name}</td>
                      <td className="py-3 text-lg font-medium">{currency.symbol}</td>
                      <td className="py-3 text-sm">
                        {currency.isBase ? (
                          <span className="text-gray-400">Cơ sở</span>
                        ) : (
                          <span>{currency.exchangeRate.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {currency.symbolPosition === "before" 
                          ? `${currency.symbol}1${currency.thousandSep}000`
                          : `1${currency.thousandSep}000${currency.symbol}`}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded ${currency.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {currency.isActive ? "Hoạt động" : "Ẩn"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {!currency.isBase && (
                            <button onClick={() => handleSetBase(currency.id)}
                              className="p-1.5 hover:bg-yellow-50 rounded" title="Đặt làm cơ sở">
                              <Star size={14} className="text-gray-400" />
                            </button>
                          )}
                          <button onClick={() => openForm(currency)}
                            className="p-1.5 hover:bg-gray-100 rounded" title="Chỉnh sửa">
                            <Edit size={14} className="text-gray-400" />
                          </button>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={currency.isActive}
                              onChange={(e) => handleToggle(currency.id, e.target.checked)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <button onClick={() => handleDelete(currency.id, currency.isBase)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Xóa">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? "Chỉnh sửa tiền tệ" : "Thêm tiền tệ mới"}</h2>
              <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>

            {/* Quick select */}
            {!editing && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn nhanh</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CURRENCIES.map((c) => (
                    <button key={c.code} onClick={() => selectCommonCurrency(c)}
                      className={`px-3 py-1 text-sm rounded-lg border ${form.code === c.code ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"}`}>
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã tiền tệ *</label>
                  <input type="text" value={form.code} maxLength={3}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm uppercase"
                    placeholder="VND"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ký hiệu *</label>
                  <input type="text" value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="₫"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tiền tệ *</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Việt Nam Đồng"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí ký hiệu</label>
                  <select value={form.symbolPosition}
                    onChange={(e) => setForm({ ...form, symbolPosition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="before">Trước số ($ 100)</option>
                    <option value="after">Sau số (100 ₫)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số thập phân</label>
                  <input type="number" value={form.decimalPlaces} min={0} max={4}
                    onChange={(e) => setForm({ ...form, decimalPlaces: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉ giá (1 {form.code || "XXX"} = ? VND)
                </label>
                <input type="number" value={form.exchangeRate} min={0} step="0.01"
                  onChange={(e) => setForm({ ...form, exchangeRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  VD: 1 USD = 25,000 VND thì nhập 25000
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dấu phân cách hàng nghìn</label>
                  <select value={form.thousandSep}
                    onChange={(e) => setForm({ ...form, thousandSep: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value=".">Dấu chấm (.)</option>
                    <option value=",">Dấu phẩy (,)</option>
                    <option value=" ">Khoảng trắng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dấu thập phân</label>
                  <select value={form.decimalSep}
                    onChange={(e) => setForm({ ...form, decimalSep: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value=",">Dấu phẩy (,)</option>
                    <option value=".">Dấu chấm (.)</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Xem trước:</p>
                <p className="text-xl font-bold">{formatPreview(1234567.89)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeForm} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Converter Modal */}
      {showConverter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Chuyển đổi tiền tệ</h2>
              <button onClick={() => setShowConverter(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                <input type="number" value={converter.amount}
                  onChange={(e) => setConverter({ ...converter, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Từ</label>
                  <select value={converter.from}
                    onChange={(e) => setConverter({ ...converter, from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm">
                    {currencies.filter(c => c.isActive).map((c) => (
                      <option key={c.id} value={c.code}>{c.symbol} {c.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sang</label>
                  <select value={converter.to}
                    onChange={(e) => setConverter({ ...converter, to: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm">
                    {currencies.filter(c => c.isActive).map((c) => (
                      <option key={c.id} value={c.code}>{c.symbol} {c.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={handleConvert}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <RefreshCw size={16} />
                Chuyển đổi
              </button>

              {converter.result && (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">{converter.result.from?.formatted}</p>
                  <p className="text-2xl font-bold text-blue-600 my-2">=</p>
                  <p className="text-xl font-bold">{converter.result.to?.formatted}</p>
                  <p className="text-xs text-gray-400 mt-2">Tỉ giá: 1 {converter.from} = {converter.result.rate?.toFixed(4)} {converter.to}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
