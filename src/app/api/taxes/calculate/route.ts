import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// POST /api/taxes/calculate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, state, postcode, city, subtotal, shippingTotal = 0 } = body;

    if (!country || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Country and subtotal are required' },
        { status: 400 }
      );
    }

    // Find matching tax rates
    const taxRates = await prisma.taxRate.findMany({
      where: {
        OR: [
          // Exact match
          {
            country,
            state: state || '*',
            postcode: postcode || '*',
            city: city || '*',
          },
          // Country + state match
          {
            country,
            state: state || '*',
            postcode: '*',
            city: '*',
          },
          // Country only match
          {
            country,
            state: '*',
            postcode: '*',
            city: '*',
          },
        ],
      },
      orderBy: [
        { priority: 'asc' },
        { order: 'asc' },
      ],
    });

    if (taxRates.length === 0) {
      return NextResponse.json({
        taxTotal: 0,
        rates: [],
        breakdown: [],
      });
    }

    // Calculate taxes
    let taxTotal = 0;
    const breakdown: Array<{
      name: string;
      rate: number;
      amount: number;
      compound: boolean;
    }> = [];

    // Group by priority
    const ratesByPriority = new Map<number, typeof taxRates>();
    for (const rate of taxRates) {
      if (!ratesByPriority.has(rate.priority)) {
        ratesByPriority.set(rate.priority, []);
      }
      ratesByPriority.get(rate.priority)!.push(rate);
    }

    // Sort priorities
    const priorities = Array.from(ratesByPriority.keys()).sort((a, b) => a - b);

    let taxableAmount = subtotal;

    for (const priority of priorities) {
      const rates = ratesByPriority.get(priority)!;
      
      for (const rate of rates) {
        let amount = 0;
        
        // Calculate base tax
        const baseAmount = rate.compound ? taxableAmount + taxTotal : taxableAmount;
        amount = Math.round(baseAmount * (rate.rate / 100));
        
        // Add shipping tax if applicable
        if (rate.shipping && shippingTotal > 0) {
          const shippingTax = Math.round(shippingTotal * (rate.rate / 100));
          amount += shippingTax;
        }
        
        taxTotal += amount;
        
        breakdown.push({
          name: rate.name,
          rate: rate.rate,
          amount,
          compound: rate.compound,
        });
      }
    }

    return NextResponse.json({
      taxTotal,
      rates: taxRates.map((r) => ({
        id: r.id,
        name: r.name,
        rate: r.rate,
      })),
      breakdown,
    });
  } catch (error) {
    console.error('Calculate tax error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    );
  }
}
