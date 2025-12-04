import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/post-categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parent = searchParams.get('parent');
    const search = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (parent === 'null' || parent === '') {
      where.parentId = null;
    } else if (parent) {
      where.parentId = parent;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // @ts-expect-error - Prisma client types may not be updated
    const categories = await prisma.postCategory.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedCategories = categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId,
      parent: cat.parent,
      children: cat.children,
      count: cat._count.posts,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data: transformedCategories });
  } catch (error) {
    console.error('Post categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post categories' },
      { status: 500 }
    );
  }
}

// POST /api/post-categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, image, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { generateSlug } = await import('@/lib/slug');
    const finalSlug = slug || generateSlug(name);

    // @ts-expect-error - Prisma client types may not be updated
    const category = await prisma.postCategory.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        parentId: parentId || null,
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error('Create post category error:', error);
    return NextResponse.json(
      { error: 'Failed to create post category' },
      { status: 500 }
    );
  }
}
