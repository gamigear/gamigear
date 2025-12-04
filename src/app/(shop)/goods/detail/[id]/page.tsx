import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api";
import ProductDetailClient from "./ProductDetailClient";
import prisma from "@/lib/db/prisma";

const db = prisma as any;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getRelatedProducts(productId: string) {
  try {
    const limit = 12;

    // Get the product with its settings
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        categories: true,
        tags: true,
        relatedProducts: {
          include: {
            relatedProduct: {
              include: {
                images: { take: 1, orderBy: { position: "asc" } },
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!product) return [];

    const relatedLimit = product.relatedProductsLimit || limit;
    const source = product.relatedProductsSource || "auto";

    let relatedProducts: any[] = [];

    // Get manual related products first
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

    // If we need more products (auto or mixed mode)
    if ((source === "auto" || source === "mixed") && relatedProducts.length < relatedLimit) {
      const remainingLimit = relatedLimit - relatedProducts.length;
      const excludeIds = [productId, ...relatedProducts.map((p: any) => p.id)];

      // Get category IDs and tag IDs
      const categoryIds = product.categories.map((pc: any) => pc.categoryId);
      const tagIds = product.tags.map((pt: any) => pt.tagId);

      // Build where clause
      const whereConditions: any[] = [];

      if (categoryIds.length > 0) {
        whereConditions.push({
          categories: { some: { categoryId: { in: categoryIds } } },
        });
      }

      if (tagIds.length > 0) {
        whereConditions.push({
          tags: { some: { tagId: { in: tagIds } } },
        });
      }

      // Fallback to any published products if no categories/tags
      const autoRelated = await db.product.findMany({
        where: {
          id: { notIn: excludeIds },
          status: "publish",
          ...(whereConditions.length > 0 ? { OR: whereConditions } : {}),
        },
        include: {
          images: { take: 1, orderBy: { position: "asc" } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
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

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch product from database
  const product = await getProductById(id);
  
  if (!product) {
    notFound();
  }

  // Fetch related products using new API
  const relatedProducts = await getRelatedProducts(id);

  return (
    <ProductDetailClient 
      product={product} 
      relatedProducts={relatedProducts}
    />
  );
}
