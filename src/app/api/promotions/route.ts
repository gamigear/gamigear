import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/promotions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');

    const where: any = {};
    
    if (active === 'true') {
      const now = new Date();
      where.isActive = true;
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    }

    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: { position: 'asc' },
    });

    return NextResponse.json({
      data: promotions.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image,
        link: p.link,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
        isActive: p.isActive,
        position: p.position,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Promotions API error:', error);
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

// POST /api/promotions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, image, link, startDate, endDate, isActive = true, position = 0 } = body;

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description,
        image,
        link,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
        position,
      },
    });

    return NextResponse.json({ data: promotion }, { status: 201 });
  } catch (error) {
    console.error('Create promotion error:', error);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
