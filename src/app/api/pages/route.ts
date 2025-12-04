import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/pages
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const parent = searchParams.get('parent');
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (parent !== null && parent !== undefined) {
      where.parentId = parent === 'null' ? null : parent;
    }

    if (author) {
      where.authorId = author;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.page.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get pages
    const pages = await prisma.page.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
          orderBy: { menuOrder: 'asc' },
        },
      },
      orderBy: [
        { menuOrder: 'asc' },
        { title: 'asc' },
      ],
      skip,
      take: perPage,
    });

    // Transform data
    const transformedPages = pages.map((pg) => ({
      id: pg.id,
      title: pg.title,
      slug: pg.slug,
      excerpt: pg.excerpt,
      featuredImage: pg.featuredImage,
      status: pg.status,
      visibility: pg.visibility,
      template: pg.template,
      menuOrder: pg.menuOrder,
      author: pg.author,
      parent: pg.parent,
      children: pg.children,
      publishedAt: pg.publishedAt?.toISOString(),
      createdAt: pg.createdAt.toISOString(),
      updatedAt: pg.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data: transformedPages,
      meta: {
        total,
        page,
        perPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Pages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/pages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status = 'draft',
      visibility = 'public',
      password,
      authorId,
      parentId,
      menuOrder = 0,
      template = 'default',
      metaTitle,
      metaDescription,
      commentStatus = 'closed',
      publishedAt,
    } = body;

    // Generate slug if not provided
    const { generateSlug } = await import('@/lib/slug');
    const pageSlug = slug || generateSlug(title);

    // Check if slug exists
    const existingSlug = await prisma.page.findUnique({
      where: { slug: pageSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create page
    const page = await prisma.page.create({
      data: {
        title,
        slug: pageSlug,
        content,
        excerpt,
        featuredImage,
        status,
        visibility,
        password: visibility === 'password' ? password : null,
        authorId,
        parentId,
        menuOrder,
        template,
        metaTitle,
        metaDescription,
        commentStatus,
        publishedAt: status === 'publish' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'page_created',
        objectType: 'page',
        objectId: page.id,
        details: JSON.stringify({ title: page.title, status: page.status }),
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Create page error:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
