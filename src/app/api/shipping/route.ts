import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/shipping
export async function GET() {
  try {
    // Get shipping zones with methods and locations
    const zones = await prisma.shippingZone.findMany({
      include: {
        locations: true,
        methods: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Transform data
    const transformedZones = zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      order: zone.order,
      locations: zone.locations.map((loc) => ({
        id: loc.id,
        code: loc.code,
        type: loc.type,
      })),
      methods: zone.methods.map((method) => ({
        id: method.id,
        title: method.title,
        type: method.type,
        enabled: method.enabled,
        order: method.order,
        cost: method.cost,
        minAmount: method.minAmount,
        settings: method.settings ? JSON.parse(method.settings) : null,
      })),
      createdAt: zone.createdAt.toISOString(),
      updatedAt: zone.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data: transformedZones,
    });
  } catch (error) {
    console.error('Shipping API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping zones' },
      { status: 500 }
    );
  }
}

// POST /api/shipping - Create shipping zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, locations = [], methods = [] } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Zone name is required' },
        { status: 400 }
      );
    }

    // Get max order
    const maxOrder = await prisma.shippingZone.aggregate({
      _max: { order: true },
    });

    // Create zone with transaction
    const zone = await prisma.$transaction(async (tx) => {
      // Create zone
      const newZone = await tx.shippingZone.create({
        data: {
          name,
          order: (maxOrder._max.order || 0) + 1,
        },
      });

      // Add locations
      if (locations.length > 0) {
        await tx.shippingLocation.createMany({
          data: locations.map((loc: any) => ({
            zoneId: newZone.id,
            code: loc.code,
            type: loc.type || 'country',
          })),
        });
      }

      // Add methods
      if (methods.length > 0) {
        await tx.shippingMethod.createMany({
          data: methods.map((method: any, index: number) => ({
            zoneId: newZone.id,
            title: method.title,
            type: method.type || 'flat_rate',
            enabled: method.enabled ?? true,
            order: index + 1,
            cost: method.cost,
            minAmount: method.minAmount,
            settings: method.settings ? JSON.stringify(method.settings) : null,
          })),
        });
      }

      return newZone;
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'shipping_zone_created',
        objectType: 'shipping_zone',
        objectId: zone.id,
        details: JSON.stringify({ name: zone.name }),
      },
    });

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error('Create shipping zone error:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping zone' },
      { status: 500 }
    );
  }
}
