import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { generateSlug } from '@/lib/slug';

// GET /api/faq-categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.faqCategory.findUnique({
      where: { id },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Get FAQ Category error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ category' },
      { status: 500 }
    );
  }
}

// PUT /api/faq-categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, position, isActive } = body;

    const updateData: any = {
      description,
      icon,
      position,
      isActive,
    };

    if (name) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }

    const category = await prisma.faqCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Update FAQ Category error:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ category' },
      { status: 500 }
    );
  }
}

// DELETE /api/faq-categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Set categoryId to null for all FAQs in this category
    await prisma.faq.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await prisma.faqCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ Category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ category' },
      { status: 500 }
    );
  }
}
