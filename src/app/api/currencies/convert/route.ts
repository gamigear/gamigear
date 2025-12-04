import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/currencies/convert?amount=100000&from=VND&to=USD
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const amount = parseFloat(searchParams.get("amount") || "0");
    const fromCode = searchParams.get("from")?.toUpperCase() || "VND";
    const toCode = searchParams.get("to")?.toUpperCase() || "USD";

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const [fromCurrency, toCurrency] = await Promise.all([
      prisma.currency.findUnique({ where: { code: fromCode } }),
      prisma.currency.findUnique({ where: { code: toCode } }),
    ]);

    if (!fromCurrency || !toCurrency) {
      return NextResponse.json({ error: "Currency not found" }, { status: 404 });
    }

    // Convert: amount in fromCurrency -> VND -> toCurrency
    // fromCurrency.exchangeRate = how many VND per 1 unit of fromCurrency
    // toCurrency.exchangeRate = how many VND per 1 unit of toCurrency
    const amountInVND = amount * fromCurrency.exchangeRate;
    const convertedAmount = amountInVND / toCurrency.exchangeRate;

    return NextResponse.json({
      from: {
        code: fromCurrency.code,
        amount,
        formatted: formatCurrency(amount, fromCurrency),
      },
      to: {
        code: toCurrency.code,
        amount: convertedAmount,
        formatted: formatCurrency(convertedAmount, toCurrency),
      },
      rate: fromCurrency.exchangeRate / toCurrency.exchangeRate,
    });
  } catch (error) {
    console.error("Currency convert error:", error);
    return NextResponse.json({ error: "Failed to convert currency" }, { status: 500 });
  }
}

function formatCurrency(amount: number, currency: any): string {
  const fixed = amount.toFixed(currency.decimalPlaces);
  const [intPart, decPart] = fixed.split(".");
  
  // Add thousand separators
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSep);
  const formattedAmount = decPart ? `${formattedInt}${currency.decimalSep}${decPart}` : formattedInt;
  
  return currency.symbolPosition === "before" 
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount}${currency.symbol}`;
}
