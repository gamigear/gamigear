import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/banner-categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const categories = await prisma.bannerCategory.findMany({
      where,
      orderBy: { position: "asc" },
      include: {
        _count: {
          select: { banners: true },
        },
      },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Banner categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner categories" },
      { status: 500 }
    );
  }
}

// POST /api/banner-categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, position = 0, isActive = true } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.bannerCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.bannerCategory.create({
      data: {
        name,
        slug,
        description,
        position,
        isActive,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Create banner category error:", error);
    return NextResponse.json(
      { error: "Failed to create banner category" },
      { status: 500 }
    );
  }
}
