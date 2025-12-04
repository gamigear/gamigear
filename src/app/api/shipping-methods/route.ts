import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/shipping-methods
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const zoneId = searchParams.get("zoneId");
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (zoneId) where.zoneId = zoneId;
    if (activeOnly) where.isActive = true;

    const methods = await prisma.shippingMethod.findMany({
      where,
      orderBy: { position: "asc" },
      include: { zone: true },
    });

    return NextResponse.json({ data: methods });
  } catch (error) {
    console.error("Shipping methods API error:", error);
    return NextResponse.json({ error: "Failed to fetch shipping methods" }, { status: 500 });
  }
}

// POST /api/shipping-methods
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      zoneId, name, nameEn, nameKo, description, type, 
      cost = 0, minAmount, maxAmount, estimatedDays, isActive = true, position = 0 
    } = body;

    if (!zoneId || !name || !type) {
      return NextResponse.json(
        { error: "Zone ID, name, and type are required" },
        { status: 400 }
      );
    }

    const method = await prisma.shippingMethod.create({
      data: {
        zoneId, name, nameEn, nameKo, description, type, cost,
        minAmount: minAmount || null,
        maxAmount: maxAmount || null,
        estimatedDays, isActive, position,
      },
      include: { zone: true },
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    console.error("Create shipping method error:", error);
    return NextResponse.json({ error: "Failed to create shipping method" }, { status: 500 });
  }
}
