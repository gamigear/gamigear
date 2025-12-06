"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  Truck,
  Calendar,
  Gift,
  Hash,
  HelpCircle,
  ChevronRight,
  ShoppingCart,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import Price, { usePrice } from "@/components/Price";
import RelatedProductsSlider from "@/components/RelatedProductsSlider";
import Breadcrumb from "@/components/Breadcrumb";
import ProductGallery from "@/components/ProductGallery";
import ProductReviews from "@/components/ProductReviews";
import { useCart } from "@/contexts/CartContext";
import type { ProductData } from "@/lib/api";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import { productDetailTranslations, homepageTranslations } from "@/lib/i18n/shop-translations";

const productTexts = {
  en: {
    reviews: "Reviews",
    memberPrice: "Member Price",
    shipping: "Shipping",
    freeShipping: "Free Shipping",
    deliveryTime: "Delivery",
    deliveryDays: "Within 2 days (after payment)",
    points: "Points",
    productNo: "Product No.",
    outOfStock: "This product is out of stock",
    quantity: "Quantity",
    onlyLeft: "Only {count} left",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    cart: "Cart",
    addedToCart: "Added to cart",
    tabs: { detail: "Details", review: "Reviews", qna: "Q&A", info: "Shipping/Returns" },
    noDetail: "Product details will be displayed here",
    noReview: "Reviews will be displayed here",
    noQna: "Q&A will be displayed here",
    noInfo: "Shipping/Returns info will be displayed here",
    relatedProducts: "You may also like",
    wishlist: "Wishlist",
    share: "Share",
    affiliateNote: "* Affiliate product - You will be redirected to",
  },
  ko: {
    reviews: "리뷰",
    memberPrice: "회원 혜택가",
    shipping: "배송비",
    freeShipping: "무료배송",
    deliveryTime: "배송기일",
    deliveryDays: "2일 이내(결제완료 기준)",
    points: "적립혜택",
    productNo: "상품번호",
    outOfStock: "품절된 상품입니다",
    quantity: "수량",
    onlyLeft: "{count}개 남음",
    addToCart: "장바구니 담기",
    buyNow: "바로 구매",
    cart: "장바구니",
    addedToCart: "장바구니에 담았습니다",
    tabs: { detail: "상품상세", review: "리뷰", qna: "Q&A", info: "배송/교환" },
    noDetail: "상품 상세 정보가 들어갑니다",
    noReview: "리뷰가 들어갑니다",
    noQna: "Q&A가 들어갑니다",
    noInfo: "배송/교환 정보가 들어갑니다",
    relatedProducts: "함께 보면 좋은 상품",
    wishlist: "찜하기",
    share: "공유하기",
    affiliateNote: "* 제휴 상품 - 이동합니다",
  },
  vi: {
    reviews: "Đánh giá",
    memberPrice: "Giá ưu đãi",
    shipping: "Phí ship",
    freeShipping: "Miễn phí ship",
    deliveryTime: "Thời gian giao",
    deliveryDays: "Trong 2 ngày (sau thanh toán)",
    points: "Tích điểm",
    productNo: "Mã SP",
    outOfStock: "Sản phẩm đã hết hàng",
    quantity: "Số lượng",
    onlyLeft: "Chỉ còn {count} sản phẩm",
    addToCart: "Thêm vào giỏ",
    buyNow: "Mua ngay",
    cart: "Giỏ hàng",
    addedToCart: "Đã thêm vào giỏ hàng",
    tabs: { detail: "Chi tiết", review: "Đánh giá", qna: "Hỏi đáp", info: "Vận chuyển" },
    noDetail: "Thông tin chi tiết sản phẩm",
    noReview: "Đánh giá sản phẩm",
    noQna: "Hỏi đáp sản phẩm",
    noInfo: "Thông tin vận chuyển/đổi trả",
    relatedProducts: "Sản phẩm liên quan",
    wishlist: "Yêu thích",
    share: "Chia sẻ",
    affiliateNote: "* Sản phẩm affiliate - Bạn sẽ được chuyển đến",
  },
};

interface ProductVariation {
  id: string;
  sku: string | null;
  price: number;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  stockQuantity: number | null;
  stockStatus: string;
  image: string | null;
  attributes: Array<{ name: string; option: string }>;
}

interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  visible: boolean;
  variation: boolean;
}

interface ProductDetailClientProps {
  product: ProductData & {
    description?: string | null;
    shortDescription?: string | null;
    images?: { src: string; alt: string }[];
    stockStatus?: string;
    stockQuantity?: number | null;
    // Affiliate fields
    productType?: string;
    affiliateUrl?: string | null;
    affiliatePlatform?: string | null;
    affiliateButtonText?: string | null;
    // Variations
    variations?: ProductVariation[];
    attributes?: ProductAttribute[];
  };
  relatedProducts: ProductData[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const { locale } = useShopTranslation();
  const t = productTexts[locale];
  const [activeTab, setActiveTab] = useState("detail");
  const [isWished, setIsWished] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showAddedToast, setShowAddedToast] = useState(false);
  
