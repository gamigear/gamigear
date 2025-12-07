"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";

interface ImageData {
  src: string;
  blurDataUrl?: string | null;
}

interface ProductGalleryProps {
  images: (string | ImageData)[];
  productName: string;
}

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || url === "#") return false;
  return url.startsWith("/") || url.startsWith("http");
};

// Default blur placeholder - gray background (fallback)
const defaultBlur = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+`;

// Normalize image input to ImageData format
const normalizeImage = (img: string | ImageData): ImageData => {
  if (typeof img === 'string') {
    return { src: img, blurDataUrl: null };
  }
  return img;
};

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  // Filter valid images and normalize - memoized
  const galleryImages = useMemo(() => {
    const normalized = images.map(normalizeImage);
    const validImages = normalized.filter(img => isValidImageUrl(img.src));
    return validImages.length > 0 ? validImages : [{ src: "/placeholder.jpg", blurDataUrl: null }];
  }, [images]);

  // Preload next image when hovering thumbnail
  const handleThumbnailHover = useCallback((index: number) => {
    if (!loadedImages.has(index)) {
      setLoadedImages(prev => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    }
  }, [loadedImages]);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
    // Preload adjacent images
    const toLoad = [index - 1, index, index + 1].filter(
      i => i >= 0 && i < galleryImages.length
    );
    setLoadedImages(prev => {
      const next = new Set(prev);
      toLoad.forEach(i => next.add(i));
      return next;
    });
  }, [galleryImages.length]);

  return (
    <div className="flex pc:flex-row flex-col pc:gap-4">
      {/* Thumbnail Navigation - Desktop (bên trái) */}
      <div className="hidden pc:flex flex-col gap-2 w-[80px] shrink-0">
        {galleryImages.map((img, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            onMouseEnter={() => handleThumbnailHover(index)}
            className={`relative w-[80px] h-[80px] rounded-lg overflow-hidden border-2 transition-colors ${
              activeIndex === index ? "border-primary" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Image
              src={img.src}
              alt={`${productName} ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
              loading={index < 4 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL={img.blurDataUrl || defaultBlur}
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="w-full pc:flex-1">
        <div className="relative w-full aspect-square bg-gray-100 pc:rounded-xl overflow-hidden">
          <Image
            src={galleryImages[activeIndex].src}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority={activeIndex === 0}
            placeholder="blur"
            blurDataURL={galleryImages[activeIndex].blurDataUrl || defaultBlur}
          />
        </div>

        {/* Mobile Pagination Dots */}
        <div className="pc:hidden flex justify-center gap-1.5 mt-4">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                activeIndex === index ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mobile Thumbnail - Horizontal */}
      <div className="pc:hidden flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
        {galleryImages.map((img, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`relative w-[60px] h-[60px] rounded-lg overflow-hidden border-2 shrink-0 ${
              activeIndex === index ? "border-primary" : "border-gray-200"
            }`}
          >
            <Image
              src={img.src}
              alt={`${productName} ${index + 1}`}
              fill
              sizes="60px"
              className="object-cover"
              loading={index < 5 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL={img.blurDataUrl || defaultBlur}
            />
          </button>
        ))}
      </div>

      {/* Preload adjacent images for faster switching */}
      <div className="hidden">
        {galleryImages.map((img, index) => 
          loadedImages.has(index) && index !== activeIndex ? (
            <Image
              key={`preload-${index}`}
              src={img.src}
              alt=""
              width={1}
              height={1}
              loading="lazy"
            />
          ) : null
        )}
      </div>
    </div>
  );
}
