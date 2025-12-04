import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search - Search products
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const sortBy = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '20');

  try {
    // Build where clause
    const where: any = {
      status: 'publish',
    };

    // Search by query
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { shortDescription: { contains: query } },
        { sku: { contains: query } },
      ];
    }

    // Filter by category
    if (category) {
      where.categories = {
        some: {
          categoryId: category,
        },
      };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.AND = where.AND || [];
      if (minPrice) {
        where.AND.push({
          OR: [
            { salePrice: { gte: parseFloat(minPrice) } },
            { AND: [{ salePrice: null }, { price: { gte: parseFloat(minPrice) } }] },
          ],
        });
      }
      if (maxPrice) {
        where.AND.push({
          OR: [
            { salePrice: { lte: parseFloat(maxPrice) } },
            { AND: [{ salePrice: null }, { price: { lte: parseFloat(maxPrice) } }] },
          ],
        });
      }
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'popularity':
        orderBy = { ratingCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get total count
    const total = await prisma.product.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get products with images
    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { position: 'asc' },
          take: 1,
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy,
      skip,
      take: perPage,
    });

    // Get all categories for facets (only those with matching products)
    const allCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: {
                product: {
                  status: 'publish',
                  ...(query ? {
                    OR: [
                      { name: { contains: query } },
                      { description: { contains: query } },
                      { shortDescription: { contains: query } },
                      { sku: { contains: query } },
                    ],
                  } : {}),
                },
              },
            },
          },
        },
      },
    });

    const categoryFacets = allCategories
      .filter((cat: typeof allCategories[0]) => cat._count.products > 0)
      .map((cat: typeof allCategories[0]) => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.products,
      }));

    // Get price range from all matching products
    const priceStats = await prisma.product.aggregate({
      where: { status: 'publish' },
      _min: { price: true },
      _max: { price: true },
    });

    return NextResponse.json({
      data: products.map((p: typeof products[0]) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        onSale: p.onSale,
        image: p.images[0]?.src || null,
        averageRating: p.averageRating,
        ratingCount: p.ratingCount,
      })),
      meta: {
        total,
        page,
        perPage,
        totalPages,
        query,
      },
      facets: {
        categories: categoryFacets,
        priceRange: {
          min: priceStats._min.price || 0,
          max: priceStats._max.price || 0,
        },
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
