import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/taxes
export async function GET() {
  try {
    // Get tax rates
    const taxRates = await prisma.taxRate.findMany({
      orderBy: [
        { priority: 'asc' },
        { order: 'asc' },
      ],
    });

    // Transform data
    const transformedRates = taxRates.map((rate) => ({
      id: rate.id,
      country: rate.country,
      state: rate.state,
      postcode: rate.postcode,
      city: rate.city,
      rate: rate.rate,
      name: rate.name,
      priority: rate.priority,
      compound: rate.compound,
      shipping: rate.shipping,
      order: rate.order,
      taxClass: rate.taxClass,
    }));

    return NextResponse.json({
      data: transformedRates,
    });
  } catch (error) {
    console.error('Taxes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax rates' },
      { status: 500 }
    );
  }
}

// POST /api/taxes - Create tax rate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      country,
      state = '*',
      postcode = '*',
      city = '*',
      rate,
      name,
      priority = 1,
      compound = false,
      shipping = true,
      taxClass = 'standard',
    } = body;

    if (!country || rate === undefined || !name) {
      return NextResponse.json(
        { error: 'Country, rate, and name are required' },
        { status: 400 }
      );
    }

    // Get max order
    const maxOrder = await prisma.taxRate.aggregate({
      _max: { order: true },
    });

    // Create tax rate
    const taxRate = await prisma.taxRate.create({
      data: {
        country,
        state,
        postcode,
        city,
        rate,
        name,
        priority,
        compound,
        shipping,
        order: (maxOrder._max.order || 0) + 1,
        taxClass,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'tax_rate_created',
        objectType: 'tax_rate',
        objectId: taxRate.id,
        details: JSON.stringify({ name: taxRate.name, rate: taxRate.rate }),
      },
    });

    return NextResponse.json(taxRate, { status: 201 });
  } catch (error) {
    console.error('Create tax rate error:', error);
    return NextResponse.json(
      { error: 'Failed to create tax rate' },
      { status: 500 }
    );
  }
}
