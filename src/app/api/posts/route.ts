import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    // Build where clause
    const where: any = {};

    if (slug) {
      where.slug = slug;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (category) {
      where.categories = {
        some: {
          category: { slug: category },
        },
      };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    if (author) {
      where.authorId = author;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.post.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get posts
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: perPage,
    });

    // Transform data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedPosts = posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      status: post.status,
      visibility: post.visibility,
      author: post.author,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories: post.categories.map((pc: any) => pc.category),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tags: post.tags.map((pt: any) => pt.tag),
      commentCount: post._count.comments,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data: transformedPosts,
      meta: {
        total,
        page,
        perPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts
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
      categoryIds = [],
      tagIds = [],
      metaTitle,
      metaDescription,
      commentStatus = 'open',
      publishedAt,
    } = body;

    // Generate slug if not provided
    const { generateSlug } = await import('@/lib/slug');
    const postSlug = slug || generateSlug(title);

    // Check if slug exists
    const existingSlug = await prisma.post.findUnique({
      where: { slug: postSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create post with transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const post = await prisma.$transaction(async (tx: any) => {
      const newPost = await tx.post.create({
        data: {
          title,
          slug: postSlug,
          content,
          excerpt,
          featuredImage,
          status,
          visibility,
          password: visibility === 'password' ? password : null,
          authorId,
          metaTitle,
          metaDescription,
          commentStatus,
          publishedAt: status === 'publish' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
        },
      });

      // Add categories
      if (categoryIds.length > 0) {
        await tx.postCategoryRelation.createMany({
          data: categoryIds.map((categoryId: string) => ({
            postId: newPost.id,
            categoryId,
          })),
        });
      }

      // Add tags
      if (tagIds.length > 0) {
        await tx.postTagRelation.createMany({
          data: tagIds.map((tagId: string) => ({
            postId: newPost.id,
            tagId,
          })),
        });
      }

      return newPost;
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'post_created',
        objectType: 'post',
        objectId: post.id,
        details: JSON.stringify({ title: post.title, status: post.status }),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
