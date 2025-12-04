import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/shipping-zones/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const zone = await prisma.shippingZone.findUnique({
      where: { id },
      include: {
        locations: { orderBy: { name: "asc" } },
        methods: { orderBy: { position: "asc" } },
      },
    });

    if (!zone) {
      return NextResponse.json({ error: "Shipping zone not found" }, { status: 404 });
    }
    return NextResponse.json(zone);
  } catch (error) {
    console.error("Get shipping zone error:", error);
    return NextResponse.json({ error: "Failed to fetch shipping zone" }, { status: 500 });
  }
}

// PUT /api/shipping-zones/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, type, priority, isActive } = body;

    if (slug) {
      const existing = await prisma.shippingZone.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    const zone = await prisma.shippingZone.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(priority !== undefined && { priority }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { locations: true, methods: true },
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error("Update shipping zone error:", error);
    return NextResponse.json({ error: "Failed to update shipping zone" }, { status: 500 });
  }
}

// DELETE /api/shipping-zones/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.shippingZone.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete shipping zone error:", error);
    return NextResponse.json({ error: "Failed to delete shipping zone" }, { status: 500 });
  }
}
