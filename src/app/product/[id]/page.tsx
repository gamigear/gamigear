"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Minus, Plus, ShoppingBag, Truck, RotateCcw, Shield } from "lucide-react";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import ProductGrid from "@/components/ProductGrid";

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id) || products[0];
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  const sizes = ["S", "M", "L", "XL"];
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image */}
        <div className="relative aspect-[3/4] bg-gray-100">
          {product.image && product.image !== "#" && (product.image.startsWith("/") || product.image.startsWith("http")) ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
          {product.discount && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-orange-500 text-white text-sm font-medium">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex gap-2 mb-2">
            {product.isNew && (
              <span className="px-2 py-1 bg-black text-white text-xs">NEW</span>
            )}
            {product.isBest && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs">BEST</span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">사이즈</p>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">수량</p>
            <div className="flex items-center border border-gray-300 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="flex justify-between items-center py-4 border-t border-b border-gray-200 mb-6">
            <span className="font-medium">총 상품금액</span>
            <span className="text-xl font-bold">{formatPrice(product.price * quantity)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <button className="flex-1 py-4 bg-black text-white font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={20} />
              장바구니
            </button>
            <button className="p-4 border border-gray-300 hover:border-black transition-colors">
              <Heart size={20} />
            </button>
          </div>

          {/* Benefits */}
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <Truck size={18} />
              <span>5만원 이상 무료배송</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={18} />
              <span>7일 이내 교환/반품 가능</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={18} />
              <span>정품 보증</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <ProductGrid
        title="RELATED PRODUCTS"
        subtitle="함께 보면 좋은 상품"
        products={relatedProducts}
      />
    </div>
  );
}
