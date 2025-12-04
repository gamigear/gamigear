import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/api";
import ProductDetailClient from "./ProductDetailClient";
import prisma from "@/lib/db/prisma";

const db = prisma as any;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getRelatedProducts(productId: string) {
  try {
    const limit = 12;

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
      const tagIds = product.tags.map((pt: any) => pt.tagId);

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
  const { slug } = await params;
  
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id);

  return (
    <ProductDetailClient 
      product={product} 
      relatedProducts={relatedProducts}
    />
  );
}
