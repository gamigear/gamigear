import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/post-categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // @ts-expect-error - Prisma client types may not be updated
    const category = await prisma.postCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...category,
        count: category._count.posts,
      },
    });
  } catch (error) {
    console.error('Get post category error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post category' },
      { status: 500 }
    );
  }
}

// PUT /api/post-categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, image, parentId } = body;

    // @ts-expect-error - Prisma client types may not be updated
    const category = await prisma.postCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
      },
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error('Update post category error:', error);
    return NextResponse.json(
      { error: 'Failed to update post category' },
      { status: 500 }
    );
  }
}

// DELETE /api/post-categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category has posts
    // @ts-expect-error - Prisma client types may not be updated
    const postsCount = await prisma.postCategoryRelation.count({
      where: { categoryId: id },
    });

    if (postsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with posts. Remove posts first.' },
        { status: 400 }
      );
    }

    // Delete category
    // @ts-expect-error - Prisma client types may not be updated
    await prisma.postCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post category' },
      { status: 500 }
    );
  }
}
