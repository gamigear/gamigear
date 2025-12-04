import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/posts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
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
        comments: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      status: post.status,
      visibility: post.visibility,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      commentStatus: post.commentStatus,
      author: post.author,
      categories: post.categories.map((pc) => pc.category),
      tags: post.tags.map((pt) => pt.tag),
      comments: post.comments,
      commentCount: post._count.comments,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id]
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
      categoryIds,
      tagIds,
      metaTitle,
      metaDescription,
      commentStatus,
      publishedAt,
    } = body;

    // Check if post exists
    const existing = await prisma.post.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if slug is taken by another post
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.post.findUnique({
        where: { slug },
      });
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update post with transaction
    const post = await prisma.$transaction(async (tx) => {
      // Determine publishedAt
      let newPublishedAt = existing.publishedAt;
      if (status === 'publish' && !existing.publishedAt) {
        newPublishedAt = publishedAt ? new Date(publishedAt) : new Date();
      } else if (publishedAt) {
        newPublishedAt = new Date(publishedAt);
      }

      const updatedPost = await tx.post.update({
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
          metaTitle,
          metaDescription,
          commentStatus,
          publishedAt: newPublishedAt,
        },
      });

      // Update categories if provided
      if (categoryIds !== undefined) {
        await tx.postCategoryRelation.deleteMany({ where: { postId: id } });
        if (categoryIds.length > 0) {
          await tx.postCategoryRelation.createMany({
            data: categoryIds.map((categoryId: string) => ({
              postId: id,
              categoryId,
            })),
          });
        }
      }

      // Update tags if provided
      if (tagIds !== undefined) {
        await tx.postTagRelation.deleteMany({ where: { postId: id } });
        if (tagIds.length > 0) {
          await tx.postTagRelation.createMany({
            data: tagIds.map((tagId: string) => ({
              postId: id,
              tagId,
            })),
          });
        }
      }

      return updatedPost;
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'post_updated',
        objectType: 'post',
        objectId: post.id,
        details: JSON.stringify({ title: post.title, status: post.status }),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    await prisma.post.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'post_deleted',
        objectType: 'post',
        objectId: id,
        details: JSON.stringify({ title: post.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
