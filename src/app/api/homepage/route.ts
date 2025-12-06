import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyAdminAuth } from '@/lib/api-auth';

// GET /api/homepage - Get homepage settings (public for frontend)
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

// PUT /api/homepage - Update homepage settings (admin only)
export async function PUT(request: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    console.log('Homepage PUT: Auth failed -', authResult.error);
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { settings } = body;
    
    console.log('Homepage PUT: Received settings keys:', Object.keys(settings || {}));

    if (!settings) {
      return NextResponse.json(
        { error: 'No settings provided' },
        { status: 400 }
      );
    }

    const updatedKeys: string[] = [];
    const errors: string[] = [];

    // Update settings one by one with error handling
    for (const [key, value] of Object.entries(settings)) {
      try {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        // Log for debugging
        console.log(`Saving homepage setting: ${key}, length: ${stringValue.length}`);
        
        await prisma.setting.upsert({
          where: { key },
          update: { 
            value: stringValue,
            group: 'homepage', // Ensure group is always set
          },
          create: {
            key,
            value: stringValue,
            group: 'homepage',
          },
        });
        updatedKeys.push(key);
      } catch (keyError) {
        console.error(`Error saving key "${key}":`, keyError);
        const errorMsg = keyError instanceof Error ? keyError.message : 'Unknown error';
        errors.push(`Failed to save ${key}: ${errorMsg}`);
      }
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'homepage_updated',
          objectType: 'homepage',
          objectId: 'settings',
          details: JSON.stringify({ 
            keys: updatedKeys,
            errors: errors.length > 0 ? errors : undefined 
          }),
        },
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: errors.join(', '),
        updatedKeys 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedKeys });
  } catch (error) {
    console.error('Update homepage error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update homepage settings: ${errorMessage}` },
      { status: 500 }
    );
  }
}
