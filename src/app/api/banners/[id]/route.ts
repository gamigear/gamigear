import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/db/prisma';
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';

// GET /api/banners/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Get banner error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

// PUT /api/banners/[id] (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required" 
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, image, tabletImage, mobileImage, link, position, isActive, gradientFrom, gradientTo, description, buttonText, categoryId } = body;

    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(image !== undefined && { image }),
        ...(tabletImage !== undefined && { tabletImage }),
        ...(mobileImage !== undefined && { mobileImage }),
        ...(link !== undefined && { link }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
        ...(gradientFrom !== undefined && { gradientFrom }),
        ...(gradientTo !== undefined && { gradientTo }),
        ...(description !== undefined && { description }),
        ...(buttonText !== undefined && { buttonText }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
      include: {
        category: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'banner_updated',
        objectType: 'banner',
        objectId: banner.id,
        details: JSON.stringify({ title: banner.title }),
      },
    });

    // Invalidate homepage banner cache
    revalidateTag('homepage-banners');

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Update banner error:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE /api/banners/[id] (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required" 
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }

  try {
    const { id } = await params;
    
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    await prisma.banner.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: 'banner_deleted',
        objectType: 'banner',
        objectId: id,
        details: JSON.stringify({ title: existingBanner.title }),
      },
    });

    // Invalidate homepage banner cache
    revalidateTag('homepage-banners');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete banner error:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
