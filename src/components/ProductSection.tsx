"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Product } from "@/types";
import type { ProductData } from "@/lib/api";
import ProductCard from "./ProductCard";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import { homepageTranslations } from "@/lib/i18n/shop-translations";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: (Product | ProductData)[];
  viewAllLink?: string;
  columns?: 2 | 3 | 4;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
  columns = 4,
}: ProductSectionProps) {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const t = homepageTranslations[mounted ? locale : 'ko'];

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 pc:grid-cols-3",
    4: "grid-cols-2 pc:grid-cols-4",
  };

  return (
    <section className="py-8 pc:py-12">
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl pc:text-2xl font-bold">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-black"
            >
              {t.sections.viewAll}
              <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid ${gridCols[columns]} gap-4 pc:gap-6`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
