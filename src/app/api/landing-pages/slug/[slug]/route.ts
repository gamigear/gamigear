import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/landing-pages/slug/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const landingPage = await prisma.landingPage.findUnique({
      where: { slug },
    });

    if (!landingPage || !landingPage.isActive) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.landingPage.update({
      where: { id: landingPage.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get products if productIds is set
    let products: any[] = [];
    if (landingPage.showProducts && landingPage.productIds) {
      try {
        const productIds = JSON.parse(landingPage.productIds);
        if (Array.isArray(productIds) && productIds.length > 0) {
          products = await prisma.product.findMany({
            where: {
              id: { in: productIds },
              status: 'publish',
            },
            include: {
              images: {
                orderBy: { position: 'asc' },
                take: 1,
              },
            },
          });
        }
      } catch (e) {
        console.error('Failed to parse productIds:', e);
      }
    }

    return NextResponse.json({
      ...landingPage,
      products,
    });
  } catch (error) {
    console.error('Get landing page by slug error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing page' },
      { status: 500 }
    );
  }
}
