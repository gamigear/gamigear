import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/db/prisma';
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';

// GET /api/banners
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';
    const categoryId = searchParams.get('categoryId');

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { position: 'asc' },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ data: banners });
  } catch (error) {
    console.error('Banners API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST /api/banners (Admin only)
export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required" 
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }

  try {
    const body = await request.json();
    const { title, subtitle, image, tabletImage, mobileImage, link, position = 0, isActive = true, gradientFrom, gradientTo, description, buttonText, categoryId } = body;

    if (!title || !image || !link) {
      return NextResponse.json(
        { error: 'Title, image, and link are required' },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        description,
        buttonText,
        image,
        tabletImage,
        mobileImage,
        link,
        gradientFrom,
        gradientTo,
        categoryId: categoryId || null,
        position,
        isActive,
      },
      include: {
        category: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'banner_created',
        objectType: 'banner',
        objectId: banner.id,
        details: JSON.stringify({ title }),
      },
    });

    // Invalidate homepage banner cache
    revalidateTag('homepage-banners');

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
