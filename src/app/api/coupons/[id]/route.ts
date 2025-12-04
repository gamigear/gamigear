import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/coupons/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType === 'percent' ? 'percentage' : coupon.discountType,
        discountValue: coupon.amount,
        usageCount: coupon.usageCount,
        usageLimit: coupon.usageLimit,
        minimumAmount: coupon.minimumAmount || 0,
        maximumAmount: coupon.maximumAmount,
        expiresAt: coupon.dateExpires?.toISOString() || null,
        isActive: !coupon.dateExpires || new Date(coupon.dateExpires) > new Date(),
        createdAt: coupon.createdAt.toISOString(),
        updatedAt: coupon.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
  }
}

// PUT /api/coupons/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      usageLimit,
      usageLimitPerUser,
      minimumAmount,
      maximumAmount,
      individualUse,
      excludeSaleItems,
      expiresAt,
      isActive,
    } = body;

    // Check if coupon exists
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    // Check if new code conflicts with another coupon
    if (code && code.toUpperCase() !== existing.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });
      if (codeExists) {
        return NextResponse.json({ error: '이미 존재하는 쿠폰 코드입니다.' }, { status: 400 });
      }
    }

    // Update coupon
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase() : undefined,
        description,
        discountType: discountType === 'percentage' ? 'percent' : (discountType === 'fixed' ? 'fixed_cart' : undefined),
        amount: discountValue,
        usageLimit,
        usageLimitPerUser,
        minimumAmount,
        maximumAmount,
        individualUse,
        excludeSaleItems,
        dateExpires: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'coupon_updated',
        objectType: 'coupon',
        objectId: coupon.id,
        details: JSON.stringify({ code: coupon.code }),
      },
    });

    return NextResponse.json({ data: coupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

// DELETE /api/coupons/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'coupon_deleted',
        objectType: 'coupon',
        objectId: id,
        details: JSON.stringify({ code: coupon.code }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
