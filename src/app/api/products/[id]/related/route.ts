import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

const db = prisma as any;

// GET /api/products/[id]/related - Get related products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "12");

    // Get the product with its settings
    const product = await db.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
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

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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
        averageRating: rp.relatedProduct.averageRating,
        ratingCount: rp.relatedProduct.ratingCount,
      }));
    }

    // If we need more products (auto or mixed mode)
    if ((source === "auto" || source === "mixed") && relatedProducts.length < relatedLimit) {
      const remainingLimit = relatedLimit - relatedProducts.length;
      const excludeIds = [id, ...relatedProducts.map((p) => p.id)];

      // Get category IDs and tag IDs
      const categoryIds = product.categories.map((pc: any) => pc.categoryId);
      const tagIds = product.tags.map((pt: any) => pt.tagId);

      // Build where clause for auto-related products
      const whereConditions: any[] = [];

      // Products in same categories
      if (categoryIds.length > 0) {
        whereConditions.push({
          categories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
        });
      }

      // Products with same tags
      if (tagIds.length > 0) {
        whereConditions.push({
          tags: {
            some: {
              tagId: { in: tagIds },
            },
          },
        });
      }

      // If no categories or tags, get featured products
      if (whereConditions.length === 0) {
        whereConditions.push({ featured: true });
      }

      const autoRelated = await db.product.findMany({
        where: {
          AND: [
            { id: { notIn: excludeIds } },
            { status: "publish" },
            { OR: whereConditions },
          ],
        },
        include: {
          images: { take: 1, orderBy: { position: "asc" } },
        },
        orderBy: [
          { featured: "desc" },
          { averageRating: "desc" },
          { createdAt: "desc" },
        ],
        take: remainingLimit,
      });

      const autoProducts = autoRelated.map((p: any) => {
        const hasSale = p.salePrice && p.salePrice > 0;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: hasSale ? p.salePrice : p.price,
          originalPrice: hasSale ? p.price : null,
          image: p.images?.[0]?.src || "",
          featured: p.featured,
          averageRating: p.averageRating,
          ratingCount: p.ratingCount,
        };
      });

      relatedProducts = [...relatedProducts, ...autoProducts];
    }

    return NextResponse.json({
      data: relatedProducts.slice(0, relatedLimit),
      meta: {
        source,
        limit: relatedLimit,
        total: relatedProducts.length,
      },
    });
  } catch (error) {
    console.error("Related products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}
