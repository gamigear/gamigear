import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/post-tags
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const tags = await prisma.postTag.findMany({
      where,
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedTags = tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      count: tag._count.posts,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data: transformedTags });
  } catch (error) {
    console.error("Post tags API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post tags" },
      { status: 500 }
    );
  }
}

// POST /api/post-tags
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { generateSlug } = await import('@/lib/slug');
    const finalSlug = slug || generateSlug(name);

    const tag = await prisma.postTag.create({
      data: {
        name,
        slug: finalSlug,
        description,
      },
    });

    return NextResponse.json({ data: tag }, { status: 201 });
  } catch (error) {
    console.error("Create post tag error:", error);
    return NextResponse.json(
      { error: "Failed to create post tag" },
      { status: 500 }
    );
  }
}
