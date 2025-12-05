"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Percent,
  DollarSign,
  Tag,
  Trash2,
  CheckCircle,
  AlertCircle,
  Wrench,
} from "lucide-react";
import Card from "@/components/admin/Card";

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  productType: string;
  images: Array<{ src: string }>;
}

interface SaleResult {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
}

export default function BulkSalePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [results, setResults] = useState<SaleResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Form state
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [roundTo, setRoundTo] = useState<number>(1000);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [dateOnSaleFrom, setDateOnSaleFrom] = useState<string>("");
  const [dateOnSaleTo, setDateOnSaleTo] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products?per_page=1000&status=publish"),
      ]);
      
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      
      setCategories(Array.isArray(catData) ? catData : catData.data || []);
      setProducts(prodData.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  // Filter products based on criteria
  // Note: Variable products may have price=0, so we don't filter them by price here
  // The API will handle filtering variations by price
  const filteredProducts = products.filter((p) => {
    // Skip price filter for variable products (price is in variations)
    if (p.productType === "variable") return true;
    if (minPrice > 0 && p.price < minPrice) return false;
    if (maxPrice > 0 && p.price > maxPrice) return false;
    return true;
  });

  const applySale = async () => {
    if (selectedProducts.size === 0 && selectedCategories.size === 0) {
      alert("Vui lòng chọn sản phẩm hoặc danh mục để áp dụng giảm giá");
      return;
    }

    if (discountValue <= 0) {
      alert("Vui lòng nhập giá trị giảm giá hợp lệ");
      return;
    }

    if (discountType === "percentage" && discountValue > 100) {
      alert("Phần trăm giảm giá không được vượt quá 100%");
      return;
    }

    setApplying(true);
    try {
      const response = await fetch("/api/products/bulk-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          categoryIds: Array.from(selectedCategories),
          discountType,
          discountValue,
          roundTo,
          minPrice,
          maxPrice,
          dateOnSaleFrom: dateOnSaleFrom || null,
          dateOnSaleTo: dateOnSaleTo || null,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results.products || []);
        setShowResults(true);
        const variationsMsg = data.results.variationsUpdated > 0 
          ? `\nBiến thể đã cập nhật: ${data.results.variationsUpdated}` 
          : "";
        alert(`Đã áp dụng giảm giá cho ${data.results.updated} sản phẩm!${variationsMsg}\nBỏ qua: ${data.results.skipped} sản phẩm`);
        fetchData();
        setSelectedProducts(new Set());
        setSelectedCategories(new Set());
      } else {
        alert("Lỗi: " + (data.error || "Không thể áp dụng giảm giá"));
      }
    } catch (error) {
      console.error("Apply sale error:", error);
      alert("Lỗi: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setApplying(false);
    }
  };

  const removeSale = async () => {
    if (selectedProducts.size === 0 && selectedCategories.size === 0) {
      alert("Vui lòng chọn sản phẩm hoặc danh mục để xóa giảm giá");
      return;
    }

    if (!confirm("Bạn có chắc muốn xóa giá khuyến mãi của các sản phẩm đã chọn?")) return;

    setApplying(true);
    try {
      const response = await fetch("/api/products/bulk-sale", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          categoryIds: Array.from(selectedCategories),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const variationsMsg = data.variationsUpdated > 0 
          ? `\nBiến thể đã xóa KM: ${data.variationsUpdated}` 
          : "";
        alert(`Đã xóa giá khuyến mãi của ${data.updated} sản phẩm!${variationsMsg}`);
        fetchData();
        setSelectedProducts(new Set());
        setSelectedCategories(new Set());
      } else {
        alert("Lỗi: " + (data.error || "Không thể xóa giá khuyến mãi"));
      }
    } catch (error) {
      console.error("Remove sale error:", error);
      alert("Lỗi: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setApplying(false);
    }
  };

  // Fix invalid sale prices (sale price >= regular price)
  const fixInvalidSales = async () => {
    if (!confirm("Tìm và ẩn các sản phẩm có giá KM >= giá gốc?\n(Áp dụng cho tất cả sản phẩm hoặc sản phẩm/danh mục đã chọn)")) return;

    setApplying(true);
    try {
      const response = await fetch("/api/products/bulk-sale", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          categoryIds: Array.from(selectedCategories),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.productsFixed === 0 && data.variationsFixed === 0) {
          alert("Không tìm thấy sản phẩm nào cần sửa!");
        } else {
          const variationsMsg = data.variationsFixed > 0 
            ? `\nBiến thể đã sửa: ${data.variationsFixed}` 
            : "";
          alert(`Đã sửa ${data.productsFixed} sản phẩm có giá KM không hợp lệ!${variationsMsg}`);
        }
        fetchData();
      } else {
        alert("Lỗi: " + (data.error || "Không thể sửa giá khuyến mãi"));
      }
    } catch (error) {
      console.error("Fix sale error:", error);
      alert("Lỗi: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setApplying(false);
    }
  };

  // Calculate preview
  const previewDiscount = (price: number) => {
    let salePrice: number;
    if (discountType === "percentage") {
      salePrice = price * (1 - discountValue / 100);
    } else {
      salePrice = price - discountValue;
    }
    if (roundTo > 0) {
      salePrice = Math.round(salePrice / roundTo) * roundTo;
    }
    return Math.max(0, salePrice);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Giảm giá hàng loạt</h1>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="Cài đặt giảm giá">
            <div className="p-4 space-y-4">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Loại giảm giá</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDiscountType("percentage")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                      discountType === "percentage"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Percent size={18} />
                    Phần trăm
                  </button>
                  <button
                    onClick={() => setDiscountType("fixed")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                      discountType === "fixed"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <DollarSign size={18} />
                    Cố định
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Giá trị giảm {discountType === "percentage" ? "(%)" : "(₩)"}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Round To */}
              <div>
                <label className="block text-sm font-medium mb-2">Làm tròn đến</label>
                <select
                  value={roundTo}
                  onChange={(e) => setRoundTo(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value={0}>Không làm tròn</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={5000}>5,000</option>
                  <option value={10000}>10,000</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Giá từ</label>
                  <input
                    type="number"
                    value={minPrice || ""}
                    onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Giá đến</label>
                  <input
                    type="number"
                    value={maxPrice || ""}
                    onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Không giới hạn"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Sale Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Bắt đầu</label>
                  <input
                    type="date"
                    value={dateOnSaleFrom}
                    onChange={(e) => setDateOnSaleFrom(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kết thúc</label>
                  <input
                    type="date"
                    value={dateOnSaleTo}
                    onChange={(e) => setDateOnSaleTo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Categories Filter */}
          <Card title="Lọc theo danh mục">
            <div className="p-4 max-h-64 overflow-y-auto space-y-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="rounded"
                  />
                  <span className="flex-1">{cat.name}</span>
                  <span className="text-xs text-gray-500">({cat.count})</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={applySale}
              disabled={applying || (selectedProducts.size === 0 && selectedCategories.size === 0)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {applying ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <Tag size={18} />
              )}
              Áp dụng giảm giá
            </button>
            <button
              onClick={removeSale}
              disabled={applying || (selectedProducts.size === 0 && selectedCategories.size === 0)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              title="Xóa giá khuyến mãi"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Fix Invalid Sales */}
          <button
            onClick={fixInvalidSales}
            disabled={applying}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            title="Ẩn giá KM khi giá KM >= giá gốc"
          >
            {applying ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <Wrench size={18} />
            )}
            Sửa giá KM lỗi (KM ≥ Gốc)
          </button>
        </div>

        {/* Products List */}
        <div className="lg:col-span-2">
          <Card title={`Sản phẩm (${filteredProducts.length})`}>
            {/* Select All */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                  onChange={selectAllProducts}
                  className="rounded"
                />
                <span className="text-sm">
                  Chọn tất cả ({selectedProducts.size} đã chọn)
                </span>
              </label>
              <div className="text-sm text-gray-500">
                {discountType === "percentage" ? `Giảm ${discountValue}%` : `Giảm ${discountValue.toLocaleString()}₩`}
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="w-10 px-4 py-3"></th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Giá gốc</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Giá KM</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((product) => {
                    const isVariable = product.productType === "variable";
                    const originalPrice = product.regularPrice || product.price;
                    const previewPrice = previewDiscount(originalPrice);
                    const discountPercent = originalPrice > 0 ? Math.round((1 - previewPrice / originalPrice) * 100) : 0;
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleProduct(product.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            {isVariable && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs whitespace-nowrap">
                                Biến thể
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isVariable && originalPrice === 0 ? (
                            <span className="text-gray-500 text-sm">Nhiều giá</span>
                          ) : (
                            <span className={product.onSale ? "text-gray-400 line-through" : ""}>
                              {originalPrice.toLocaleString()}₩
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {selectedProducts.has(product.id) ? (
                            isVariable && originalPrice === 0 ? (
                              <span className="text-blue-600 text-sm">Áp dụng cho biến thể</span>
                            ) : (
                              <div>
                                <span className="text-red-600 font-medium">
                                  {previewPrice.toLocaleString()}₩
                                </span>
                                <span className="text-xs text-green-600 ml-1">
                                  -{discountPercent}%
                                </span>
                              </div>
                            )
                          ) : product.onSale && product.salePrice ? (
                            <span className="text-red-600">
                              {product.salePrice.toLocaleString()}₩
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {product.onSale ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                              <CheckCircle size={12} />
                              Đang KM
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              <AlertCircle size={12} />
                              Bình thường
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && results.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold mb-4">Kết quả áp dụng giảm giá</h2>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">Sản phẩm</th>
                    <th className="px-4 py-2 text-right text-sm">Giá gốc</th>
                    <th className="px-4 py-2 text-right text-sm">Giá KM</th>
                    <th className="px-4 py-2 text-center text-sm">Giảm</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2 text-sm">{r.name}</td>
                      <td className="px-4 py-2 text-right text-sm text-gray-500">
                        {r.originalPrice.toLocaleString()}₩
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-red-600 font-medium">
                        {r.salePrice.toLocaleString()}₩
                      </td>
                      <td className="px-4 py-2 text-center text-sm text-green-600">
                        -{r.discount}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
