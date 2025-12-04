import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/pages/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await prisma.page.findUnique({
      where: { id },
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
            status: true,
          },
          orderBy: { menuOrder: 'asc' },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    const transformedPage = {
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt,
      featuredImage: page.featuredImage,
      status: page.status,
      visibility: page.visibility,
      template: page.template,
      menuOrder: page.menuOrder,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      commentStatus: page.commentStatus,
      author: page.author,
      parent: page.parent,
      children: page.children,
      publishedAt: page.publishedAt?.toISOString(),
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedPage);
  } catch (error) {
    console.error('Get page error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      visibility,
      password,
      parentId,
      menuOrder,
      template,
      metaTitle,
      metaDescription,
      commentStatus,
      publishedAt,
    } = body;

    // Check if page exists
    const existing = await prisma.page.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Check if slug is taken by another page
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.page.findUnique({
        where: { slug },
      });
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prevent circular parent reference
    if (parentId === id) {
      return NextResponse.json(
        { error: 'Page cannot be its own parent' },
        { status: 400 }
      );
    }

    // Determine publishedAt
    let newPublishedAt = existing.publishedAt;
    if (status === 'publish' && !existing.publishedAt) {
      newPublishedAt = publishedAt ? new Date(publishedAt) : new Date();
    } else if (publishedAt) {
      newPublishedAt = new Date(publishedAt);
    }

    // Update page
    const page = await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        visibility,
        password: visibility === 'password' ? password : null,
        parentId,
        menuOrder,
        template,
        metaTitle,
        metaDescription,
        commentStatus,
        publishedAt: newPublishedAt,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'page_updated',
        objectType: 'page',
        objectId: page.id,
        details: JSON.stringify({ title: page.title, status: page.status }),
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Update page error:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await prisma.page.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    await prisma.page.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'page_deleted',
        objectType: 'page',
        objectId: id,
        details: JSON.stringify({ title: page.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
