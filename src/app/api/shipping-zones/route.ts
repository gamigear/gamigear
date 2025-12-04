import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/shipping-zones
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const zones = await prisma.shippingZone.findMany({
      where,
      orderBy: { priority: "asc" },
      include: {
        locations: {
          where: activeOnly ? { isActive: true } : undefined,
          orderBy: { name: "asc" },
        },
        methods: {
          where: activeOnly ? { isActive: true } : undefined,
          orderBy: { position: "asc" },
        },
        _count: {
          select: { locations: true, methods: true },
        },
      },
    });

    return NextResponse.json({ data: zones });
  } catch (error) {
    console.error("Shipping zones API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping zones" },
      { status: 500 }
    );
  }
}

// POST /api/shipping-zones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, type, priority = 0, isActive = true } = body;

    if (!name || !slug || !type) {
      return NextResponse.json(
        { error: "Name, slug, and type are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.shippingZone.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const zone = await prisma.shippingZone.create({
      data: { name, slug, description, type, priority, isActive },
      include: { locations: true, methods: true },
    });

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error("Create shipping zone error:", error);
    return NextResponse.json(
      { error: "Failed to create shipping zone" },
      { status: 500 }
    );
  }
}
