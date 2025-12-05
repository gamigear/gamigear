import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/api-auth";

// Helper function to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required" 
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }
  return null;
}

// POST - Apply bulk sale prices (Admin only)
export async function POST(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

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

    // Must have at least productIds or categoryIds
    if (productIds.length === 0 && categoryIds.length === 0) {
      return NextResponse.json(
        { error: "Please select products or categories to apply discount" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = {
      status: "publish", // Only apply to published products
    };

    // If productIds provided, use them directly (ignore categoryIds)
    if (productIds.length > 0) {
      where.id = { in: productIds };
    } else if (categoryIds.length > 0) {
      // Only use categoryIds if no specific products selected
      where.categories = {
        some: {
          categoryId: { in: categoryIds },
        },
      };
    }

    // Price filter - also include variable products with variations in price range
    if (minPrice > 0 || maxPrice > 0) {
      const priceConditions: Record<string, unknown>[] = [];
      
      // Simple products with price in range
      const simplePriceFilter: Record<string, unknown> = {
        productType: { not: "variable" },
      };
      if (minPrice > 0) {
        simplePriceFilter.price = { ...((simplePriceFilter.price as object) || {}), gte: minPrice };
      }
      if (maxPrice > 0) {
        simplePriceFilter.price = { ...((simplePriceFilter.price as object) || {}), lte: maxPrice };
      }
      priceConditions.push(simplePriceFilter);
      
      // Variable products with variations in price range
      const variationPriceFilter: Record<string, unknown> = {
        productType: "variable",
        variations: {
          some: {
            isActive: true,
            ...(minPrice > 0 ? { price: { gte: minPrice } } : {}),
            ...(maxPrice > 0 ? { price: { lte: maxPrice } } : {}),
          },
        },
      };
      priceConditions.push(variationPriceFilter);
      
      where.OR = priceConditions;
    }

    // Build variation filter
    const variationWhere: Record<string, unknown> = { isActive: true };
    if (minPrice > 0) {
      variationWhere.price = { ...((variationWhere.price as object) || {}), gte: minPrice };
    }
    if (maxPrice > 0) {
      variationWhere.price = { ...((variationWhere.price as object) || {}), lte: maxPrice };
    }

    // Get products to update (including variations for variable products)
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        regularPrice: true,
        productType: true,
        variations: {
          where: variationWhere,
          select: {
            id: true,
            price: true,
            regularPrice: true,
            isActive: true,
          },
        },
      },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No products found matching criteria" },
        { status: 404 }
      );
    }

    // Helper function to calculate sale price
    const calculateSalePrice = (originalPrice: number): number => {
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
      return Math.max(0, salePrice);
    };

    // Calculate and apply sale prices
    const results = {
      updated: 0,
      skipped: 0,
      variationsUpdated: 0,
      products: [] as Array<{
        id: string;
        name: string;
        originalPrice: number;
        salePrice: number;
        discount: number;
      }>,
    };

    for (const product of products) {
      // Handle variable products differently - price is in variations
      if (product.productType === "variable" && product.variations.length > 0) {
        let variationsUpdatedForProduct = 0;
        let lowestSalePrice = Infinity;
        let lowestOriginalPrice = Infinity;
        
        for (const variation of product.variations) {
          if (!variation.isActive) continue;
          
          const varOriginalPrice = variation.regularPrice || variation.price;
          if (varOriginalPrice <= 0) continue;
          
          const varSalePrice = calculateSalePrice(varOriginalPrice);
          
          if (varSalePrice > 0 && varSalePrice < varOriginalPrice) {
            await prisma.productVariation.update({
              where: { id: variation.id },
              data: {
                salePrice: varSalePrice,
                regularPrice: varOriginalPrice,
                price: varSalePrice,
                onSale: true,
              },
            });
            results.variationsUpdated++;
            variationsUpdatedForProduct++;
            
            // Track lowest prices for parent product
            if (varSalePrice < lowestSalePrice) {
              lowestSalePrice = varSalePrice;
            }
            if (varOriginalPrice < lowestOriginalPrice) {
              lowestOriginalPrice = varOriginalPrice;
            }
          }
        }
        
        // Update parent product with lowest variation prices
        if (variationsUpdatedForProduct > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              salePrice: lowestSalePrice,
              regularPrice: lowestOriginalPrice,
              price: lowestSalePrice,
              onSale: true,
              dateOnSaleFrom: dateOnSaleFrom ? new Date(dateOnSaleFrom) : null,
              dateOnSaleTo: dateOnSaleTo ? new Date(dateOnSaleTo) : null,
            },
          });
          
          results.updated++;
          results.products.push({
            id: product.id,
            name: product.name,
            originalPrice: lowestOriginalPrice,
            salePrice: lowestSalePrice,
            discount: Math.round((1 - lowestSalePrice / lowestOriginalPrice) * 100),
          });
        } else {
          results.skipped++;
        }
      } else {
        // Simple product - original logic
        const originalPrice = product.regularPrice || product.price;
        const salePrice = calculateSalePrice(originalPrice);

        // Ensure sale price is positive and less than original
        if (salePrice <= 0 || salePrice >= originalPrice) {
          results.skipped++;
          continue;
        }

        // Update main product
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
          variationsUpdated: results.variationsUpdated,
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

// PATCH - Hide sale prices when sale price equals regular price (Admin only)
export async function PATCH(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      productIds = [], // Specific product IDs (empty = check all products)
      categoryIds = [], // Filter by categories
    } = body;

    // Build where clause - find products where salePrice equals regularPrice or price
    const where: Record<string, unknown> = {
      status: "publish",
    };

    if (productIds.length > 0) {
      where.id = { in: productIds };
    } else if (categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: categoryIds },
        },
      };
    }

    // Get all products to check
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        regularPrice: true,
        salePrice: true,
        onSale: true,
        productType: true,
        variations: {
          select: {
            id: true,
            price: true,
            regularPrice: true,
            salePrice: true,
            onSale: true,
          },
        },
      },
    });

    let productsFixed = 0;
    let variationsFixed = 0;
    const fixedProducts: Array<{ id: string; name: string }> = [];

    for (const product of products) {
      const regularPrice = product.regularPrice || product.price;
      const salePrice = product.salePrice;
      
      // Check if sale price equals regular price (or no real discount)
      const needsFix = product.onSale && (
        salePrice === null || 
        salePrice === undefined || 
        salePrice >= regularPrice
      );

      if (needsFix) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            onSale: false,
            salePrice: null,
            price: regularPrice,
          },
        });
        productsFixed++;
        fixedProducts.push({ id: product.id, name: product.name });
      }

      // Check variations
      if (product.productType === "variable" && product.variations.length > 0) {
        for (const variation of product.variations) {
          const varRegularPrice = variation.regularPrice || variation.price;
          const varSalePrice = variation.salePrice;
          
          const varNeedsFix = variation.onSale && (
            varSalePrice === null || 
            varSalePrice === undefined || 
            varSalePrice >= varRegularPrice
          );

          if (varNeedsFix) {
            await prisma.productVariation.update({
              where: { id: variation.id },
              data: {
                onSale: false,
                salePrice: null,
                price: varRegularPrice,
              },
            });
            variationsFixed++;
          }
        }
      }
    }

    // Log activity
    if (productsFixed > 0 || variationsFixed > 0) {
      await prisma.activityLog.create({
        data: {
          action: "bulk_sale_fixed",
          objectType: "product",
          details: JSON.stringify({
            productsFixed,
            variationsFixed,
            reason: "Sale price equals or exceeds regular price",
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      productsFixed,
      variationsFixed,
      fixedProducts,
    });
  } catch (error) {
    console.error("Fix sale error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fix sale prices" },
      { status: 500 }
    );
  }
}

// DELETE - Remove sale prices from products (Admin only)
export async function DELETE(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      productIds = [], // Specific product IDs (empty = remove from all on-sale products)
      categoryIds = [], // Filter by categories
    } = body;

    // Must have at least productIds or categoryIds
    if (productIds.length === 0 && categoryIds.length === 0) {
      return NextResponse.json(
        { error: "Please select products or categories to remove discount" },
        { status: 400 }
      );
    }

    // Build where clause - include products with onSale OR have variations with onSale
    const where: Record<string, unknown> = {
      OR: [
        { onSale: true },
        { variations: { some: { onSale: true } } },
      ],
    };

    // If productIds provided, use them directly (ignore categoryIds)
    if (productIds.length > 0) {
      where.id = { in: productIds };
    } else if (categoryIds.length > 0) {
      // Only use categoryIds if no specific products selected
      where.categories = {
        some: {
          categoryId: { in: categoryIds },
        },
      };
    }

    // Get products to update (including variations)
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        regularPrice: true,
        price: true,
        productType: true,
        onSale: true,
        variations: {
          select: {
            id: true,
            regularPrice: true,
            price: true,
            onSale: true,
          },
        },
      },
    });

    // Remove sale prices
    let updated = 0;
    let variationsUpdated = 0;
    
    for (const product of products) {
      // Handle variable products
      if (product.productType === "variable" && product.variations.length > 0) {
        let hasVariationOnSale = false;
        let lowestRegularPrice = Infinity;
        
        for (const variation of product.variations) {
          if (variation.onSale) {
            const varOriginalPrice = variation.regularPrice || variation.price;
            await prisma.productVariation.update({
              where: { id: variation.id },
              data: {
                salePrice: null,
                price: varOriginalPrice,
                onSale: false,
              },
            });
            variationsUpdated++;
            hasVariationOnSale = true;
          }
          // Track lowest regular price for parent
          const varRegPrice = variation.regularPrice || variation.price;
          if (varRegPrice > 0 && varRegPrice < lowestRegularPrice) {
            lowestRegularPrice = varRegPrice;
          }
        }
        
        // Update parent product
        if (hasVariationOnSale || product.onSale) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              salePrice: null,
              price: lowestRegularPrice === Infinity ? (product.regularPrice || product.price) : lowestRegularPrice,
              regularPrice: lowestRegularPrice === Infinity ? product.regularPrice : lowestRegularPrice,
              onSale: false,
              dateOnSaleFrom: null,
              dateOnSaleTo: null,
            },
          });
          updated++;
        }
      } else {
        // Simple product
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
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "bulk_sale_removed",
        objectType: "product",
        details: JSON.stringify({
          productsUpdated: updated,
          variationsUpdated,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      updated,
      variationsUpdated,
    });
  } catch (error) {
    console.error("Remove sale error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove sale prices" },
      { status: 500 }
    );
  }
}
