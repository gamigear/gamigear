import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/settings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const group = searchParams.get('group');

    // Build where clause
    const where: any = {};
    if (group) {
      where.group = group;
    }

    // Get settings
    const settings = await prisma.setting.findMany({
      where,
      orderBy: [
        { group: 'asc' },
        { key: 'asc' },
      ],
    });

    // Transform to key-value object grouped by group
    const grouped: Record<string, Record<string, string>> = {};
    const flat: Record<string, string> = {};

    for (const setting of settings) {
      if (!grouped[setting.group]) {
        grouped[setting.group] = {};
      }
      grouped[setting.group][setting.key] = setting.value;
      flat[setting.key] = setting.value;
    }

    return NextResponse.json({
      settings: flat,
      grouped,
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }

    // Update settings
    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      updates.push(
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: {
            key,
            value: String(value),
            group: key.split('_')[0] || 'general',
          },
        })
      );
    }

    await Promise.all(updates);

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'settings_updated',
        objectType: 'settings',
        objectId: 'global',
        details: JSON.stringify({ keys: Object.keys(settings) }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
