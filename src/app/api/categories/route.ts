import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');

    // Get total count
    const total = await prisma.category.count();
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get categories
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
        parent: {
          select: { id: true, name: true },
        },
      },
      orderBy: { menuOrder: 'asc' },
      skip,
      take: perPage,
    });

    // Transform data
    const transformedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId,
      parent: cat.parent,
      count: cat._count.products,
      menuOrder: cat.menuOrder,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data: transformedCategories,
      meta: { total, page, perPage, totalPages },
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, image, parentId } = body;

    const { generateSlug } = await import('@/lib/slug');
    
    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: slug || generateSlug(name) },
    });

    if (existing) {
      return NextResponse.json({ error: '이미 존재하는 슬러그입니다.' }, { status: 400 });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || generateSlug(name),
        description,
        image,
        parentId: parentId || null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'category_created',
        objectType: 'category',
        objectId: category.id,
        details: JSON.stringify({ name: category.name }),
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