  // Variation state
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Check if product is variable
  const isVariable = product.productType === 'variable' && product.variations && product.variations.length > 0;
  
  // Get variation attributes (attributes used for variations)
  const variationAttributes = product.attributes?.filter(attr => attr.variation) || [];
  
  // Get available options for each attribute
  const getAttributeOptions = (attrName: string): string[] => {
    if (!product.variations) return [];
    const options = new Set<string>();
    product.variations.forEach(v => {
      const attr = v.attributes.find(a => a.name === attrName);
      if (attr) options.add(attr.option);
    });
    return Array.from(options);
  };

  // Find matching variation based on selected options
  const findMatchingVariation = (options: Record<string, string>): ProductVariation | null => {
    if (!product.variations) return null;
    return product.variations.find(v => {
      return variationAttributes.every(attr => {
        const selectedOption = options[attr.name];
        if (!selectedOption) return false;
        const varAttr = v.attributes.find(a => a.name === attr.name);
        return varAttr?.option === selectedOption;
      });
    }) || null;
  };

  // Handle option selection
  const handleOptionSelect = (attrName: string, option: string) => {
    const newOptions = { ...selectedOptions, [attrName]: option };
    setSelectedOptions(newOptions);
    const variation = findMatchingVariation(newOptions);
    setSelectedVariation(variation);
  };

