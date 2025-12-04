"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Ticket, Gift, Sparkles, GraduationCap, Pencil } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

const quickMenuItems = {
  en: [
    { name: "Books", icon: BookOpen, href: "/category/books", color: "bg-blue-50 text-blue-600" },
    { name: "Tickets", icon: Ticket, href: "/category/tickets", color: "bg-pink-50 text-pink-600" },
    { name: "Promotions", icon: Gift, href: "/promotions", color: "bg-purple-50 text-purple-600" },
    { name: "New", icon: Sparkles, href: "/category/new", color: "bg-yellow-50 text-yellow-600" },
    { name: "Education", icon: GraduationCap, href: "/category/edu", color: "bg-green-50 text-green-600" },
    { name: "Stationery", icon: Pencil, href: "/category/stationery", color: "bg-orange-50 text-orange-600" },
  ],
  ko: [
    { name: "좋은책방", icon: BookOpen, href: "/category/books", color: "bg-blue-50 text-blue-600" },
    { name: "체험티켓", icon: Ticket, href: "/category/tickets", color: "bg-pink-50 text-pink-600" },
    { name: "기획전", icon: Gift, href: "/promotions", color: "bg-purple-50 text-purple-600" },
    { name: "신상품", icon: Sparkles, href: "/category/new", color: "bg-yellow-50 text-yellow-600" },
    { name: "학습교구", icon: GraduationCap, href: "/category/edu", color: "bg-green-50 text-green-600" },
    { name: "문구", icon: Pencil, href: "/category/stationery", color: "bg-orange-50 text-orange-600" },
  ],
  vi: [
    { name: "Sách", icon: BookOpen, href: "/category/books", color: "bg-blue-50 text-blue-600" },
    { name: "Vé", icon: Ticket, href: "/category/tickets", color: "bg-pink-50 text-pink-600" },
    { name: "Khuyến mãi", icon: Gift, href: "/promotions", color: "bg-purple-50 text-purple-600" },
    { name: "Mới", icon: Sparkles, href: "/category/new", color: "bg-yellow-50 text-yellow-600" },
    { name: "Giáo dục", icon: GraduationCap, href: "/category/edu", color: "bg-green-50 text-green-600" },
    { name: "Văn phòng", icon: Pencil, href: "/category/stationery", color: "bg-orange-50 text-orange-600" },
  ],
};

export default function QuickMenu() {
  const [mounted, setMounted] = useState(false);
  const { locale } = useShopTranslation();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const items = quickMenuItems[mounted ? locale : 'ko'];
  return (
    <section className="py-6 pc:py-8">
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
        <div className="grid grid-cols-3 pc:grid-cols-6 gap-4">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}>
                <item.icon size={24} />
              </div>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
