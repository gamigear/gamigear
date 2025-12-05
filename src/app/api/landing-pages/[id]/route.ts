import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';

// GET /api/landing-pages/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
    });

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(landingPage);
  } catch (error) {
    console.error('Get landing page error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing page' },
      { status: 500 }
    );
  }
}

// PUT /api/landing-pages/[id] (Admin only)
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

    // Check if slug is being changed and if it's unique
    if (body.slug) {
      const existing = await prisma.landingPage.findFirst({
        where: {
          slug: body.slug,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    const landingPage = await prisma.landingPage.update({
      where: { id },
      data: body,
    });

    await prisma.activityLog.create({
      data: {
        action: 'landing_page_updated',
        objectType: 'landing_page',
        objectId: landingPage.id,
        details: JSON.stringify({ title: landingPage.title }),
      },
    });

    return NextResponse.json(landingPage);
  } catch (error) {
    console.error('Update landing page error:', error);
    return NextResponse.json(
      { error: 'Failed to update landing page' },
      { status: 500 }
    );
  }
}

// DELETE /api/landing-pages/[id] (Admin only)
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

    const landingPage = await prisma.landingPage.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: 'landing_page_deleted',
        objectType: 'landing_page',
        objectId: id,
        details: JSON.stringify({ title: landingPage.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete landing page error:', error);
    return NextResponse.json(
      { error: 'Failed to delete landing page' },
      { status: 500 }
    );
  }
}
