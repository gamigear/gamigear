import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/coupons
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Filter active coupons (not expired and not reached usage limit)
    // Default to active=true for public page
    if (active !== 'false') {
      const now = new Date();
      where.AND = [
        {
          OR: [
            { dateExpires: null },
            { dateExpires: { gte: now } },
          ],
        },
      ];
    }

    // Get total count
    const total = await prisma.coupon.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get coupons
    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    });

    // Transform data
    const transformedCoupons = coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      amount: coupon.amount,
      discountValue: coupon.amount,
      usageCount: coupon.usageCount,
      usageLimit: coupon.usageLimit,
      usageLimitPerUser: coupon.usageLimitPerUser,
      minimumAmount: coupon.minimumAmount || 0,
      maximumAmount: coupon.maximumAmount,
      individualUse: coupon.individualUse,
      excludeSaleItems: coupon.excludeSaleItems,
      dateExpires: coupon.dateExpires?.toISOString() || null,
      expiresAt: coupon.dateExpires?.toISOString() || null,
      isActive: !coupon.dateExpires || new Date(coupon.dateExpires) > new Date(),
      isExpired: coupon.dateExpires ? new Date(coupon.dateExpires) < new Date() : false,
      isLimitReached: coupon.usageLimit ? coupon.usageCount >= coupon.usageLimit : false,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data: transformedCoupons,
      meta: {
        total,
        page,
        perPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Coupons API error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST /api/coupons
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      description,
      discountType = 'percentage',
      discountValue,
      usageLimit,
      usageLimitPerUser,
      minimumAmount,
      maximumAmount,
      individualUse = false,
      excludeSaleItems = false,
      expiresAt,
      isActive = true,
    } = body;

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: '이미 존재하는 쿠폰 코드입니다.' }, { status: 400 });
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType: discountType === 'percentage' ? 'percent' : 'fixed_cart',
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
        action: 'coupon_created',
        objectType: 'coupon',
        objectId: coupon.id,
        details: JSON.stringify({ code: coupon.code }),
      },
    });

    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
