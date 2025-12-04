"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Filter, Star, Edit, Trash2, Eye, Loader2, Upload, Download } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";
import ProductImportExport from "@/components/admin/ProductImportExport";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  regularPrice?: number;
  status: string;
  featured: boolean;
  stockQuantity?: number;
  stockStatus?: string;
  averageRating?: number;
  ratingCount?: number;
  images: { src: string; alt: string }[];
  createdAt: string;
}

interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export default function ProductsDashboard() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [showImportExport, setShowImportExport] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        status: statusFilter === 'all' ? '' : statusFilter,
      });
      
      const response = await fetch(`/api/products?${params}`);
      const data: ProductsResponse = await response.json();
      
      setProducts(data.data || []);
      setMeta({
        total: data.meta?.total || 0,
        totalPages: data.meta?.totalPages || 1,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.products.deleteConfirm)) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedCount = products.filter((p) => p.status === "publish").length;
  const draftCount = products.filter((p) => p.status === "draft").length;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'publish': return t.common.published;
      case 'draft': return t.common.draft;
      case 'private': return 'Private';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publish': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'private': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.products.title}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            <Upload size={16} />
            <Download size={16} />
            {t.importExport.import}/{t.importExport.export}
          </button>
          <Link
            href="/admin/products/categories"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            {t.products.categoryManagement}
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            {t.products.addProduct}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t.common.total + ' ' + t.nav.products} value={meta.total.toString()} />
        <StatCard title={t.common.published} value={publishedCount.toString()} />
        <StatCard title={t.common.draft} value={draftCount.toString()} />
        <StatCard title={t.products.featuredProduct} value={products.filter(p => p.featured).length.toString()} />
      </div>

      {/* Products Table */}
      <Card>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.common.search + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.common.all} {t.common.status}</option>
              <option value="publish">{t.common.published}</option>
              <option value="draft">{t.common.draft}</option>
              <option value="private">Private</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              <Filter size={16} />
              {t.common.filter}
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 font-medium">{t.nav.products}</th>
                  <th className="px-6 py-3 font-medium">{t.products.price}</th>
                  <th className="px-6 py-3 font-medium">{t.products.stock}</th>
                  <th className="px-6 py-3 font-medium">{t.products.rating}</th>
                  <th className="px-6 py-3 font-medium">{t.common.status}</th>
                  <th className="px-6 py-3 font-medium">{t.common.date}</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {product.images?.[0]?.src ? (
                            <Image 
                              src={product.images[0].src} 
                              alt={product.name} 
                              fill 
                              className="object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No img
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-sm line-clamp-1">{product.name}</span>
                          {product.featured && (
                            <span className="text-xs text-primary">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 text-sm">
                      {product.stockQuantity !== null && product.stockQuantity !== undefined ? (
                        <span className={product.stockQuantity <= 10 ? 'text-red-600' : ''}>
                          {product.stockQuantity}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.averageRating && product.averageRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm">{product.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({product.ratingCount})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link 
                          href={`/goods/detail/${product.slug}`} 
                          target="_blank" 
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="View"
                        >
                          <Eye size={16} className="text-gray-400" />
                        </Link>
                        <Link 
                          href={`/admin/products/${product.id}/edit`} 
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="Edit"
                        >
                          <Edit size={16} className="text-gray-400" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {filteredProducts.length} {t.common.of} {meta.total} {t.common.items}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {t.common.previous}
            </button>
            {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-sm rounded ${
                  page === p 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {t.common.next}
            </button>
          </div>
        </div>
      </Card>

      {/* Import/Export Modal */}
      {showImportExport && (
        <ProductImportExport
          onClose={() => setShowImportExport(false)}
          onImportComplete={() => {
            fetchProducts();
            setShowImportExport(false);
          }}
        />
      )}
    </div>
  );
}
