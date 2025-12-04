import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// POST - Apply bulk sale prices
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productIds = [], // Specific product IDs (empty = apply to filtered products)
      categoryIds = [], // Filter by categories
      discountType = "percentage", // "percentage" or "fixed"
      discountValue = 0, // Percentage (0-100) or fixed amount
      roundTo = 1000, // Round to nearest value (e.g., 1000 for KRW)
      minPrice = 0, // Minimum price filter
      maxPrice = 0, // Maximum price filter (0 = no limit)
      dateOnSaleFrom = null, // Sale start date
      dateOnSaleTo = null, // Sale end date
    } = body;

    if (discountValue <= 0) {
      return NextResponse.json(
        { error: "Discount value must be greater than 0" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = {};

    if (productIds.length > 0) {
      where.id = { in: productIds };
    }

    if (categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: categoryIds },
        },
      };
    }

    if (minPrice > 0) {
      where.price = { ...((where.price as object) || {}), gte: minPrice };
    }

    if (maxPrice > 0) {
      where.price = { ...((where.price as object) || {}), lte: maxPrice };
    }

    // Get products to update
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        regularPrice: true,
      },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No products found matching criteria" },
        { status: 404 }
      );
    }

    // Calculate and apply sale prices
    const results = {
      updated: 0,
      skipped: 0,
      products: [] as Array<{
        id: string;
        name: string;
        originalPrice: number;
        salePrice: number;
        discount: number;
      }>,
    };

    for (const product of products) {
      const originalPrice = product.regularPrice || product.price;
      let salePrice: number;

      if (discountType === "percentage") {
        salePrice = originalPrice * (1 - discountValue / 100);
      } else {
        salePrice = originalPrice - discountValue;
      }

      // Round to nearest value
      if (roundTo > 0) {
        salePrice = Math.round(salePrice / roundTo) * roundTo;
      }

      // Ensure sale price is positive and less than original
      if (salePrice <= 0 || salePrice >= originalPrice) {
        results.skipped++;
        continue;
      }

      // Update product
      await prisma.product.update({
        where: { id: product.id },
        data: {
          salePrice,
          regularPrice: originalPrice,
          price: salePrice,
          onSale: true,
          dateOnSaleFrom: dateOnSaleFrom ? new Date(dateOnSaleFrom) : null,
          dateOnSaleTo: dateOnSaleTo ? new Date(dateOnSaleTo) : null,
        },
      });

      results.updated++;
      results.products.push({
        id: product.id,
        name: product.name,
        originalPrice,
        salePrice,
        discount: Math.round((1 - salePrice / originalPrice) * 100),
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "bulk_sale_applied",
        objectType: "product",
        details: JSON.stringify({
          discountType,
          discountValue,
          productsUpdated: results.updated,
          productsSkipped: results.skipped,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Bulk sale error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to apply bulk sale" },
      { status: 500 }
    );
  }
}

// DELETE - Remove sale prices from products
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productIds = [], // Specific product IDs (empty = remove from all on-sale products)
      categoryIds = [], // Filter by categories
    } = body;

    // Build where clause
    const where: Record<string, unknown> = {
      onSale: true,
    };

    if (productIds.length > 0) {
      where.id = { in: productIds };
    }

    if (categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: categoryIds },
        },
      };
    }

    // Get products to update
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        regularPrice: true,
        price: true,
      },
    });

    // Remove sale prices
    let updated = 0;
    for (const product of products) {
      const originalPrice = product.regularPrice || product.price;
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          salePrice: null,
          price: originalPrice,
          onSale: false,
          dateOnSaleFrom: null,
          dateOnSaleTo: null,
        },
      });
      updated++;
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "bulk_sale_removed",
        objectType: "product",
        details: JSON.stringify({
          productsUpdated: updated,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (error) {
    console.error("Remove sale error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove sale prices" },
      { status: 500 }
    );
  }
}
