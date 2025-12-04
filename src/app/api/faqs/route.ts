import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/faqs - Get all FAQs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');
    const isActive = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { question: { contains: search } },
        { answer: { contains: search } },
      ];
    }

    const [faqs, total] = await Promise.all([
      prisma.faq.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.faq.count({ where }),
    ]);

    return NextResponse.json({
      data: faqs,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('FAQs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST /api/faqs - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, categoryId, position, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        categoryId: categoryId || null,
        position: position || 0,
        isActive: isActive !== false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}