  // Get current price (from variation or product)
  const currentPrice = selectedVariation?.salePrice || selectedVariation?.price || product.price;
  const currentOriginalPrice = selectedVariation?.regularPrice || selectedVariation?.price || product.originalPrice;
  const currentStockStatus = selectedVariation?.stockStatus || product.stockStatus;
  const currentStockQuantity = selectedVariation?.stockQuantity ?? product.stockQuantity;

  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round((1 - currentPrice / currentOriginalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    // For variable products, require variation selection
    if (isVariable && !selectedVariation) {
      return;
    }
    
    const variationName = selectedVariation 
      ? ` - ${selectedVariation.attributes.map(a => a.option).join(', ')}`
      : '';
    
    addItem({
      productId: product.id,
      name: product.name + variationName,
      price: currentOriginalPrice || currentPrice,
      salePrice: currentOriginalPrice && currentOriginalPrice > currentPrice ? currentPrice : undefined,
      image: selectedVariation?.image || product.image,
      quantity,
      sku: selectedVariation?.sku || product.id,
      variationId: selectedVariation?.id,
    });
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    // For variable products, require variation selection
    if (isVariable && !selectedVariation) {
      return;
    }
    
    const variationName = selectedVariation 
      ? ` - ${selectedVariation.attributes.map(a => a.option).join(', ')}`
      : '';
    
    addItem({
      productId: product.id,
      name: product.name + variationName,
      price: currentOriginalPrice || currentPrice,
      salePrice: currentOriginalPrice && currentOriginalPrice > currentPrice ? currentPrice : undefined,
      image: selectedVariation?.image || product.image,
      quantity,
      sku: selectedVariation?.sku || product.id,
      variationId: selectedVariation?.id,
    });
    router.push("/cart");
  };

  // Get images for gallery
  const productImages = product.images?.map(img => img.src) || [product.image];

  // Check if product is affiliate
  const isAffiliate = product.productType === 'affiliate' && product.affiliateUrl;
  
  // Get affiliate button text
  const getAffiliateButtonText = () => {
    if (product.affiliateButtonText) return product.affiliateButtonText;
    switch (product.affiliatePlatform) {
      case 'shopee': return 'Mua trên Shopee';
      case 'lazada': return 'Mua trên Lazada';
      case 'tiki': return 'Mua trên Tiki';
      case 'sendo': return 'Mua trên Sendo';
      case 'amazon': return 'Buy on Amazon';
      case 'coupang': return '쿠팡에서 구매';
      default: return 'Mua ngay';
    }
  };

  // Handle buy button click
  const handleBuyClick = () => {
    if (isAffiliate && product.affiliateUrl) {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    ...(product.category && product.categorySlug
      ? [
          {
            label: product.category,
            href: `/category/${product.categorySlug}`,
            hasDropdown: true,
          },
        ]
      : []),
    { label: product.name, hasDropdown: false },
  ];

  return (
    <div className="pb-20 pc:pb-0">
      {/* Breadcrumb - Desktop Only */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Mobile Header */}
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-12 px-4">
          <Link href="/" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-4">
            <button>
              <Share2 size={20} />
            </button>
            <button onClick={() => setIsWished(!isWished)}>
              <Heart
                size={20}
                className={isWished ? "fill-primary text-primary" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
        <div className="flex pc:flex-row flex-col pc:justify-between pc:gap-16 mo:mb-0">
          {/* Product Gallery - 50% width */}
          <div className="pc:w-1/2 mo:pb-0">
            <ProductGallery images={productImages} productName={product.name} />
          </div>

          {/* Product Info - 50% width */}
          <div className="goods-info mo:px-0 pc:w-1/2 p-4 pc:p-0">
            {/* Brand */}
            <div className="mb-2 flex mo:mb-[14px]">
              {product.brand && (
                <Link
                  href={`/brand/${product.brand}`}
                  className="text-sm mr-1 inline-flex items-center gap-1 text-gray-500 hover:text-black"
                >
                  {product.brand}
                  <ChevronRight size={12} />
                </Link>
              )}
            </div>

            {/* Title */}
            <div className="mb-4">
              <h1 className="text-lg pc:text-xl font-medium mb-2">
                {product.name}
              </h1>
              {/* Badges */}
              <div className="flex gap-1">
                {product.isNew && (
                  <Image
                    src="https://cdn.i-screammall.co.kr/files/display/2024/11/196e8fdfdd-e61b-4546-af1a-041f0d913978_10.png"
                    alt="new"
                    width={52}
                    height={26}
                    className="h-[20px] pc:h-[26px] w-auto"
                  />
                )}
                {product.isFreeShipping && (
                  <Image
                    src="https://cdn.i-screammall.co.kr/files/display/2025/08/07761b96e9-1a98-4ac7-8054-db0024b3ceb6_10.png"
                    alt="무료배송"
                    width={72}
                    height={26}
                    className="h-[20px] pc:h-[26px] w-auto"
                  />
                )}
                {product.isBest && (
                  <Image
                    src="https://cdn.i-screammall.co.kr/files/display/2024/11/1935e4274f-7a6d-4d4c-8a07-b5ec1e1faa07_10.png"
                    alt="best"
                    width={52}
                    height={26}
                    className="h-[20px] pc:h-[26px] w-auto"
                  />
                )}
              </div>
            </div>

            {/* Rating - Reviews - Product No on one line */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-5 text-sm">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(product.rating || 0)
                        ? "text-primary fill-primary"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-300">|</span>
              <button className="text-gray-500 hover:text-black">
                {t.reviews} ({product.reviewCount || 0})
              </button>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{t.productNo}: {product.id}</span>
            </div>

            {/* Price - All on one line */}
            <div className="pb-5 pt-6 mo:pt-5">
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                  <Price amount={currentOriginalPrice} className="text-gray-400 line-through text-base" />
                )}
                {discountPercent > 0 && (
                  <span className="text-primary font-bold text-xl">
                    -{discountPercent}%
                  </span>
                )}
                <Price amount={currentPrice} className="text-2xl font-bold" />
                <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {t.memberPrice}
                </span>
              </div>
            </div>

            {/* Product Info List */}
            <ul className="border-t border-gray-100 pt-5 text-sm space-y-3">
              <li className="flex items-center gap-2">
                <Truck size={18} className="text-gray-400" />
                <span className="text-gray-500">{t.shipping}:</span>
                <span className="font-medium">{product.isFreeShipping ? t.freeShipping : "30.000đ"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-gray-500">{t.deliveryTime}:</span>
                <span>{t.deliveryDays}</span>
              </li>
              <li className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <Gift size={18} className="text-gray-400" />
                <span className="text-gray-500">{t.points}:</span>
                <span className="font-medium text-primary">+{Math.floor(product.price * 0.01).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}P</span>
              </li>
            </ul>

            {/* Variation Selector */}
            {isVariable && variationAttributes.length > 0 && (
              <div className="pt-5 space-y-4">
                {variationAttributes.map(attr => {
                  const options = getAttributeOptions(attr.name);
                  return (
                    <div key={attr.id}>
                      <p className="text-sm font-medium mb-2">{attr.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {options.map(option => (
                          <button
                            key={option}
                            onClick={() => handleOptionSelect(attr.name, option)}
                            className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                              selectedOptions[attr.name] === option
                                ? "border-primary bg-primary text-white"
                                : "border-gray-200 hover:border-primary"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Show selected variation info */}
                {selectedVariation && (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá:</span>
                      <Price amount={currentPrice} className="font-bold" />
                    </div>
                    {selectedVariation.sku && (
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-600">SKU:</span>
                        <span>{selectedVariation.sku}</span>
                      </div>
                    )}
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-600">Tình trạng:</span>
                      <span className={currentStockStatus === 'instock' ? 'text-green-600' : 'text-red-600'}>
                        {currentStockStatus === 'instock' ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                )}
                {/* Warning if no variation selected */}
                {!selectedVariation && Object.keys(selectedOptions).length > 0 && (
                  <p className="text-sm text-orange-500">Vui lòng chọn đầy đủ tùy chọn</p>
                )}
              </div>
            )}

            {/* Stock Status */}
            {currentStockStatus === 'outofstock' && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {t.outOfStock}
              </div>
            )}

            {/* Quantity Selector - Only for normal products */}
            {!isAffiliate && currentStockStatus !== 'outofstock' && (!isVariable || selectedVariation) && (
              <div className="flex items-center gap-4 pt-6">
                <span className="text-sm text-gray-600">{t.quantity}:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                    disabled={currentStockQuantity != null && quantity >= currentStockQuantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {currentStockQuantity != null && currentStockQuantity <= 10 && (
                  <span className="text-sm text-orange-500">
                    {t.onlyLeft.replace('{count}', String(currentStockQuantity))}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-6 mo:px-5 mo:pb-5 mo:pt-2.5">
              {isAffiliate ? (
                <>
                  {/* Affiliate Product - Single button to external site */}
                  <button 
                    onClick={handleBuyClick}
                    className="flex-1 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
                  >
                    {product.affiliatePlatform === 'shopee' && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    )}
                    {getAffiliateButtonText()}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  {/* Normal Product */}
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary/5 flex items-center justify-center gap-2 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                    disabled={currentStockStatus === 'outofstock' || (isVariable && !selectedVariation)}
                  >
                    <ShoppingCart size={18} />
                    {isVariable && !selectedVariation ? 'Chọn tùy chọn' : t.addToCart}
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={currentStockStatus === 'outofstock' || (isVariable && !selectedVariation)}
                  >
                    {t.buyNow}
                  </button>
                  {/* Wishlist & Share buttons */}
                  <button
                    onClick={() => setIsWished(!isWished)}
                    title={t.wishlist}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <Heart
                      size={20}
                      className={isWished ? "fill-primary text-primary" : "text-gray-400"}
                    />
                  </button>
                  <button 
                    title={t.share} 
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <Share2 size={20} className="text-gray-400" />
                  </button>
                </>
              )}
            </div>
            
            {/* Affiliate Badge */}
            {isAffiliate && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                {t.affiliateNote} {product.affiliatePlatform || 'e-commerce'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-y border-gray-200 sticky top-0 pc:top-0 bg-white z-40 mt-10">
        <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
          <div className="flex">
            {["detail", "review", "qna", "info"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-gray-400"
                }`}
              >
                {tab === "detail" && t.tabs.detail}
                {tab === "review" && `${t.tabs.review}(${product.reviewCount || 0})`}
                {tab === "qna" && t.tabs.qna}
                {tab === "info" && t.tabs.info}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
        <div className="py-8 min-h-[400px]">
          {activeTab === "detail" && (
            <div className="prose max-w-none">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <div className="text-center py-20 text-gray-400">
                  {t.noDetail}
                </div>
              )}
            </div>
          )}
          {activeTab === "review" && (
            <ProductReviews 
              productId={product.id} 
              averageRating={product.rating || 0}
              reviewCount={product.reviewCount || 0}
            />
          )}
          {activeTab === "qna" && (
            <div className="text-center py-20 text-gray-400">
              {t.noQna}
            </div>
          )}
          {activeTab === "info" && (
            <div className="text-center py-20 text-gray-400">
              {t.noInfo}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProductsSlider title={t.relatedProducts} products={relatedProducts} />
      )}

      {/* Mobile Fixed Bottom */}
      <div className="pc:hidden fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2">
        {isAffiliate ? (
          <button 
            onClick={handleBuyClick}
            className="flex-1 py-3 bg-orange-500 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          >
            {getAffiliateButtonText()}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        ) : (
          <>
            <button 
              onClick={handleAddToCart}
              className="flex-1 py-3 border border-primary text-primary font-medium rounded-lg disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              disabled={currentStockStatus === 'outofstock' || (isVariable && !selectedVariation)}
            >
              <ShoppingCart size={18} />
              {isVariable && !selectedVariation ? 'Chọn' : t.cart}
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 py-3 bg-primary text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={currentStockStatus === 'outofstock' || (isVariable && !selectedVariation)}
            >
              {t.buyNow}
            </button>
          </>
        )}
      </div>

      {/* Added to Cart Toast */}
      {showAddedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check size={18} className="text-green-400" />
          {t.addedToCart}
        </div>
      )}
    </div>
  );
}
