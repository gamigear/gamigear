import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/currencies/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currency = await prisma.currency.findUnique({ where: { id } });
    if (!currency) {
      return NextResponse.json({ error: "Currency not found" }, { status: 404 });
    }
    return NextResponse.json(currency);
  } catch (error) {
    console.error("Get currency error:", error);
    return NextResponse.json({ error: "Failed to fetch currency" }, { status: 500 });
  }
}

// PUT /api/currencies/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      code, name, symbol, symbolPosition, exchangeRate, decimalPlaces,
      thousandSep, decimalSep, isBase, isActive, position 
    } = body;

    // Check code uniqueness
    if (code) {
      const existing = await prisma.currency.findFirst({
        where: { code: code.toUpperCase(), NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Currency code already exists" }, { status: 400 });
      }
    }

    // If setting as base, unset other base currencies
    if (isBase === true) {
      await prisma.currency.updateMany({ where: { isBase: true, NOT: { id } }, data: { isBase: false } });
    }

    const currency = await prisma.currency.update({
      where: { id },
      data: {
        ...(code !== undefined && { code: code.toUpperCase() }),
        ...(name !== undefined && { name }),
        ...(symbol !== undefined && { symbol }),
        ...(symbolPosition !== undefined && { symbolPosition }),
        ...(exchangeRate !== undefined && { exchangeRate }),
        ...(decimalPlaces !== undefined && { decimalPlaces }),
        ...(thousandSep !== undefined && { thousandSep }),
        ...(decimalSep !== undefined && { decimalSep }),
        ...(isBase !== undefined && { isBase }),
        ...(isActive !== undefined && { isActive }),
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(currency);
  } catch (error) {
    console.error("Update currency error:", error);
    return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
  }
}

// DELETE /api/currencies/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if it's base currency
    const currency = await prisma.currency.findUnique({ where: { id } });
    if (currency?.isBase) {
      return NextResponse.json({ error: "Cannot delete base currency" }, { status: 400 });
    }

    await prisma.currency.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete currency error:", error);
    return NextResponse.json({ error: "Failed to delete currency" }, { status: 500 });
  }
}
