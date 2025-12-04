import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// POST - Bulk edit products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productIds = [],
      action, // "update_content", "update_categories", "update_tags", "update_status"
      // Content update fields
      status,
      featured,
      description,
      shortDescription,
      // Category update
      categoryIds = [],
      categoryAction = "replace", // "replace", "add", "remove"
      // Tag update
      tagIds = [],
      tagAction = "replace", // "replace", "add", "remove"
    } = body;

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "No products selected" },
        { status: 400 }
      );
    }

    let updated = 0;

    switch (action) {
      case "update_content": {
        // Build update data
        const updateData: Record<string, unknown> = {};
        if (status !== undefined) updateData.status = status;
        if (featured !== undefined) updateData.featured = featured;
        if (description !== undefined) updateData.description = description;
        if (shortDescription !== undefined) updateData.shortDescription = shortDescription;

        if (Object.keys(updateData).length === 0) {
          return NextResponse.json(
            { error: "No fields to update" },
            { status: 400 }
          );
        }

        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: updateData,
        });
        updated = result.count;
        break;
      }

      case "update_categories": {
        if (categoryIds.length === 0 && categoryAction !== "remove") {
          return NextResponse.json(
            { error: "No categories selected" },
            { status: 400 }
          );
        }

        for (const productId of productIds) {
          if (categoryAction === "replace") {
            // Remove all existing categories
            await prisma.productCategory.deleteMany({
              where: { productId },
            });
            // Add new categories
            if (categoryIds.length > 0) {
              for (const categoryId of categoryIds) {
                await prisma.productCategory.upsert({
                  where: { productId_categoryId: { productId, categoryId } },
                  update: {},
                  create: { productId, categoryId },
                });
              }
            }
          } else if (categoryAction === "add") {
            // Add categories (skip duplicates)
            for (const categoryId of categoryIds) {
              await prisma.productCategory.upsert({
                where: { productId_categoryId: { productId, categoryId } },
                update: {},
                create: { productId, categoryId },
              });
            }
          } else if (categoryAction === "remove") {
            // Remove specific categories
            await prisma.productCategory.deleteMany({
              where: {
                productId,
                categoryId: { in: categoryIds },
              },
            });
          }
          updated++;
        }
        break;
      }

      case "update_tags": {
        if (tagIds.length === 0 && tagAction !== "remove") {
          return NextResponse.json(
            { error: "No tags selected" },
            { status: 400 }
          );
        }

        for (const productId of productIds) {
          if (tagAction === "replace") {
            // Remove all existing tags
            await prisma.productTag.deleteMany({
              where: { productId },
            });
            // Add new tags
            if (tagIds.length > 0) {
              for (const tagId of tagIds) {
                await prisma.productTag.upsert({
                  where: { productId_tagId: { productId, tagId } },
                  update: {},
                  create: { productId, tagId },
                });
              }
            }
          } else if (tagAction === "add") {
            // Add tags (skip duplicates)
            for (const tagId of tagIds) {
              await prisma.productTag.upsert({
                where: { productId_tagId: { productId, tagId } },
                update: {},
                create: { productId, tagId },
              });
            }
          } else if (tagAction === "remove") {
            // Remove specific tags
            await prisma.productTag.deleteMany({
              where: {
                productId,
                tagId: { in: tagIds },
              },
            });
          }
          updated++;
        }
        break;
      }

      case "update_status": {
        if (!status) {
          return NextResponse.json(
            { error: "Status is required" },
            { status: 400 }
          );
        }

        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status },
        });
        updated = result.count;
        break;
      }

      case "delete": {
        // Delete products
        const result = await prisma.product.deleteMany({
          where: { id: { in: productIds } },
        });
        updated = result.count;
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: `bulk_${action}`,
        objectType: "product",
        details: JSON.stringify({
          action,
          productsUpdated: updated,
          productIds: productIds.slice(0, 10), // Log first 10 IDs
        }),
      },
    });

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (error) {
    console.error("Bulk edit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to bulk edit" },
      { status: 500 }
    );
  }
}
