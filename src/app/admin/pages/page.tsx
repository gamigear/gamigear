"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, Loader2, FileText } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  status: string;
  visibility: string;
  template: string;
  menuOrder: number;
  author?: {
    id: string;
    displayName: string;
  };
  parent?: {
    id: string;
    title: string;
  };
  children: { id: string; title: string }[];
  publishedAt?: string;
  createdAt: string;
}

interface PagesResponse {
  data: PageItem[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export default function PagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    fetchPages();
  }, [page, statusFilter]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '50',
      });
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      
      const response = await fetch(`/api/pages?${params}`);
      const data: PagesResponse = await response.json();
      
      setPages(data.data || []);
      setMeta({
        total: data.meta?.total || 0,
        totalPages: data.meta?.totalPages || 1,
      });
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa trang này?')) return;
    
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchPages();
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const filteredPages = pages.filter((pg) =>
    pg.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'publish': return 'Đã xuất bản';
      case 'draft': return 'Bản nháp';
      case 'private': return 'Riêng tư';
      case 'pending': return 'Chờ duyệt';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publish': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'private': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const publishedCount = pages.filter((p) => p.status === "publish").length;
  const draftCount = pages.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý trang</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/pages/homepage"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Chỉnh sửa trang chủ
          </Link>
          <Link
            href="/admin/pages/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Trang mới
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng số trang" value={meta.total.toString()} icon={<FileText size={24} className="text-blue-600" />} />
        <StatCard title="Đã xuất bản" value={publishedCount.toString()} />
        <StatCard title="Bản nháp" value={draftCount.toString()} />
        <StatCard title="Mẫu giao diện" value={new Set(pages.map(p => p.template)).size.toString()} />
      </div>

      {/* Pages Table */}
      <Card>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm trang..."
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
              <option value="all">Tất cả trạng thái</option>
              <option value="publish">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="private">Riêng tư</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Không có trang nào</p>
            <Link href="/admin/pages/new" className="text-blue-600 hover:underline mt-2 inline-block">
              Tạo trang đầu tiên
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 font-medium">Tiêu đề</th>
                  <th className="px-6 py-3 font-medium">Tác giả</th>
                  <th className="px-6 py-3 font-medium">Mẫu</th>
                  <th className="px-6 py-3 font-medium">Trạng thái</th>
                  <th className="px-6 py-3 font-medium">Ngày</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((pg) => (
                  <tr key={pg.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <Link href={`/admin/pages/${pg.id}/edit`} className="font-medium text-sm hover:text-blue-600">
                          {pg.parent && <span className="text-gray-400">— </span>}
                          {pg.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">/{pg.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {pg.author?.displayName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">
                      {pg.template.replace('-', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pg.status)}`}>
                        {getStatusLabel(pg.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {pg.publishedAt 
                        ? new Date(pg.publishedAt).toLocaleDateString('ko-KR')
                        : new Date(pg.createdAt).toLocaleDateString('ko-KR')
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link 
                          href={`/${pg.slug}`} 
                          target="_blank" 
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="View"
                        >
                          <Eye size={16} className="text-gray-400" />
                        </Link>
                        <Link 
                          href={`/admin/pages/${pg.id}/edit`} 
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="Edit"
                        >
                          <Edit size={16} className="text-gray-400" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(pg.id)}
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
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Hiển thị {filteredPages.length} / {meta.total} trang
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
