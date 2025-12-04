"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Edit,
  FolderTree,
  Tags,
  Trash2,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Card from "@/components/admin/Card";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  status: string;
  featured: boolean;
  description: string | null;
  shortDescription: string | null;
  images: Array<{ src: string }>;
  categories: Category[];
  tags: Tag[];
}

type ActionType = "content" | "categories" | "tags";

export default function BulkEditPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ActionType>("content");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, perPage: 50, total: 0, totalPages: 1 });

  // Content edit state
  const [contentEdit, setContentEdit] = useState({
    status: "",
    featured: "",
    description: "",
    shortDescription: "",
  });

  // Category edit state
  const [categoryEdit, setCategoryEdit] = useState({
    action: "add" as "replace" | "add" | "remove",
    categoryIds: new Set<string>(),
  });

  // Tag edit state
  const [tagEdit, setTagEdit] = useState({
    action: "add" as "replace" | "add" | "remove",
    tagIds: new Set<string>(),
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, search]);

  const fetchData = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/tags"),
      ]);
      const catData = await catRes.json();
      const tagData = await tagRes.json();
      setCategories(Array.isArray(catData) ? catData : catData.data || []);
      setTags(Array.isArray(tagData) ? tagData : tagData.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        per_page: pagination.perPage.toString(),
        status: "all",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: data.meta?.total || 0,
        totalPages: data.meta?.totalPages || 1,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
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
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newIds = new Set(categoryEdit.categoryIds);
    if (newIds.has(categoryId)) {
      newIds.delete(categoryId);
    } else {
      newIds.add(categoryId);
    }
    setCategoryEdit({ ...categoryEdit, categoryIds: newIds });
  };

  const toggleTag = (tagId: string) => {
    const newIds = new Set(tagEdit.tagIds);
    if (newIds.has(tagId)) {
      newIds.delete(tagId);
    } else {
      newIds.add(tagId);
    }
    setTagEdit({ ...tagEdit, tagIds: newIds });
  };

  const applyChanges = async () => {
    if (selectedProducts.size === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    setApplying(true);
    try {
      let requestBody: Record<string, unknown> = {
        productIds: Array.from(selectedProducts),
      };

      if (activeTab === "content") {
        requestBody.action = "update_content";
        if (contentEdit.status) requestBody.status = contentEdit.status;
        if (contentEdit.featured) requestBody.featured = contentEdit.featured === "true";
        if (contentEdit.description) requestBody.description = contentEdit.description;
        if (contentEdit.shortDescription) requestBody.shortDescription = contentEdit.shortDescription;
      } else if (activeTab === "categories") {
        requestBody.action = "update_categories";
        requestBody.categoryAction = categoryEdit.action;
        requestBody.categoryIds = Array.from(categoryEdit.categoryIds);
      } else if (activeTab === "tags") {
        requestBody.action = "update_tags";
        requestBody.tagAction = tagEdit.action;
        requestBody.tagIds = Array.from(tagEdit.tagIds);
      }

      const response = await fetch("/api/products/bulk-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Đã cập nhật ${data.updated} sản phẩm!`);
        fetchProducts();
        setSelectedProducts(new Set());
        // Reset form
        if (activeTab === "content") {
          setContentEdit({ status: "", featured: "", description: "", shortDescription: "" });
        } else if (activeTab === "categories") {
          setCategoryEdit({ action: "add", categoryIds: new Set() });
        } else if (activeTab === "tags") {
          setTagEdit({ action: "add", tagIds: new Set() });
        }
      } else {
        alert("Lỗi: " + (data.error || "Không thể cập nhật"));
      }
    } catch (error) {
      alert("Lỗi: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setApplying(false);
    }
  };

  const deleteProducts = async () => {
    if (selectedProducts.size === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa ${selectedProducts.size} sản phẩm?`)) return;

    setApplying(true);
    try {
      const response = await fetch("/api/products/bulk-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          action: "delete",
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Đã xóa ${data.updated} sản phẩm!`);
        fetchProducts();
        setSelectedProducts(new Set());
      } else {
        alert("Lỗi: " + (data.error || "Không thể xóa"));
      }
    } catch (error) {
      alert("Lỗi: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chỉnh sửa hàng loạt</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={deleteProducts}
            disabled={applying || selectedProducts.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={18} />
            Xóa ({selectedProducts.size})
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Edit Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tabs */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm ${
                activeTab === "content" ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <Edit size={16} />
              Nội dung
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm ${
                activeTab === "categories" ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <FolderTree size={16} />
              Danh mục
            </button>
            <button
              onClick={() => setActiveTab("tags")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm ${
                activeTab === "tags" ? "bg-blue-600 text-white" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <Tags size={16} />
              Tags
            </button>
          </div>

          {/* Content Edit */}
          {activeTab === "content" && (
            <Card title="Chỉnh sửa nội dung">
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Trạng thái</label>
                  <select
                    value={contentEdit.status}
                    onChange={(e) => setContentEdit({ ...contentEdit, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">-- Không thay đổi --</option>
                    <option value="publish">Xuất bản</option>
                    <option value="draft">Nháp</option>
                    <option value="private">Riêng tư</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nổi bật</label>
                  <select
                    value={contentEdit.featured}
                    onChange={(e) => setContentEdit({ ...contentEdit, featured: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">-- Không thay đổi --</option>
                    <option value="true">Có</option>
                    <option value="false">Không</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mô tả ngắn</label>
                  <textarea
                    value={contentEdit.shortDescription}
                    onChange={(e) => setContentEdit({ ...contentEdit, shortDescription: e.target.value })}
                    placeholder="Để trống nếu không thay đổi"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Category Edit */}
          {activeTab === "categories" && (
            <Card title="Chỉnh sửa danh mục">
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hành động</label>
                  <select
                    value={categoryEdit.action}
                    onChange={(e) => setCategoryEdit({ ...categoryEdit, action: e.target.value as "replace" | "add" | "remove" })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="add">Thêm danh mục</option>
                    <option value="replace">Thay thế tất cả</option>
                    <option value="remove">Xóa danh mục</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chọn danh mục ({categoryEdit.categoryIds.size})
                  </label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={categoryEdit.categoryIds.has(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="rounded"
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tag Edit */}
          {activeTab === "tags" && (
            <Card title="Chỉnh sửa tags">
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hành động</label>
                  <select
                    value={tagEdit.action}
                    onChange={(e) => setTagEdit({ ...tagEdit, action: e.target.value as "replace" | "add" | "remove" })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="add">Thêm tags</option>
                    <option value="replace">Thay thế tất cả</option>
                    <option value="remove">Xóa tags</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chọn tags ({tagEdit.tagIds.size})
                  </label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={tagEdit.tagIds.has(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                          className="rounded"
                        />
                        <span>{tag.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Apply Button */}
          <button
            onClick={applyChanges}
            disabled={applying || selectedProducts.size === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {applying ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            Áp dụng cho {selectedProducts.size} sản phẩm
          </button>
        </div>

        {/* Products List */}
        <div className="lg:col-span-2">
          <Card title={`Sản phẩm (${pagination.total})`}>
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Select All */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === products.length && products.length > 0}
                  onChange={selectAllProducts}
                  className="rounded"
                />
                <span className="text-sm">Chọn tất cả ({selectedProducts.size} đã chọn)</span>
              </label>
              <button
                onClick={fetchProducts}
                className="p-2 hover:bg-gray-200 rounded"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {/* Products Table */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin" size={32} />
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="w-10 px-4 py-3"></th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Sản phẩm</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Danh mục</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Tags</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
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
                              <p className="font-medium line-clamp-1">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.price.toLocaleString()}₩</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {product.categories.slice(0, 2).map((cat) => (
                              <span key={cat.id} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {cat.name}
                              </span>
                            ))}
                            {product.categories.length > 2 && (
                              <span className="text-xs text-gray-500">+{product.categories.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag) => (
                              <span key={tag.id} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {tag.name}
                              </span>
                            ))}
                            {product.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{product.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            product.status === "publish" ? "bg-green-100 text-green-700" :
                            product.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {product.status === "publish" ? "Xuất bản" :
                             product.status === "draft" ? "Nháp" : product.status}
                          </span>
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
                  Trang {pagination.page} / {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
