"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || url === "#") return false;
  return url.startsWith("/") || url.startsWith("http");
};

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter valid images
  const validImages = images.filter(isValidImageUrl);
  const galleryImages = validImages.length > 0 ? validImages : ["/placeholder.jpg"];

  return (
    <div className="flex pc:flex-row flex-col pc:gap-4">
      {/* Thumbnail Navigation - Desktop (bên trái) */}
      <div className="hidden pc:flex flex-col gap-2 w-[80px] shrink-0">
        {galleryImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative w-[80px] h-[80px] rounded-lg overflow-hidden border-2 transition-colors ${
              activeIndex === index ? "border-primary" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="w-full pc:flex-1">
        <div className="relative w-full aspect-square bg-gray-100 pc:rounded-xl overflow-hidden">
          <Image
            src={galleryImages[activeIndex]}
            alt={productName}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Mobile Pagination Dots */}
        <div className="pc:hidden flex justify-center gap-1.5 mt-4">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                activeIndex === index ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mobile Thumbnail - Horizontal */}
      <div className="pc:hidden flex gap-2 px-5 mt-4 overflow-x-auto">
        {galleryImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative w-[60px] h-[60px] rounded-lg overflow-hidden border-2 shrink-0 ${
              activeIndex === index ? "border-primary" : "border-gray-200"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
