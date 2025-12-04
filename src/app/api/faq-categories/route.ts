import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { generateSlug } from '@/lib/slug';

// GET /api/faq-categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('active');

    const where: any = {};
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const categories = await prisma.faqCategory.findMany({
      where,
      include: {
        _count: {
          select: { faqs: true },
        },
      },
      orderBy: [
        { position: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      data: categories.map(cat => ({
        ...cat,
        faqCount: cat._count.faqs,
      })),
    });
  } catch (error) {
    console.error('FAQ Categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ categories' },
      { status: 500 }
    );
  }
}

// POST /api/faq-categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, position, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Check if slug exists
    const existing = await prisma.faqCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.faqCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        position: position || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create FAQ Category error:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ category' },
      { status: 500 }
    );
  }
}
