"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  faqCount: number;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  categoryId: string | null;
  category: FaqCategory | null;
  helpful: number;
  notHelpful: number;
}

export default function FaqPage() {
  const { t } = useI18n();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ active: "true" });
      if (selectedCategory) params.append("category", selectedCategory);

      const [faqsRes, categoriesRes] = await Promise.all([
        fetch(`/api/faqs?${params}`),
        fetch("/api/faq-categories?active=true"),
      ]);

      const faqsData = await faqsRes.json();
      const categoriesData = await categoriesRes.json();

      setFaqs(faqsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleVote = async (id: string, action: "helpful" | "not_helpful") => {
    if (votedIds.has(id)) return;

    try {
      await fetch(`/api/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      setVotedIds(new Set([...Array.from(votedIds), id]));
      setFaqs(
        faqs.map((faq) =>
          faq.id === id
            ? {
                ...faq,
                helpful: action === "helpful" ? faq.helpful + 1 : faq.helpful,
                notHelpful:
                  action === "not_helpful" ? faq.notHelpful + 1 : faq.notHelpful,
              }
            : faq
        )
      );
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group FAQs by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const categoryName = faq.category?.name || "Khác";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(faq);
    return acc;
  }, {} as Record<string, Faq[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 text-center">
          <HelpCircle size={48} className="mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Câu hỏi thường gặp
          </h1>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Tìm câu trả lời cho các câu hỏi phổ biến về sản phẩm, đơn hàng, vận
            chuyển và nhiều hơn nữa.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="font-bold mb-4">Danh mục</h2>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === ""
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Tất cả ({faqs.length})
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {category.name} ({category.faqCount})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Không tìm thấy câu hỏi nào</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </div>
            ) : selectedCategory ? (
              // Show flat list when category is selected
              <div className="bg-white rounded-lg shadow-sm divide-y">
                {filteredFaqs.map((faq) => (
                  <FaqItem
                    key={faq.id}
                    faq={faq}
                    isExpanded={expandedIds.has(faq.id)}
                    onToggle={() => toggleExpand(faq.id)}
                    onVote={handleVote}
                    hasVoted={votedIds.has(faq.id)}
                  />
                ))}
              </div>
            ) : (
              // Show grouped by category
              <div className="space-y-8">
                {Object.entries(groupedFaqs).map(([categoryName, categoryFaqs]) => (
                  <div key={categoryName}>
                    <h2 className="text-lg font-bold mb-4">{categoryName}</h2>
                    <div className="bg-white rounded-lg shadow-sm divide-y">
                      {categoryFaqs.map((faq) => (
                        <FaqItem
                          key={faq.id}
                          faq={faq}
                          isExpanded={expandedIds.has(faq.id)}
                          onToggle={() => toggleExpand(faq.id)}
                          onVote={handleVote}
                          hasVoted={votedIds.has(faq.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Không tìm thấy câu trả lời?</h2>
          <p className="text-gray-600 mb-6">
            Liên hệ với chúng tôi để được hỗ trợ trực tiếp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Liên hệ hỗ trợ
            </a>
            <a
              href="tel:1900xxxx"
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hotline: 1900 xxxx
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({
  faq,
  isExpanded,
  onToggle,
  onVote,
  hasVoted,
}: {
  faq: Faq;
  isExpanded: boolean;
  onToggle: () => void;
  onVote: (id: string, action: "helpful" | "not_helpful") => void;
  hasVoted: boolean;
}) {
  return (
    <div className="p-4">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <span className="font-medium">{faq.question}</span>
        {isExpanded ? (
          <ChevronUp size={20} className="flex-shrink-0 text-gray-400" />
        ) : (
          <ChevronDown size={20} className="flex-shrink-0 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-4">
          <div
            className="text-gray-600 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Câu trả lời này có hữu ích không?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onVote(faq.id, "helpful")}
                disabled={hasVoted}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                  hasVoted
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-green-50 text-green-600"
                }`}
              >
                <ThumbsUp size={14} />
                <span>{faq.helpful}</span>
              </button>
              <button
                onClick={() => onVote(faq.id, "not_helpful")}
                disabled={hasVoted}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                  hasVoted
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-red-50 text-red-600"
                }`}
              >
                <ThumbsDown size={14} />
                <span>{faq.notHelpful}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
