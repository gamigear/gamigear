import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/homepage - Get homepage settings
export async function GET() {
  try {
    // Get all homepage-related settings
    const settings = await prisma.setting.findMany({
      where: {
        group: 'homepage',
      },
    });

    // Convert to object
    const homepageSettings: Record<string, any> = {};
    for (const setting of settings) {
      try {
        homepageSettings[setting.key] = JSON.parse(setting.value);
      } catch {
        homepageSettings[setting.key] = setting.value;
      }
    }

    // Get banners
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });

    // Get promotions
    const promotions = await prisma.promotion.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json({
      settings: homepageSettings,
      banners,
      promotions,
    });
  } catch (error) {
    console.error('Homepage API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage settings' },
      { status: 500 }
    );
  }
}

// PUT /api/homepage - Update homepage settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (settings) {
      // Update settings
      for (const [key, value] of Object.entries(settings)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        await prisma.setting.upsert({
          where: { key },
          update: { value: stringValue },
          create: {
            key,
            value: stringValue,
            group: 'homepage',
          },
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'homepage_updated',
        objectType: 'homepage',
        objectId: 'settings',
        details: JSON.stringify({ keys: Object.keys(settings || {}) }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update homepage error:', error);
    return NextResponse.json(
      { error: 'Failed to update homepage settings' },
      { status: 500 }
    );
  }
}
