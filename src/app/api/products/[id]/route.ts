import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';

// Use any to avoid TypeScript issues with Prisma client
const db = prisma as any;

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await db.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        brand: true,
        attributes: {
          orderBy: { position: 'asc' },
        },
        relatedProducts: {
          include: {
            relatedProduct: {
              select: { id: true, name: true },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Transform data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku,
      price: product.price,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      onSale: product.onSale,
      status: product.status,
      featured: product.featured,
      manageStock: product.manageStock,
      stockQuantity: product.stockQuantity,
      stockStatus: product.stockStatus,
      weight: product.weight,
      length: product.length,
      width: product.width,
      height: product.height,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      averageRating: product.averageRating,
      ratingCount: product.ratingCount,
      images: product.images.map((img: any) => img.src),
      categoryId: product.categories[0]?.categoryId || null,
      categories: product.categories.map((pc: any) => pc.category),
      tags: product.tags.map((pt: any) => pt.tag),
      brand: product.brand,
      attributes: product.attributes,
      // Related products settings
      relatedProductsLimit: product.relatedProductsLimit,
      relatedProductsSource: product.relatedProductsSource,
      relatedProductIds: product.relatedProducts.map((rp: any) => rp.relatedId),
      relatedProducts: product.relatedProducts.map((rp: any) => rp.relatedProduct),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
    
    return NextResponse.json({ data: transformedProduct });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id] (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required" 
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      name,
      slug,
      description,
      shortDescription,
      sku,
      regularPrice,
      salePrice,
      status,
      featured,
      categoryId,
      manageStock,
      stockQuantity,
      stockStatus,
      weight,
      length,
      width,
      height,
      metaTitle,
      metaDescription,
      images = [],
      // Related products settings
      relatedProductsLimit,
      relatedProductsSource,
      relatedProductIds = [],
    } = body;

    // Update product with transaction
    const product = await db.$transaction(async (tx: any) => {
      // Update product
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          shortDescription,
          sku,
          price: salePrice || regularPrice,
          regularPrice,
          salePrice,
          onSale: salePrice && salePrice < regularPrice,
          status,
          featured,
          manageStock,
          stockQuantity,
          stockStatus,
          weight,
          length,
          width,
          height,
          metaTitle,
          metaDescription,
          // Related products settings
          ...(relatedProductsLimit !== undefined && { relatedProductsLimit }),
          ...(relatedProductsSource !== undefined && { relatedProductsSource }),
        },
      });

      // Update manual related products
      if (relatedProductIds && relatedProductIds.length >= 0) {
        // Delete existing related products
        await tx.relatedProduct.deleteMany({
          where: { productId: id },
        });
        
        // Add new related products
        if (relatedProductIds.length > 0) {
          await tx.relatedProduct.createMany({
            data: relatedProductIds.map((relatedId: string, index: number) => ({
              productId: id,
              relatedId,
              position: index,
            })),
          });
        }
      }

      // Update images
      if (images.length > 0) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { productId: id },
        });
        
        // Add new images
        await tx.productImage.createMany({
          data: images.map((src: string, index: number) => ({
            productId: id,
            src,
            alt: name,
            position: index,
          })),
        });
      }

      // Update category
      if (categoryId) {
        // Delete existing categories
        await tx.productCategory.deleteMany({
          where: { productId: id },
        });
        
        // Add new category
        await tx.productCategory.create({
          data: {
            productId: id,
            categoryId,
          },
        });
      }

      return updatedProduct;
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'product_updated',
        objectType: 'product',
        objectId: product.id,
        details: JSON.stringify({ name: product.name }),
      },
    });
    
    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required" 
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }

  try {
    const { id } = await params;
    
    // Delete product and related data
    await db.$transaction(async (tx: any) => {
      // Delete related data first
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productCategory.deleteMany({ where: { productId: id } });
      await tx.productTag.deleteMany({ where: { productId: id } });
      await tx.productAttribute.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      
      // Delete product
      await tx.product.delete({ where: { id } });
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'product_deleted',
        objectType: 'product',
        objectId: id,
        details: JSON.stringify({ id }),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
