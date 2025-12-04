"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Search, Check, Loader2, ImageIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string;
  title: string;
  createdAt: string;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentImage?: string;
}

export default function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  currentImage,
}: MediaPickerProps) {
  const { t } = useI18n();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentImage || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "url">("library");

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedUrl(currentImage || "");
    }
  }, [isOpen, currentImage]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/media?type=image&per_page=50");
      const data = await response.json();
      setMedia(data.data || []);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads");

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newMedia = await response.json();
        setMedia([newMedia, ...media]);
        setSelectedUrl(newMedia.url);
      } else {
        const error = await response.json();
        alert(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = () => {
    if (activeTab === "url" && urlInput) {
      onSelect(urlInput);
    } else if (selectedUrl) {
      onSelect(selectedUrl);
    }
    onClose();
  };

  const filteredMedia = media.filter(
    (item) =>
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{t.media.selectImage}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("library")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "library"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.media.title}
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "url"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.media.urlInput}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "library" ? (
            <div className="h-full flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center gap-4 p-4 border-b">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder={t.media.searchImages}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700">
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Upload size={18} />
                  )}
                  {t.media.uploadImage}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : filteredMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <ImageIcon size={48} className="mb-4 text-gray-300" />
                    <p>{t.media.noImages}</p>
                    <p className="text-sm">{t.media.uploadNew}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {filteredMedia.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedUrl(item.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedUrl === item.url
                            ? "border-blue-600 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={item.url}
                          alt={item.alt}
                          fill
                          className="object-cover"
                        />
                        {selectedUrl === item.url && (
                          <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <label className="block text-sm font-medium mb-2">
                {t.media.imageUrl}
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {urlInput && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">{t.media.preview}</p>
                  <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={urlInput}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSelect}
            disabled={activeTab === "library" ? !selectedUrl : !urlInput}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.media.select}
          </button>
        </div>
      </div>
    </div>
  );
}
