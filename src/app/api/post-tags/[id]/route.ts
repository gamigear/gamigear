import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/post-tags/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // @ts-expect-error - Prisma client types may not be updated
    const tag = await prisma.postTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...tag,
        count: tag._count.posts,
      },
    });
  } catch (error) {
    console.error("Get post tag error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post tag" },
      { status: 500 }
    );
  }
}

// PUT /api/post-tags/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description } = body;

    // @ts-expect-error - Prisma client types may not be updated
    const tag = await prisma.postTag.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      },
    });

    return NextResponse.json({ data: tag });
  } catch (error) {
    console.error("Update post tag error:", error);
    return NextResponse.json(
      { error: "Failed to update post tag" },
      { status: 500 }
    );
  }
}

// DELETE /api/post-tags/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if tag has posts
    // @ts-expect-error - Prisma client types may not be updated
    const postsCount = await prisma.postTagRelation.count({
      where: { tagId: id },
    });

    if (postsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete tag with posts. Remove posts first." },
        { status: 400 }
      );
    }

    // @ts-expect-error - Prisma client types may not be updated
    await prisma.postTag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post tag error:", error);
    return NextResponse.json(
      { error: "Failed to delete post tag" },
      { status: 500 }
    );
  }
}
