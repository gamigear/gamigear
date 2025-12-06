import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getProductBySlug } from "@/lib/api";
import ProductDetailClient from "./ProductDetailClient";
import prisma from "@/lib/db/prisma";

const db = prisma as any;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for popular products (optional - for static generation)
export const revalidate = 60; // Revalidate page every 60 seconds

async function getRelatedProducts(productId: string) {
  try {
    const limit = 12;

    // Optimized: Only fetch what we need
    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        relatedProductsLimit: true,
        relatedProductsSource: true,
        categories: { select: { categoryId: true } },
        relatedProducts: {
          select: {
            relatedProduct: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                salePrice: true,
                featured: true,
                images: { take: 1, select: { src: true } },
              },
            },
          },
          orderBy: { position: "asc" },
          take: limit,
        },
      },
    });

    if (!product) return [];

    const relatedLimit = product.relatedProductsLimit || limit;
    const source = product.relatedProductsSource || "auto";

    let relatedProducts: any[] = [];

    if (source === "manual" || source === "mixed") {
      relatedProducts = product.relatedProducts.map((rp: any) => ({
        id: rp.relatedProduct.id,
        name: rp.relatedProduct.name,
        slug: rp.relatedProduct.slug,
        price: rp.relatedProduct.salePrice || rp.relatedProduct.price,
        originalPrice: rp.relatedProduct.salePrice ? rp.relatedProduct.price : null,
        image: rp.relatedProduct.images?.[0]?.src || "",
        featured: rp.relatedProduct.featured,
      }));
    }

    if ((source === "auto" || source === "mixed") && relatedProducts.length < relatedLimit) {
      const remainingLimit = relatedLimit - relatedProducts.length;
      const excludeIds = [productId, ...relatedProducts.map((p: any) => p.id)];
      const categoryIds = product.categories.map((pc: any) => pc.categoryId);

      // Simplified query - only by category (faster)
      const autoRelated = await db.product.findMany({
        where: {
          id: { notIn: excludeIds },
          status: "publish",
          ...(categoryIds.length > 0
            ? { categories: { some: { categoryId: { in: categoryIds } } } }
            : {}),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          featured: true,
          images: { take: 1, select: { src: true } },
        },
        orderBy: { featured: "desc" },
        take: remainingLimit,
      });

      const autoProducts = autoRelated.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.salePrice || p.price,
        originalPrice: p.salePrice ? p.price : null,
        image: p.images?.[0]?.src || "",
        featured: p.featured,
      }));

      relatedProducts = [...relatedProducts, ...autoProducts];
    }

    return relatedProducts.slice(0, relatedLimit);
  } catch (error) {
    console.error("Failed to fetch related products:", error);
    return [];
  }
}

// Cache product data with unique key per slug
const getCachedProduct = (slug: string) =>
  unstable_cache(
    async () => getProductBySlug(slug),
    [`product-${slug}`],
    { revalidate: 60, tags: [`product-${slug}`] }
  )();

// Cache related products with unique key per product
const getCachedRelatedProducts = (productId: string) =>
  unstable_cache(
    async () => getRelatedProducts(productId),
    [`related-${productId}`],
    { revalidate: 300, tags: [`related-${productId}`] }
  )();

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch product first (required for related products)
  const product = await getCachedProduct(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products (can be done in parallel with page render)
  const relatedProducts = await getCachedRelatedProducts(product.id);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
