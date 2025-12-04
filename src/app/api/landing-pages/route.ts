import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/landing-pages
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const landingPages = await prisma.landingPage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: landingPages });
  } catch (error) {
    console.error('Landing pages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing pages' },
      { status: 500 }
    );
  }
}

// POST /api/landing-pages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, ...rest } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.landingPage.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        title,
        slug,
        ...rest,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'landing_page_created',
        objectType: 'landing_page',
        objectId: landingPage.id,
        details: JSON.stringify({ title, slug }),
      },
    });

    return NextResponse.json(landingPage, { status: 201 });
  } catch (error) {
    console.error('Create landing page error:', error);
    return NextResponse.json(
      { error: 'Failed to create landing page' },
      { status: 500 }
    );
  }
}
