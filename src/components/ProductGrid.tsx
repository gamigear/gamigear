import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

export default function ProductGrid({ title, subtitle, products, viewAllLink }: ProductGridProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
          {subtitle && (
            <p className="text-gray-500 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        {viewAllLink && (
          <div className="text-center mt-8">
            <a
              href={viewAllLink}
              className="inline-block px-8 py-3 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
            >
              VIEW ALL
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
