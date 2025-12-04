import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// POST /api/shipping/calculate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, state, postcode, cartTotal, items = [] } = body;

    if (!country) {
      return NextResponse.json(
        { error: 'Country is required' },
        { status: 400 }
      );
    }

    // Find matching shipping zone
    const zones = await prisma.shippingZone.findMany({
      include: {
        locations: true,
        methods: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { priority: 'asc' },
    });

    let matchedZone = null;

    for (const zone of zones) {
      for (const location of zone.locations) {
        // Check country match
        if (location.type === 'country' && location.code === country) {
          matchedZone = zone;
          break;
        }
        // Check state match
        if (location.type === 'state' && location.code === `${country}:${state}`) {
          matchedZone = zone;
          break;
        }
        // Check postcode match
        if (location.type === 'postcode' && location.code === postcode) {
          matchedZone = zone;
          break;
        }
      }
      if (matchedZone) break;
    }

    // If no zone matched, use default (last zone or create default response)
    if (!matchedZone) {
      return NextResponse.json({
        zone: null,
        methods: [
          {
            id: 'default',
            title: '기본 배송',
            type: 'flat_rate',
            cost: 3000,
            available: true,
          },
        ],
      });
    }

    // Calculate available methods
    const availableMethods = matchedZone.methods.map((method) => {
      let cost = method.cost || 0;
      let available = true;
      let reason = '';

      // Check free shipping threshold
      if (method.type === 'free_shipping') {
        if (method.minAmount && cartTotal < method.minAmount) {
          available = false;
          reason = `${method.minAmount.toLocaleString()}원 이상 구매 시 무료배송`;
        } else {
          cost = 0;
        }
      }

      // Check minimum amount for other methods
      if (method.minAmount && cartTotal < method.minAmount && method.type !== 'free_shipping') {
        available = false;
        reason = `최소 주문금액: ${method.minAmount.toLocaleString()}원`;
      }

      return {
        id: method.id,
        title: method.title,
        type: method.type,
        cost,
        available,
        reason,
      };
    });

    return NextResponse.json({
      zone: {
        id: matchedZone.id,
        name: matchedZone.name,
      },
      methods: availableMethods,
    });
  } catch (error) {
    console.error('Calculate shipping error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
