"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Settings,
  Eye,
} from "lucide-react";
import Card from "@/components/admin/Card";
import Image from "next/image";

interface WCSite {
  id: string;
  name: string;
  url: string;
  consumerKey: string;
  isActive: boolean;
  lastSyncAt: string | null;
  productCount: number;
  categoryCount: number;
}

interface WCProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ id: number; src: string; alt: string }>;
  sku: string;
  alreadySynced: boolean;
}

interface WCCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
}

export default function ProductSyncPage() {
  const [sites, setSites] = useState<WCSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<WCSite | null>(null);
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [categories, setCategories] = useState<WCCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [showAddSite, setShowAddSite] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });
  const [syncOptions, setSyncOptions] = useState({
    syncImages: true,
    syncCategories: true,
    storageProvider: "auto" as "local" | "r2" | "auto",
    // Currency conversion
    convertPrices: false,
    sourceCurrency: "USD",
    targetCurrency: "KRW",
    exchangeRate: 0, // 0 = auto from database
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [showCategorySync, setShowCategorySync] = useState(false);

  // New site form
  const [newSite, setNewSite] = useState({
    name: "",
    url: "",
    consumerKey: "",
    consumerSecret: "",
  });

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await fetch("/api/woocommerce/sites");
      const data = await response.json();
      // Ensure data is an array
      setSites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sites:", error);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = useCallback(async (siteId: string, page = 1) => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.perPage.toString(),
      });
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);

      const response = await fetch(
        `/api/woocommerce/sites/${siteId}/products?${params}`
      );
      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, [filters.search, filters.category, pagination.perPage]);

  const fetchCategories = async (siteId: string) => {
    try {
      const response = await fetch(
        `/api/woocommerce/sites/${siteId}/categories`
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const selectSite = (site: WCSite) => {
    setSelectedSite(site);
    setSelectedProducts(new Set());
    setSelectedCategories(new Set());
    fetchProducts(site.id);
    fetchCategories(site.id);
  };

  const toggleCategorySelection = (categoryId: number) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const selectAllCategories = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map((c) => c.id)));
    }
  };

  const syncByCategories = async () => {
    if (!selectedSite || selectedCategories.size === 0) return;

    setSyncing(true);
    try {
      const response = await fetch(
        `/api/woocommerce/sites/${selectedSite.id}/sync`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryIds: Array.from(selectedCategories),
            ...syncOptions,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(
          `Sync theo danh mục hoàn tất!\n- Categories: ${data.results.categories.synced}\n- Products: ${data.results.products.synced}\n- Skipped: ${data.results.products.skipped}\n- Images: ${data.results.images.uploaded}`
        );
        fetchProducts(selectedSite.id, pagination.page);
        setSelectedCategories(new Set());
        setShowCategorySync(false);
      } else {
        alert("Sync failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Sync failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setSyncing(false);
    }
  };

  const addSite = async () => {
    try {
      const response = await fetch("/api/woocommerce/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSite),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to add site");
        return;
      }

      await fetchSites();
      setShowAddSite(false);
      setNewSite({ name: "", url: "", consumerKey: "", consumerSecret: "" });
    } catch (error) {
      alert("Failed to add site: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const deleteSite = async (siteId: string) => {
    if (!confirm("Bạn có chắc muốn xóa site này?")) return;

    try {
      await fetch(`/api/woocommerce/sites/${siteId}`, { method: "DELETE" });
      await fetchSites();
      if (selectedSite?.id === siteId) {
        setSelectedSite(null);
        setProducts([]);
      }
    } catch (error) {
      alert("Failed to delete site");
      console.error(error);
    }
  };

  const toggleProductSelection = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAllProducts = () => {
    const unsyncedProducts = products.filter((p) => !p.alreadySynced);
    if (selectedProducts.size === unsyncedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(unsyncedProducts.map((p) => p.id)));
    }
  };

  const syncProducts = async (productIds: number[] = []) => {
    if (!selectedSite) return;

    setSyncing(true);
    try {
      const response = await fetch(
        `/api/woocommerce/sites/${selectedSite.id}/sync`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productIds,
            ...syncOptions,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(
          `Sync hoàn tất!\n- Categories: ${data.results.categories.synced}\n- Products: ${data.results.products.synced}\n- Images: ${data.results.images.uploaded}`
        );
        fetchProducts(selectedSite.id, pagination.page);
        setSelectedProducts(new Set());
      } else {
        alert("Sync failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Sync failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setSyncing(false);
    }
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
        <h1 className="text-2xl font-bold">Sync sản phẩm từ WordPress</h1>
        <button
          onClick={() => setShowAddSite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Thêm site
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sites List */}
        <div className="lg:col-span-1">
          <Card title="Danh sách Sites">
            <div className="divide-y">
              {sites.length === 0 ? (
                <p className="p-4 text-gray-500 text-center">
                  Chưa có site nào
                </p>
              ) : (
                sites.map((site) => (
                  <div
                    key={site.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedSite?.id === site.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => selectSite(site)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{site.name}</h3>
                        <p className="text-xs text-gray-500 truncate">
                          {site.url}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>{site.productCount} sản phẩm</span>
                          {site.lastSyncAt && (
                            <span>
                              • Sync:{" "}
                              {new Date(site.lastSyncAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSite(site.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Products List */}
        <div className="lg:col-span-3">
          {selectedSite ? (
            <Card title={`Sản phẩm từ ${selectedSite.name}`}>
              {/* Sync Options */}
              <div className="p-4 border-b bg-blue-50">
                <div className="flex items-center gap-4 flex-wrap mb-3">
                  <span className="text-sm font-medium">Tùy chọn sync:</span>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncOptions.syncImages}
                      onChange={(e) =>
                        setSyncOptions({
                          ...syncOptions,
                          syncImages: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    Sync ảnh
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncOptions.syncCategories}
                      onChange={(e) =>
                        setSyncOptions({
                          ...syncOptions,
                          syncCategories: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    Sync danh mục
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Lưu ảnh:</span>
                    <select
                      value={syncOptions.storageProvider}
                      onChange={(e) =>
                        setSyncOptions({
                          ...syncOptions,
                          storageProvider: e.target.value as "local" | "r2" | "auto",
                        })
                      }
                      className="px-2 py-1 text-sm border rounded"
                    >
                      <option value="auto">Tự động (R2 nếu có)</option>
                    <option value="local">Local Storage</option>
                    <option value="r2">Cloudflare R2</option>
                  </select>
                </div>
                </div>
                
                {/* Currency Conversion */}
                <div className="flex items-center gap-4 flex-wrap pt-3 border-t border-blue-200">
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncOptions.convertPrices}
                      onChange={(e) =>
                        setSyncOptions({
                          ...syncOptions,
                          convertPrices: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    Chuyển đổi tiền tệ
                  </label>
                  {syncOptions.convertPrices && (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Từ:</span>
                        <select
                          value={syncOptions.sourceCurrency}
                          onChange={(e) =>
                            setSyncOptions({
                              ...syncOptions,
                              sourceCurrency: e.target.value,
                            })
                          }
                          className="px-2 py-1 text-sm border rounded"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="VND">VND (₫)</option>
                          <option value="KRW">KRW (₩)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="CNY">CNY (¥)</option>
                        </select>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Sang:</span>
                        <select
                          value={syncOptions.targetCurrency}
                          onChange={(e) =>
                            setSyncOptions({
                              ...syncOptions,
                              targetCurrency: e.target.value,
                            })
                          }
                          className="px-2 py-1 text-sm border rounded"
                        >
                          <option value="KRW">KRW (₩)</option>
                          <option value="VND">VND (₫)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="CNY">CNY (¥)</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Tỷ giá:</span>
                        <input
                          type="number"
                          value={syncOptions.exchangeRate || ""}
                          onChange={(e) =>
                            setSyncOptions({
                              ...syncOptions,
                              exchangeRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Tự động"
                          className="w-24 px-2 py-1 text-sm border rounded"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Filters */}
              <div className="p-4 border-b flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          fetchProducts(selectedSite.id, 1);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <select
                  value={filters.category}
                  onChange={(e) => {
                    setFilters({ ...filters, category: e.target.value });
                    fetchProducts(selectedSite.id, 1);
                  }}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => fetchProducts(selectedSite.id, 1)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              {/* Actions */}
              <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.size > 0 &&
                        selectedProducts.size ===
                          products.filter((p) => !p.alreadySynced).length
                      }
                      onChange={selectAllProducts}
                      className="rounded"
                    />
                    <span className="text-sm">
                      Chọn tất cả ({selectedProducts.size} đã chọn)
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => syncProducts(Array.from(selectedProducts))}
                    disabled={syncing || selectedProducts.size === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Download size={18} />
                    Sync đã chọn ({selectedProducts.size})
                  </button>
                  <button
                    onClick={() => setShowCategorySync(true)}
                    disabled={syncing || categories.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Settings size={18} />
                    Sync theo danh mục
                  </button>
                  <button
                    onClick={() => syncProducts([])}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {syncing ? (
                      <RefreshCw className="animate-spin" size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                    Sync tất cả
                  </button>
                </div>
              </div>

              {/* Products Table */}
              {loadingProducts ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="animate-spin" size={32} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-10 px-4 py-3"></th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Sản phẩm
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          SKU
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Giá
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Danh mục
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className={`hover:bg-gray-50 ${
                            product.alreadySynced ? "opacity-50" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              disabled={product.alreadySynced}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {product.images[0] && (
                                <Image
                                  src={product.images[0].src}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium line-clamp-1">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {product.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {product.sku || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {product.sale_price ? (
                              <div>
                                <span className="text-red-600">
                                  {product.sale_price}
                                </span>
                                <span className="text-gray-400 line-through ml-1">
                                  {product.regular_price}
                                </span>
                              </div>
                            ) : (
                              product.price || "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {product.categories
                              .map((c) => c.name)
                              .join(", ") || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {product.alreadySynced ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                <CheckCircle size={12} />
                                Đã sync
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                <XCircle size={12} />
                                Chưa sync
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <a
                                href={`${selectedSite.url}/?p=${product.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Xem trên WooCommerce"
                              >
                                <Eye size={16} />
                              </a>
                              {!product.alreadySynced && (
                                <button
                                  onClick={() => syncProducts([product.id])}
                                  disabled={syncing}
                                  className="p-1 text-gray-400 hover:text-green-600"
                                  title="Sync sản phẩm này"
                                >
                                  <Download size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Hiển thị {products.length} / {pagination.total} sản phẩm
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        fetchProducts(selectedSite.id, pagination.page - 1)
                      }
                      disabled={pagination.page <= 1}
                      className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        fetchProducts(selectedSite.id, pagination.page + 1)
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Settings size={48} className="mb-4 opacity-50" />
                <p>Chọn một site để xem danh sách sản phẩm</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Category Sync Modal */}
      {showCategorySync && selectedSite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold mb-4">Sync theo danh mục</h2>
            <p className="text-sm text-gray-500 mb-4">
              Chọn các danh mục bạn muốn sync sản phẩm từ {selectedSite.name}
            </p>
            
            {/* Sync Options */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncOptions.syncImages}
                  onChange={(e) =>
                    setSyncOptions({
                      ...syncOptions,
                      syncImages: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                Sync ảnh sản phẩm
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncOptions.syncCategories}
                  onChange={(e) =>
                    setSyncOptions({
                      ...syncOptions,
                      syncCategories: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                Sync thông tin danh mục
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Lưu ảnh:</span>
                <select
                  value={syncOptions.storageProvider}
                  onChange={(e) =>
                    setSyncOptions({
                      ...syncOptions,
                      storageProvider: e.target.value as "local" | "r2" | "auto",
                    })
                  }
                  className="px-2 py-1 text-sm border rounded"
                >
                  <option value="auto">Tự động</option>
                  <option value="local">Local</option>
                  <option value="r2">R2</option>
                </select>
              </div>
            </div>

            {/* Select All */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.size === categories.length && categories.length > 0}
                  onChange={selectAllCategories}
                  className="rounded"
                />
                <span className="text-sm font-medium">
                  Chọn tất cả ({selectedCategories.size}/{categories.length})
                </span>
              </label>
              <span className="text-sm text-gray-500">
                Tổng: {categories.filter(c => selectedCategories.has(c.id)).reduce((sum, c) => sum + c.count, 0)} sản phẩm
              </span>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedCategories.has(cat.id) ? "bg-purple-50 border border-purple-200" : "border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(cat.id)}
                      onChange={() => toggleCategorySelection(cat.id)}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-gray-500">/{cat.slug}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {cat.count} sản phẩm
                  </span>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setShowCategorySync(false);
                  setSelectedCategories(new Set());
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={syncByCategories}
                disabled={syncing || selectedCategories.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {syncing ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <Download size={18} />
                )}
                Sync {selectedCategories.size} danh mục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Site Modal */}
      {showAddSite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Thêm WooCommerce Site</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên site
                </label>
                <input
                  type="text"
                  value={newSite.name}
                  onChange={(e) =>
                    setNewSite({ ...newSite, name: e.target.value })
                  }
                  placeholder="My WooCommerce Store"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={newSite.url}
                  onChange={(e) =>
                    setNewSite({ ...newSite, url: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Consumer Key
                </label>
                <input
                  type="text"
                  value={newSite.consumerKey}
                  onChange={(e) =>
                    setNewSite({ ...newSite, consumerKey: e.target.value })
                  }
                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Consumer Secret
                </label>
                <input
                  type="password"
                  value={newSite.consumerSecret}
                  onChange={(e) =>
                    setNewSite({ ...newSite, consumerSecret: e.target.value })
                  }
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                />
              </div>
              <p className="text-xs text-gray-500">
                Tạo API keys trong WooCommerce → Settings → Advanced → REST API
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddSite(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={addSite}
                disabled={
                  !newSite.name ||
                  !newSite.url ||
                  !newSite.consumerKey ||
                  !newSite.consumerSecret
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Thêm site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
