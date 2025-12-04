import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/banner-categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.bannerCategory.findUnique({
      where: { id },
      include: {
        banners: {
          orderBy: { position: "asc" },
        },
        _count: {
          select: { banners: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Banner category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Get banner category error:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner category" },
      { status: 500 }
    );
  }
}

// PUT /api/banner-categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, position, isActive } = body;

    // Check if slug already exists (excluding current category)
    if (slug) {
      const existing = await prisma.bannerCategory.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.bannerCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update banner category error:", error);
    return NextResponse.json(
      { error: "Failed to update banner category" },
      { status: 500 }
    );
  }
}

// DELETE /api/banner-categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category has banners
    const category = await prisma.bannerCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { banners: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Banner category not found" },
        { status: 404 }
      );
    }

    // Delete the category (banners will have categoryId set to null due to onDelete: SetNull)
    await prisma.bannerCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete banner category error:", error);
    return NextResponse.json(
      { error: "Failed to delete banner category" },
      { status: 500 }
    );
  }
}
