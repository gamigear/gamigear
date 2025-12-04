"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileJson,
  Link2,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  message: string;
}

interface ProductImportExportProps {
  onClose: () => void;
  onImportComplete?: () => void;
}

type ImportSource = "file" | "googlesheet" | "shopeeLink" | "shopee" | "lazada";
type ExportFormat = "xlsx" | "csv" | "json";

interface ShopeePreview {
  name: string;
  price: number;
  regularPrice: number;
  images: { src: string; alt: string }[];
  stockQuantity: number;
  description: string;
}

export default function ProductImportExport({
  onClose,
  onImportComplete,
}: ProductImportExportProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  const [importSource, setImportSource] = useState<ImportSource>("file");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("xlsx");
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [shopeePreview, setShopeePreview] = useState<ShopeePreview | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (importSource === "googlesheet" && !googleSheetUrl) {
      alert(t.importExport.enterGoogleSheetUrl);
      return;
    }
    if (importSource === "shopeeLink" && !shopeeUrl) {
      alert(t.importExport.enterShopeeUrl);
      return;
    }
    if ((importSource === "file" || importSource === "shopee" || importSource === "lazada") && !selectedFile) {
      alert(t.importExport.selectFile);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Handle Shopee link import separately
      if (importSource === "shopeeLink") {
        const response = await fetch("/api/products/scrape-shopee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: shopeeUrl, saveToDb: true }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setResult({
            success: 1,
            failed: 0,
            errors: [],
            message: t.importExport.shopeeImportSuccess,
          });
          if (onImportComplete) {
            onImportComplete();
          }
        } else {
          setResult({
            success: 0,
            failed: 1,
            errors: [data.error || "Import failed"],
            message: data.error || "Import failed",
          });
        }
        return;
      }

      const formData = new FormData();
      formData.append("source", importSource);

      if (importSource === "googlesheet") {
        formData.append("googleSheetUrl", googleSheetUrl);
      } else if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.success > 0 && onImportComplete) {
          onImportComplete();
        }
      } else {
        setResult({
          success: 0,
          failed: 0,
          errors: [data.error || "Import failed"],
          message: data.error || "Import failed",
        });
      }
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 0,
        errors: [error.message],
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewShopee = async () => {
    if (!shopeeUrl) {
      alert(t.importExport.enterShopeeUrl);
      return;
    }

    setLoading(true);
    setShopeePreview(null);

    try {
      const response = await fetch("/api/products/scrape-shopee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: shopeeUrl, saveToDb: false }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShopeePreview(data.product);
      } else {
        alert(data.error || "Failed to fetch product");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/export?format=${exportFormat}`);
      
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-${Date.now()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products/export?format=xlsx", {
        method: "POST",
      });
      
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product-template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const importSources = [
    { id: "file" as ImportSource, icon: FileSpreadsheet, label: t.importExport.fromFile },
    { id: "googlesheet" as ImportSource, icon: Link2, label: "Google Sheet" },
    { id: "shopeeLink" as ImportSource, icon: Link2, label: t.importExport.shopeeLink },
    { id: "shopee" as ImportSource, icon: ShoppingBag, label: t.importExport.shopeeFile },
    { id: "lazada" as ImportSource, icon: ShoppingBag, label: "Lazada" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">{t.importExport.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("import")}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "import"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Upload size={16} className="inline mr-2" />
            {t.importExport.import}
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "export"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Download size={16} className="inline mr-2" />
            {t.importExport.export}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "import" ? (
            <div className="space-y-6">
              {/* Import Source Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  {t.importExport.selectSource}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {importSources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => {
                        setImportSource(source.id);
                        setResult(null);
                      }}
                      className={`flex items-center gap-3 p-4 border rounded-lg text-left transition ${
                        importSource === source.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <source.icon
                        size={24}
                        className={importSource === source.id ? "text-blue-600" : "text-gray-400"}
                      />
                      <span className="text-sm font-medium">{source.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              {(importSource === "file" || importSource === "shopee" || importSource === "lazada") && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.importExport.uploadFile}
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,.json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileSpreadsheet size={24} className="text-green-600" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">{t.importExport.dragOrClick}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {t.importExport.supportedFormats}: XLSX, XLS, CSV, JSON
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    {t.importExport.downloadTemplate}
                  </button>
                </div>
              )}

              {/* Google Sheet URL */}
              {importSource === "googlesheet" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Google Sheet URL
                  </label>
                  <input
                    type="url"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t.importExport.googleSheetNote}
                  </p>
                </div>
              )}

              {/* Shopee Link */}
              {importSource === "shopeeLink" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.importExport.shopeeProductUrl}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={shopeeUrl}
                        onChange={(e) => {
                          setShopeeUrl(e.target.value);
                          setShopeePreview(null);
                        }}
                        placeholder="https://shopee.vn/product-name-i.123456.789012"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handlePreviewShopee}
                        disabled={loading || !shopeeUrl}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : t.common.preview}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {t.importExport.shopeeUrlNote}
                    </p>
                  </div>

                  {/* Shopee Preview */}
                  {shopeePreview && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-sm mb-3">{t.common.preview}:</h4>
                      <div className="flex gap-4">
                        {shopeePreview.images?.[0] && (
                          <img
                            src={shopeePreview.images[0].src}
                            alt={shopeePreview.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">{shopeePreview.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-red-600">
                              {shopeePreview.price?.toLocaleString()}₫
                            </span>
                            {shopeePreview.regularPrice > shopeePreview.price && (
                              <span className="text-sm text-gray-400 line-through">
                                {shopeePreview.regularPrice?.toLocaleString()}₫
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {t.products.stock}: {shopeePreview.stockQuantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Note about Shopee blocking */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      <strong>Lưu ý:</strong> Shopee có thể chặn việc lấy thông tin tự động. Nếu không thành công, vui lòng sử dụng chức năng &quot;Shopee File&quot; để import từ file Excel xuất từ Shopee Seller Center.
                    </p>
                  </div>
                </div>
              )}

              {/* Shopee/Lazada Instructions */}
              {(importSource === "shopee" || importSource === "lazada") && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>{t.importExport.howToExport}:</strong>
                  </p>
                  <ol className="text-sm text-yellow-700 mt-2 list-decimal list-inside space-y-1">
                    {importSource === "shopee" ? (
                      <>
                        <li>{t.importExport.shopeeStep1}</li>
                        <li>{t.importExport.shopeeStep2}</li>
                        <li>{t.importExport.shopeeStep3}</li>
                      </>
                    ) : (
                      <>
                        <li>{t.importExport.lazadaStep1}</li>
                        <li>{t.importExport.lazadaStep2}</li>
                        <li>{t.importExport.lazadaStep3}</li>
                      </>
                    )}
                  </ol>
                </div>
              )}

              {/* Import Result */}
              {result && (
                <div
                  className={`p-4 rounded-lg ${
                    result.success > 0 ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success > 0 ? (
                      <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    )}
                    <div>
                      <p className={`font-medium ${result.success > 0 ? "text-green-800" : "text-red-800"}`}>
                        {result.message}
                      </p>
                      {result.errors.length > 0 && (
                        <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                          {result.errors.slice(0, 5).map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                          {result.errors.length > 5 && (
                            <li>...{t.importExport.andMore.replace("{count}", String(result.errors.length - 5))}</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  {t.importExport.selectFormat}
                </label>
                <div className="flex gap-3">
                  {[
                    { id: "xlsx" as ExportFormat, icon: FileSpreadsheet, label: "Excel (XLSX)" },
                    { id: "csv" as ExportFormat, icon: FileSpreadsheet, label: "CSV" },
                    { id: "json" as ExportFormat, icon: FileJson, label: "JSON" },
                  ].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id)}
                      className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition ${
                        exportFormat === format.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <format.icon
                        size={20}
                        className={exportFormat === format.id ? "text-blue-600" : "text-gray-400"}
                      />
                      <span className="text-sm font-medium">{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t.importExport.exportInfo}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-100"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={activeTab === "import" ? handleImport : handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t.common.loading}
              </>
            ) : activeTab === "import" ? (
              <>
                <Upload size={16} />
                {t.importExport.startImport}
              </>
            ) : (
              <>
                <Download size={16} />
                {t.importExport.startExport}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
