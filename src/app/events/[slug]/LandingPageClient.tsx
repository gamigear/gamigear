"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Clock, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  onSale: boolean;
  images: { src: string }[];
}

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  template: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  heroBackground?: string;
  contentTitle?: string;
  contentText?: string;
  contentImage?: string;
  showProducts: boolean;
  productTitle?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  ctaBackground?: string;
  countdownEnabled: boolean;
  countdownEndDate?: string;
  countdownTitle?: string;
  customCss?: string;
  primaryColor: string;
  secondaryColor: string;
}

interface Props {
  landingPage: LandingPage;
  products: Product[];
}

// Countdown Timer Component
function CountdownTimer({ endDate, title }: { endDate: string; title?: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="text-center">
      {title && <p className="text-lg mb-4 opacity-90">{title}</p>}
      <div className="flex justify-center gap-4">
        {[
          { value: timeLeft.days, label: "Ngày" },
          { value: timeLeft.hours, label: "Giờ" },
          { value: timeLeft.minutes, label: "Phút" },
          { value: timeLeft.seconds, label: "Giây" },
        ].map((item, i) => (
          <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
            <div className="text-3xl md:text-4xl font-bold">{item.value.toString().padStart(2, "0")}</div>
            <div className="text-sm opacity-80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Format price consistently
function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price);
}

// Product Card Component
function ProductCard({ product, primaryColor }: { product: Product; primaryColor: string }) {
  const image = product.images?.[0]?.src || "/placeholder.png";
  const discount = product.regularPrice && product.salePrice
    ? Math.round((1 - product.salePrice / product.regularPrice) * 100)
    : 0;

  return (
    <Link
      href={`/goods/detail/${product.slug || product.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold text-white rounded"
            style={{ backgroundColor: primaryColor }}>
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: primaryColor }}>
            {formatPrice(product.salePrice || product.price)}đ
          </span>
          {product.regularPrice && product.onSale && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.regularPrice)}đ
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}


// Template 1: Hero + Product
function HeroProductTemplate({ landingPage, products }: Props) {
  const { primaryColor, secondaryColor } = landingPage;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center text-white overflow-hidden"
        style={{ background: landingPage.heroBackground || `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
      >
        {landingPage.heroImage && (
          <div className="absolute inset-0">
            <img
              src={landingPage.heroImage}
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        )}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            {landingPage.heroTitle || landingPage.title}
          </h1>
          {landingPage.heroSubtitle && (
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {landingPage.heroSubtitle}
            </p>
          )}
          {landingPage.heroButtonText && (
            <Link
              href={landingPage.heroButtonLink || "#products"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:scale-105 transition-transform"
            >
              {landingPage.heroButtonText}
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>

      {/* Products Section */}
      {landingPage.showProducts && products.length > 0 && (
        <section id="products" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {landingPage.productTitle || "Sản phẩm nổi bật"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} primaryColor={primaryColor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {landingPage.ctaTitle && (
        <section
          className="py-20 text-white text-center"
          style={{ background: landingPage.ctaBackground || `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{landingPage.ctaTitle}</h2>
            {landingPage.ctaSubtitle && (
              <p className="text-xl mb-8 opacity-90">{landingPage.ctaSubtitle}</p>
            )}
            {landingPage.ctaButtonText && (
              <Link
                href={landingPage.ctaButtonLink || "/"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:scale-105 transition-transform"
              >
                {landingPage.ctaButtonText}
                <ShoppingCart size={20} />
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

// Template 2: Countdown Sale
function CountdownSaleTemplate({ landingPage, products }: Props) {
  const { primaryColor, secondaryColor } = landingPage;

  return (
    <div className="min-h-screen">
      {/* Hero with Countdown */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center text-white"
        style={{ background: landingPage.heroBackground || `linear-gradient(135deg, #e53e3e, #c53030)` }}
      >
        {landingPage.heroImage && (
          <div className="absolute inset-0">
            <img src={landingPage.heroImage} alt="" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
            <Clock size={20} />
            <span className="font-medium">Ưu đãi có hạn</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {landingPage.heroTitle || landingPage.title}
          </h1>
          {landingPage.heroSubtitle && (
            <p className="text-xl md:text-2xl mb-8 opacity-90">{landingPage.heroSubtitle}</p>
          )}
          
          {landingPage.countdownEnabled && landingPage.countdownEndDate && (
            <div className="mb-8">
              <CountdownTimer
                endDate={landingPage.countdownEndDate}
                title={landingPage.countdownTitle}
              />
            </div>
          )}

          {landingPage.heroButtonText && (
            <Link
              href={landingPage.heroButtonLink || "#products"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-full hover:bg-yellow-300 transition-colors"
            >
              {landingPage.heroButtonText}
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>

      {/* Flash Sale Products */}
      {landingPage.showProducts && products.length > 0 && (
        <section id="products" className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="w-12 h-1 bg-red-500 rounded"></div>
              <h2 className="text-3xl font-bold text-center">
                {landingPage.productTitle || "🔥 Flash Sale"}
              </h2>
              <div className="w-12 h-1 bg-red-500 rounded"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} primaryColor="#e53e3e" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Urgency CTA */}
      {landingPage.ctaTitle && (
        <section className="py-16 bg-gray-900 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">{landingPage.ctaTitle}</h2>
            {landingPage.ctaSubtitle && (
              <p className="text-lg mb-8 text-gray-300">{landingPage.ctaSubtitle}</p>
            )}
            {landingPage.ctaButtonText && (
              <Link
                href={landingPage.ctaButtonLink || "/"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-colors"
              >
                {landingPage.ctaButtonText}
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}


// Template 3: Product Showcase
function ProductShowcaseTemplate({ landingPage, products }: Props) {
  const { primaryColor, secondaryColor } = landingPage;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Hero */}
      <section className="bg-white py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: primaryColor }}>
            {landingPage.heroTitle || landingPage.title}
          </h1>
          {landingPage.heroSubtitle && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {landingPage.heroSubtitle}
            </p>
          )}
        </div>
      </section>

      {/* Featured Image */}
      {landingPage.heroImage && (
        <section className="container mx-auto px-4 -mt-8">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={landingPage.heroImage}
              alt=""
              className="w-full h-[400px] object-cover"
            />
          </div>
        </section>
      )}

      {/* Products Grid */}
      {landingPage.showProducts && products.length > 0 && (
        <section id="products" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">
                {landingPage.productTitle || "Bộ sưu tập"}
              </h2>
              <p className="text-gray-600">Khám phá các sản phẩm được chọn lọc</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/goods/detail/${product.slug || product.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={product.images?.[0]?.src || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                        {(product.salePrice || product.price).toLocaleString()}đ
                      </span>
                      <span
                        className="px-4 py-2 rounded-full text-sm font-medium text-white transition-colors"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Xem chi tiết
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      {landingPage.ctaTitle && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div
              className="rounded-3xl p-12 text-center text-white"
              style={{ background: landingPage.ctaBackground || `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{landingPage.ctaTitle}</h2>
              {landingPage.ctaSubtitle && (
                <p className="text-xl mb-8 opacity-90">{landingPage.ctaSubtitle}</p>
              )}
              {landingPage.ctaButtonText && (
                <Link
                  href={landingPage.ctaButtonLink || "/"}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:scale-105 transition-transform"
                >
                  {landingPage.ctaButtonText}
                  <ArrowRight size={20} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Template 4: Minimal CTA
function MinimalCtaTemplate({ landingPage, products }: Props) {
  const { primaryColor, secondaryColor } = landingPage;

  return (
    <div className="min-h-screen bg-white">
      {/* Full Screen Hero */}
      <section
        className="min-h-screen flex items-center justify-center relative"
        style={{ background: landingPage.heroBackground || "#000" }}
      >
        {landingPage.heroImage && (
          <div className="absolute inset-0">
            <img
              src={landingPage.heroImage}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        )}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            {landingPage.heroTitle || landingPage.title}
          </h1>
          {landingPage.heroSubtitle && (
            <p className="text-xl md:text-2xl mb-12 opacity-80 max-w-2xl mx-auto">
              {landingPage.heroSubtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {landingPage.heroButtonText && (
              <Link
                href={landingPage.heroButtonLink || "#"}
                className="px-10 py-5 text-lg font-semibold rounded-full transition-all hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                {landingPage.heroButtonText}
              </Link>
            )}
            {landingPage.ctaButtonText && (
              <Link
                href={landingPage.ctaButtonLink || "#products"}
                className="px-10 py-5 text-lg font-semibold rounded-full border-2 border-white hover:bg-white hover:text-gray-900 transition-all"
              >
                {landingPage.ctaButtonText}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Products (if enabled) */}
      {landingPage.showProducts && products.length > 0 && (
        <section id="products" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              {landingPage.productTitle || "Sản phẩm"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} primaryColor={primaryColor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Simple Footer CTA */}
      {landingPage.ctaTitle && (
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">{landingPage.ctaTitle}</h2>
            {landingPage.ctaSubtitle && (
              <p className="text-gray-600 mb-8">{landingPage.ctaSubtitle}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

// Main Component
export default function LandingPageClient({ landingPage, products }: Props) {
  const templates: Record<string, React.FC<Props>> = {
    "hero-product": HeroProductTemplate,
    "countdown-sale": CountdownSaleTemplate,
    "product-showcase": ProductShowcaseTemplate,
    "minimal-cta": MinimalCtaTemplate,
  };

  const Template = templates[landingPage.template] || HeroProductTemplate;

  return (
    <>
      {landingPage.customCss && (
        <style dangerouslySetInnerHTML={{ __html: landingPage.customCss }} />
      )}
      <Template landingPage={landingPage} products={products} />
    </>
  );
}
