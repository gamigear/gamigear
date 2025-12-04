"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface MobileMenuItem {
  id: string;
  name: { ko: string; en: string; vi: string };
  icon: string;
  href: string;
  isActive: boolean;
  position: number;
}

const defaultItems: MobileMenuItem[] = [
  { id: "home", name: { ko: "홈", en: "Home", vi: "Trang chủ" }, icon: "Home", href: "/", isActive: true, position: 0 },
  { id: "search", name: { ko: "검색", en: "Search", vi: "Tìm kiếm" }, icon: "Search", href: "/search", isActive: true, position: 1 },
  { id: "categories", name: { ko: "카테고리", en: "Categories", vi: "Danh mục" }, icon: "Grid3X3", href: "/categories", isActive: true, position: 2 },
  { id: "account", name: { ko: "마이페이지", en: "Account", vi: "Tài khoản" }, icon: "User", href: "/mypage", isActive: true, position: 3 },
  { id: "cart", name: { ko: "장바구니", en: "Cart", vi: "Giỏ hàng" }, icon: "ShoppingCart", href: "/cart", isActive: true, position: 4 },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<MobileMenuItem[]>(defaultItems);
  const { locale } = useShopTranslation();

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings/mobile-menu")
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {});
  }, []);

  // Don't show on admin pages
  if (pathname.startsWith("/admin")) return null;

  const lang = mounted ? locale : "ko";
  const activeItems = items.filter(i => i.isActive).sort((a, b) => a.position - b.position);

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[iconName];
    return Icon ? <Icon size={20} /> : <LucideIcons.Circle size={20} />;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pc:hidden">
      <div className="grid h-14" style={{ gridTemplateColumns: `repeat(${activeItems.length}, 1fr)` }}>
        {activeItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5",
                isActive ? "text-black" : "text-gray-400"
              )}
            >
              {getIcon(item.icon)}
              <span className="text-[10px]">{item.name[lang]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
