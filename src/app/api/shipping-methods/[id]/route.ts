import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/shipping-methods/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const method = await prisma.shippingMethod.findUnique({
      where: { id },
      include: { zone: true },
    });

    if (!method) {
      return NextResponse.json({ error: "Shipping method not found" }, { status: 404 });
    }
    return NextResponse.json(method);
  } catch (error) {
    console.error("Get shipping method error:", error);
    return NextResponse.json({ error: "Failed to fetch shipping method" }, { status: 500 });
  }
}

// PUT /api/shipping-methods/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, nameEn, nameKo, description, type, cost, minAmount, maxAmount, estimatedDays, isActive, position } = body;

    const method = await prisma.shippingMethod.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(nameKo !== undefined && { nameKo }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(cost !== undefined && { cost }),
        ...(minAmount !== undefined && { minAmount: minAmount || null }),
        ...(maxAmount !== undefined && { maxAmount: maxAmount || null }),
        ...(estimatedDays !== undefined && { estimatedDays }),
        ...(isActive !== undefined && { isActive }),
        ...(position !== undefined && { position }),
      },
      include: { zone: true },
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error("Update shipping method error:", error);
    return NextResponse.json({ error: "Failed to update shipping method" }, { status: 500 });
  }
}

// DELETE /api/shipping-methods/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.shippingMethod.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete shipping method error:", error);
    return NextResponse.json({ error: "Failed to delete shipping method" }, { status: 500 });
  }
}
