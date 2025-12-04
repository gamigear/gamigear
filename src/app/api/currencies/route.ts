import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/currencies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const currencies = await prisma.currency.findMany({
      where,
      orderBy: [{ isBase: "desc" }, { position: "asc" }],
    });

    return NextResponse.json({ data: currencies });
  } catch (error) {
    console.error("Currencies API error:", error);
    return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 });
  }
}

// POST /api/currencies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      code, name, symbol, symbolPosition = "after", exchangeRate = 1, 
      decimalPlaces = 0, thousandSep = ".", decimalSep = ",",
      isBase = false, isActive = true, position = 0 
    } = body;

    if (!code || !name || !symbol) {
      return NextResponse.json({ error: "Code, name, and symbol are required" }, { status: 400 });
    }

    const existing = await prisma.currency.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "Currency code already exists" }, { status: 400 });
    }

    // If setting as base, unset other base currencies
    if (isBase) {
      await prisma.currency.updateMany({ where: { isBase: true }, data: { isBase: false } });
    }

    const currency = await prisma.currency.create({
      data: {
        code: code.toUpperCase(),
        name, symbol, symbolPosition, exchangeRate, decimalPlaces,
        thousandSep, decimalSep, isBase, isActive, position,
      },
    });

    return NextResponse.json(currency, { status: 201 });
  } catch (error) {
    console.error("Create currency error:", error);
    return NextResponse.json({ error: "Failed to create currency" }, { status: 500 });
  }
}
