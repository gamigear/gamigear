"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Edit, Trash2, Eye, Loader2, FileText } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  status: string;
  visibility: string;
  author?: {
    id: string;
    displayName: string;
  };
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
}

interface PostsResponse {
  data: Post[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    fetchPosts();
  }, [page, statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      
      const response = await fetch(`/api/posts?${params}`);
      const data: PostsResponse = await response.json();
      
      setPosts(data.data || []);
      setMeta({
        total: data.meta?.total || 0,
        totalPages: data.meta?.totalPages || 1,
      });
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 글을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'publish': return 'Published';
      case 'draft': return 'Draft';
      case 'private': return 'Private';
      case 'pending': return 'Pending';
      case 'trash': return 'Trash';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publish': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'private': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'trash': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const publishedCount = posts.filter((p) => p.status === "publish").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Posts" value={meta.total.toString()} icon={<FileText size={24} className="text-blue-600" />} />
        <StatCard title="Published" value={publishedCount.toString()} />
        <StatCard title="Drafts" value={draftCount.toString()} />
        <StatCard title="Comments" value={posts.reduce((sum, p) => sum + p.commentCount, 0).toString()} />
      </div>

      {/* Posts Table */}
      <Card>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
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
              <option value="all">All Status</option>
              <option value="publish">Published</option>
              <option value="draft">Draft</option>
              <option value="private">Private</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No posts found</p>
            <Link href="/admin/posts/new" className="text-blue-600 hover:underline mt-2 inline-block">
              Create your first post
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
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Author</th>
                  <th className="px-6 py-3 font-medium">Categories</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <Link href={`/admin/posts/${post.id}/edit`} className="font-medium text-sm hover:text-blue-600">
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">/{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {post.author?.displayName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {post.categories.length > 0 
                        ? post.categories.map(c => c.name).join(', ')
                        : <span className="text-gray-400">Uncategorized</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.publishedAt 
                        ? new Date(post.publishedAt).toLocaleDateString('ko-KR')
                        : new Date(post.createdAt).toLocaleDateString('ko-KR')
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link 
                          href={`/blog/${post.slug}`} 
                          target="_blank" 
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="View"
                        >
                          <Eye size={16} className="text-gray-400" />
                        </Link>
                        <Link 
                          href={`/admin/posts/${post.id}/edit`} 
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="Edit"
                        >
                          <Edit size={16} className="text-gray-400" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
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
              Showing {filteredPosts.length} of {meta.total} posts
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
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
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
