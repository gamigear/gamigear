import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';

// GET /api/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Support both id and slug lookup
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        parent: true,
        children: {
          orderBy: { menuOrder: 'asc' },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: {
                  take: 1,
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
          take: 10,
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Transform data
    const transformedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      parent: category.parent,
      children: category.children.map((child) => ({
        ...child,
        _count: { products: 0 }, // Will be populated if needed
      })),
      displayType: category.displayType,
      menuOrder: category.menuOrder,
      _count: { products: category._count.products },
      products: category.products.map((pc) => pc.product),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };

    return NextResponse.json({ data: transformedCategory });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] (Admin only)
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
    const { name, slug, description, image, parentId, displayType, menuOrder } = body;

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if slug is taken by another category
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.category.findUnique({
        where: { slug },
      });
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        parentId,
        displayType,
        menuOrder,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'category_updated',
        objectType: 'category',
        objectId: category.id,
        details: JSON.stringify({ name: category.name }),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] (Admin only)
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

    // Get category for logging
    const category = await prisma.category.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'category_deleted',
        objectType: 'category',
        objectId: id,
        details: JSON.stringify({ name: category.name }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
