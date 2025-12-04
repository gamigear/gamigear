import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'publish';
    const featured = searchParams.get('featured');
    const onSale = searchParams.get('on_sale');
    const sort = searchParams.get('sort');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const ids = searchParams.get('ids');

    // Build where clause
    const where: any = {};

    // Filter by specific IDs
    if (ids) {
      const idArray = ids.split(',').filter(Boolean);
      if (idArray.length > 0) {
        where.id = { in: idArray };
      }
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }

    if (featured !== null && featured !== undefined && featured !== '') {
      where.featured = featured === 'true';
    }

    if (onSale === 'true') {
      where.onSale = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    // Build orderBy based on sort parameter
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-high') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { ratingCount: 'desc' };
    }

    // Get total count
    const total = await prisma.product.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get products with relations
    const products = await prisma.product.findMany({
      where,
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
      },
      orderBy,
      skip,
      take: perPage,
    });

    // Transform data
    const transformedProducts = products.map((product: any) => ({
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
      stockQuantity: product.stockQuantity,
      stockStatus: product.stockStatus,
      averageRating: product.averageRating,
      ratingCount: product.ratingCount,
      images: product.images,
      categories: product.categories.map((pc: any) => pc.category),
      tags: product.tags.map((pt: any) => pt.tag),
      brand: product.brand,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data: transformedProducts,
      meta: {
        total,
        page,
        perPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      sku,
      regularPrice,
      salePrice,
      status = 'draft',
      featured = false,
      categoryId,
      categoryIds = [],
      tagIds = [],
      images = [],
      attributes = [],
      manageStock = false,
      stockQuantity = 0,
      stockStatus = 'instock',
      weight,
      length,
      width,
      height,
      metaTitle,
      metaDescription,
      brandId,
      // Affiliate fields
      productType = 'simple',
      affiliateUrl,
      affiliatePlatform,
      affiliateButtonText,
    } = body;

    const finalPrice = salePrice || regularPrice;
    const onSale = salePrice && salePrice < regularPrice;

    // Create product with transaction
    const product = await prisma.$transaction(async (tx: any) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          name,
          slug: slug || (await import('@/lib/slug')).generateSlug(name),
          description,
          shortDescription,
          sku,
          price: finalPrice,
          regularPrice,
          salePrice,
          onSale,
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
          brandId,
          // Affiliate fields
          productType,
          affiliateUrl,
          affiliatePlatform,
          affiliateButtonText,
        },
      });

      // Add images - support both array of strings and array of objects
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img: string | { src: string; alt?: string }, index: number) => ({
            productId: newProduct.id,
            src: typeof img === 'string' ? img : img.src,
            alt: typeof img === 'string' ? name : (img.alt || name),
            position: index,
          })),
        });
      }

      // Add category (single)
      if (categoryId) {
        await tx.productCategory.create({
          data: {
            productId: newProduct.id,
            categoryId,
          },
        });
      }

      // Add categories (multiple)
      if (categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: categoryIds.map((catId: string) => ({
            productId: newProduct.id,
            categoryId: catId,
          })),
        });
      }

      // Add tags
      if (tagIds.length > 0) {
        await tx.productTag.createMany({
          data: tagIds.map((tagId: string) => ({
            productId: newProduct.id,
            tagId,
          })),
        });
      }

      // Add attributes
      if (attributes.length > 0) {
        await tx.productAttribute.createMany({
          data: attributes.map((attr: any, index: number) => ({
            productId: newProduct.id,
            name: attr.name,
            value: attr.value,
            position: index,
            visible: attr.visible ?? true,
            variation: attr.variation ?? false,
          })),
        });
      }

      return newProduct;
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'product_created',
        objectType: 'product',
        objectId: product.id,
        details: JSON.stringify({ name: product.name }),
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
