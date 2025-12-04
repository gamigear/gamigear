"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Trash2, Loader2, Tag } from "lucide-react";
import Card from "@/components/admin/Card";
import { useI18n } from "@/lib/i18n";
import { generateSlug } from "@/lib/utils";

interface PostTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number;
  createdAt: string;
}

export default function PostTagsPage() {
  const { t } = useI18n();
  const [tags, setTags] = useState<PostTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/post-tags");
      const data = await response.json();
      setTags(data.data || []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && !editingId) {
      const slug = generateSlug(value);
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const url = editingId ? `/api/post-tags/${editingId}` : "/api/post-tags";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchTags();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save tag");
      }
    } catch (error) {
      console.error("Failed to save tag:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tag: PostTag) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      const response = await fetch(`/api/post-tags/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTags();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete tag");
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", slug: "", description: "" });
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.posts.title} - Tags</h1>
        <Link
          href="/admin/posts"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          {t.common.back}
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add/Edit Form */}
        <Card title={editingId ? t.common.edit : t.common.create}>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.common.name} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? t.common.saving
                  : editingId
                    ? t.common.save
                    : t.common.create}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {t.common.cancel}
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Tags List */}
        <Card title="Tags" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">{t.common.name}</th>
                  <th className="px-6 py-3 font-medium">Slug</th>
                  <th className="px-6 py-3 font-medium">{t.nav.posts}</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {tags.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {t.common.noData}
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr
                      key={tag.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-gray-400" />
                          <span className="font-medium text-sm">{tag.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {tag.slug}
                      </td>
                      <td className="px-6 py-4 text-sm">{tag.count}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(tag)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title={t.common.edit}
                          >
                            <Edit size={16} className="text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title={t.common.delete}
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
