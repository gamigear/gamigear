import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';

// GET /api/shipping
export async function GET() {
  try {
    // Get shipping zones with methods and locations
    const zones = await prisma.shippingZone.findMany({
      include: {
        locations: true,
        methods: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { priority: 'asc' },
    });

    // Transform data
    const transformedZones = zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      type: zone.type,
      priority: zone.priority,
      isActive: zone.isActive,
      locations: zone.locations.map((loc) => ({
        id: loc.id,
        code: loc.code,
        type: loc.type,
        name: loc.name,
      })),
      methods: zone.methods.map((method) => ({
        id: method.id,
        name: method.name,
        type: method.type,
        isActive: method.isActive,
        position: method.position,
        cost: method.cost,
        minAmount: method.minAmount,
        estimatedDays: method.estimatedDays,
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

// POST /api/shipping - Create shipping zone (Admin only)
export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required" 
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }

  try {
    const body = await request.json();
    const { name, slug, type = 'global', locations = [], methods = [] } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Zone name is required' },
        { status: 400 }
      );
    }

    // Get max priority
    const maxPriority = await prisma.shippingZone.aggregate({
      _max: { priority: true },
    });

    // Create zone with transaction
    const zone = await prisma.$transaction(async (tx) => {
      // Create zone
      const newZone = await tx.shippingZone.create({
        data: {
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          type,
          priority: (maxPriority._max.priority || 0) + 1,
        },
      });

      // Add locations
      if (locations.length > 0) {
        await tx.shippingLocation.createMany({
          data: locations.map((loc: { code: string; type?: string; name: string }) => ({
            zoneId: newZone.id,
            code: loc.code,
            type: loc.type || 'country',
            name: loc.name,
          })),
        });
      }

      // Add methods
      if (methods.length > 0) {
        await tx.shippingMethod.createMany({
          data: methods.map((method: { name: string; type?: string; isActive?: boolean; cost?: number; minAmount?: number; estimatedDays?: string }, index: number) => ({
            zoneId: newZone.id,
            name: method.name,
            type: method.type || 'flat_rate',
            isActive: method.isActive ?? true,
            position: index,
            cost: method.cost || 0,
            minAmount: method.minAmount,
            estimatedDays: method.estimatedDays,
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
