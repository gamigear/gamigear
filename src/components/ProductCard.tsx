"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import type { ProductData } from "@/lib/api";
import Price from "@/components/Price";

interface ProductCardProps {
  product: Product | ProductData;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Only show discount if originalPrice exists and is greater than 0
  const hasValidOriginalPrice = product.originalPrice && product.originalPrice > 0 && product.originalPrice > product.price;
  const discountPercent = hasValidOriginalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card group">
      <Link href={`/goods/detail/${product.slug || product.id}`} className="block" prefetch={true}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg mb-3">
          {product.image && product.image !== "#" && (product.image.startsWith("/") || product.image.startsWith("http")) ? (
            <>
              {/* Blurred background image */}
              <Image
                src={product.image}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                loading="lazy"
                className="object-cover scale-110 blur-xl opacity-60"
                aria-hidden="true"
              />
              {/* Main product image */}
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                loading="lazy"
                className="product-image object-contain transition-transform duration-300 relative z-10"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>No Image</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <span className="px-2 py-0.5 bg-black text-white text-[10px] font-medium rounded">
                NEW
              </span>
            )}
            {product.isBest && (
              <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-medium rounded">
                BEST
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              // Handle wishlist
            }}
          >
            <Heart size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-2">
            {discountPercent > 0 && (
              <span className="text-primary font-bold text-base">
                {discountPercent}%
              </span>
            )}
            <Price amount={product.price} className="text-base font-bold" />
          </div>
          
          {hasValidOriginalPrice && (
            <Price amount={product.originalPrice} className="text-sm text-gray-400 line-through" />
          )}

          {/* Rating */}
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center gap-1 pt-1">
              <span className="text-yellow-400">★</span>
              <span className="text-xs text-gray-500">{product.rating}</span>
              {product.reviewCount !== undefined && product.reviewCount > 0 && (
                <span className="text-xs text-gray-400">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Tags */}
          {"tags" in product && product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {product.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
