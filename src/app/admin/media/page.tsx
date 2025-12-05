"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, Grid, List, Search, Trash2, Image as ImageIcon, File, Loader2, Cloud, HardDrive, RefreshCw } from "lucide-react";
import Card from "@/components/admin/Card";
import { useI18n } from "@/lib/i18n";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  title?: string;
  folder?: string;
  storageProvider?: string;
  createdAt: string;
}

interface StorageConfig {
  r2Configured: boolean;
  defaultProvider: string;
}

export default function MediaLibraryPage() {
  const { t } = useI18n();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [convertToWebp, setConvertToWebp] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [storageConfig, setStorageConfig] = useState<StorageConfig | null>(null);
  const [storageProvider, setStorageProvider] = useState<string>("local");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ new: number; imported?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Fetch storage config and media on mount
  useEffect(() => {
    fetchStorageConfig();
    fetchMedia();
  }, []);

  const fetchStorageConfig = async () => {
    try {
      const response = await fetch("/api/storage/config");
      const data = await response.json();
      setStorageConfig(data);
      setStorageProvider(data.defaultProvider || "local");
    } catch (error) {
      console.error("Failed to fetch storage config:", error);
    }
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/media?per_page=100");
      const data = await response.json();
      setMedia(data.data || []);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(m =>
    m.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "uploads");
        formData.append("convertToWebp", convertToWebp.toString());
        formData.append("storageProvider", storageProvider);

        const response = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          return await response.json();
        } else {
          const error = await response.json();
          console.error("Upload failed:", error);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as MediaItem[];
      
      if (successfulUploads.length > 0) {
        setMedia([...successfulUploads, ...media]);
      }
      
      if (successfulUploads.length < files.length) {
        alert(`${successfulUploads.length}/${files.length} tệp đã được tải lên thành công`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Tải lên thất bại");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await uploadFiles(files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tệp này?")) return;
    
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setMedia(media.filter(m => m.id !== id));
        if (selectedMedia?.id === id) setSelectedMedia(null);
        selectedIds.delete(id);
        setSelectedIds(new Set(selectedIds));
      } else {
        alert("Xóa thất bại");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Xóa thất bại");
    }
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  };

  // Toggle single item selection
  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all visible items
  const selectAll = () => {
    const allIds = new Set(filteredMedia.map(m => m.id));
    setSelectedIds(allIds);
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} tệp đã chọn?`)) return;
    
    setDeleting(true);
    let successCount = 0;
    let failCount = 0;
    
    try {
      const deletePromises = Array.from(selectedIds).map(async (id) => {
        try {
          const response = await fetch(`/api/media/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            successCount++;
            return id;
          } else {
            failCount++;
            return null;
          }
        } catch {
          failCount++;
          return null;
        }
      });
      
      const results = await Promise.all(deletePromises);
      const deletedIds = results.filter(Boolean) as string[];
      
      // Update media list
      setMedia(media.filter(m => !deletedIds.includes(m.id)));
      
      // Clear selection
      setSelectedIds(new Set());
      if (selectedMedia && deletedIds.includes(selectedMedia.id)) {
        setSelectedMedia(null);
      }
      
      // Show result
      if (failCount > 0) {
        alert(`Đã xóa ${successCount} tệp. ${failCount} tệp xóa thất bại.`);
      } else {
        alert(`Đã xóa ${successCount} tệp thành công.`);
      }
      
      // Exit selection mode if all deleted
      if (successCount > 0 && selectedIds.size === successCount) {
        setIsSelectionMode(false);
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Xóa hàng loạt thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const getStorageBadge = (provider?: string) => {
    if (provider === "r2") {
      return (
        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded flex items-center gap-1">
          <Cloud size={10} /> R2
        </span>
      );
    }
    return null;
  };

  const handleSyncR2 = async () => {
    if (!storageConfig?.r2Configured) return;
    
    setSyncing(true);
    setSyncResult(null);
    
    try {
      // First check how many new files
      const checkResponse = await fetch("/api/media/sync-r2");
      const checkData = await checkResponse.json();
      
      if (!checkData.configured) {
        alert("R2 chưa được cấu hình");
        return;
      }
      
      if (checkData.error) {
        alert("Lỗi: " + checkData.error);
        return;
      }
      
      if (!checkData.needsSync) {
        setSyncResult({ new: 0 });
        alert("Không có file mới để sync từ R2");
        return;
      }
      
      const newCount = checkData.r2Files - checkData.dbRecords;
      if (!confirm(`Tìm thấy ${newCount} file mới trong R2. Bạn có muốn import vào Media Library?`)) {
        return;
      }
      
      // Import files
      const syncResponse = await fetch("/api/media/sync-r2", { method: "POST" });
      const syncData = await syncResponse.json();
      
      if (syncData.success) {
        setSyncResult({ new: newCount, imported: syncData.synced });
        alert(`Đã import ${syncData.synced} file từ R2`);
        fetchMedia(); // Refresh media list
      } else {
        alert("Sync thất bại: " + (syncData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Sync thất bại");
    } finally {
      setSyncing(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{t.media.title}</h1>
          {isSelectionMode && selectedIds.size > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Đã chọn {selectedIds.size} tệp
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Storage Provider Selector */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setStorageProvider("local")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                storageProvider === "local"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <HardDrive size={14} />
              Local
            </button>
            <button
              onClick={() => storageConfig?.r2Configured && setStorageProvider("r2")}
              disabled={!storageConfig?.r2Configured}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                storageProvider === "r2"
                  ? "bg-white text-orange-600 shadow-sm"
                  : storageConfig?.r2Configured
                  ? "text-gray-600 hover:text-gray-900"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              title={!storageConfig?.r2Configured ? "R2 chưa được cấu hình" : "Cloudflare R2"}
            >
              <Cloud size={14} />
              R2
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={convertToWebp}
              onChange={(e) => setConvertToWebp(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-600">WebP</span>
          </label>
          
          {/* Selection Mode Controls */}
          {isSelectionMode ? (
            <>
              <button
                onClick={selectAll}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Chọn tất cả
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Bỏ chọn
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0 || deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Xóa ({selectedIds.size})
              </button>
              <button
                onClick={toggleSelectionMode}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleSelectionMode}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200"
              >
                Chọn nhiều
              </button>
              
              {/* Sync R2 Button */}
              {storageConfig?.r2Configured && (
                <button
                  onClick={handleSyncR2}
                  disabled={syncing}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 disabled:opacity-50"
                  title="Sync files từ R2 vào Media Library"
                >
                  <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                  Sync R2
                </button>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <Upload size={18} />
                {t.media.uploadImage}
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      <div 
        className="grid lg:grid-cols-4 gap-6"
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="fixed inset-0 bg-blue-500/20 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <Upload size={64} className="mx-auto mb-4 text-blue-600" />
              <p className="text-xl font-semibold text-gray-800">Thả tệp vào đây để tải lên</p>
              <p className="text-sm text-gray-500 mt-2">
                Lưu vào: {storageProvider === "r2" ? "Cloudflare R2" : "Local Storage"}
              </p>
            </div>
          </div>
        )}

        <div className="lg:col-span-3">
          <Card>
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.media.searchImages}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {uploading && (
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  <span className="text-sm text-blue-600">
                    Đang tải lên {storageProvider === "r2" ? "R2" : "Local"}...
                  </span>
                </div>
              </div>
            )}

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={48} className="mb-4 text-gray-300" />
                  <p className="font-medium">Kéo thả tệp vào đây</p>
                  <p className="text-sm mt-1">hoặc click để chọn tệp</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleItemSelection(item.id);
                        } else {
                          setSelectedMedia(item);
                        }
                      }}
                      className={`group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer border-2 transition-all ${
                        isSelectionMode && selectedIds.has(item.id)
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : selectedMedia?.id === item.id
                          ? "border-blue-500"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      {item.mimeType.startsWith("image/") ? (
                        <Image src={item.url} alt={item.alt || item.filename} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <File size={32} className="text-gray-400" />
                        </div>
                      )}
                      <div className={`absolute inset-0 transition-colors ${
                        isSelectionMode && selectedIds.has(item.id)
                          ? "bg-blue-500/20"
                          : "bg-black/0 group-hover:bg-black/30"
                      }`} />
                      {getStorageBadge(item.storageProvider)}
                      
                      {/* Selection checkbox */}
                      {isSelectionMode && (
                        <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selectedIds.has(item.id)
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white/80 border-gray-400 group-hover:border-blue-400"
                        }`}>
                          {selectedIds.has(item.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                      
                      {/* Delete button - only show when not in selection mode */}
                      {!isSelectionMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      {isSelectionMode && (
                        <th className="pb-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === filteredMedia.length && filteredMedia.length > 0}
                            onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                      )}
                      <th className="pb-3 font-medium">File</th>
                      <th className="pb-3 font-medium">Storage</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Size</th>
                      {!isSelectionMode && <th className="pb-3 font-medium">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedia.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          if (isSelectionMode) {
                            toggleItemSelection(item.id);
                          } else {
                            setSelectedMedia(item);
                          }
                        }}
                        className={`border-b cursor-pointer ${
                          isSelectionMode && selectedIds.has(item.id)
                            ? "bg-blue-50"
                            : selectedMedia?.id === item.id
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {isSelectionMode && (
                          <td className="py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                        )}
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                              {item.mimeType.startsWith("image/") ? (
                                <Image src={item.url} alt={item.alt || ""} fill className="object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <File size={16} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm">{item.originalName}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          {item.storageProvider === "r2" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                              <Cloud size={12} /> R2
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              <HardDrive size={12} /> Local
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-sm text-gray-500">{item.mimeType}</td>
                        <td className="py-3 text-sm text-gray-500">{formatFileSize(item.size)}</td>
                        {!isSelectionMode && (
                          <td className="py-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                              className="p-1 hover:bg-gray-100 rounded text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card title={t.media.title}>
            {selectedMedia ? (
              <div className="p-4 space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                  {selectedMedia.mimeType.startsWith("image/") ? (
                    <Image src={selectedMedia.url} alt={selectedMedia.alt || ""} width={300} height={300} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <File size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.common.name}</label>
                    <p className="text-sm font-medium">{selectedMedia.originalName}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Storage</label>
                    {selectedMedia.storageProvider === "r2" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded">
                        <Cloud size={14} /> Cloudflare R2
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                        <HardDrive size={14} /> Local Storage
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">URL</label>
                    <input
                      type="text"
                      value={selectedMedia.url}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Size</label>
                      <p className="text-sm">{formatFileSize(selectedMedia.size)}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <p className="text-sm">{selectedMedia.mimeType}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t.media.selectImage}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
