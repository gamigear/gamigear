"use client";

import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

const texts = {
  en: { home: "Home" },
  ko: { home: "홈" },
  vi: { home: "Trang chủ" },
};

interface BreadcrumbItem {
  label: string;
  href?: string;
  hasDropdown?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const { locale } = useShopTranslation();
  const t = texts[locale];

  return (
    <nav className="breadcrumb mx-auto max-w-[1280px] px-5 pc:px-4 pb-[40px] pt-[24px] mo:hidden">
      <ol className="breadcrumb-list flex items-center">
        {/* Home */}
        <li className="breadcrumb-item flex items-center">
          <Link href="/" className="breadcrumb-item-link block px-[4px] text-sm text-gray-600 hover:text-black">
            {t.home}
          </Link>
          <ChevronRight size={12} className="text-gray-400 mx-1" />
        </li>

        {/* Dynamic Items */}
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item flex items-center">
            <div className="relative pr-[16px]">
              {item.href ? (
                <Link
                  href={item.href}
                  className="breadcrumb-item-link block w-auto px-[4px] text-sm text-gray-600 hover:text-black"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumb-item-link block w-auto px-[4px] text-sm text-gray-900 font-medium">
                  {item.label}
                </span>
              )}
              {item.hasDropdown && (
                <span className="absolute inset-y-0 right-0 m-auto flex items-center cursor-pointer rounded-[8px] hover:bg-black/5">
                  <ChevronDown size={16} className="text-gray-400" />
                </span>
              )}
            </div>
            {index < items.length - 1 && (
              <ChevronRight size={12} className="text-gray-400 mx-1" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
