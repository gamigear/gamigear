import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/customers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const search = searchParams.get('search');
    const orderBy = searchParams.get('orderby') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { username: { contains: search } },
        { billingPhone: { contains: search } },
      ];
    }

    // Filter by status
    if (status === 'paying') {
      where.isPayingCustomer = true;
    } else if (status === 'inactive') {
      where.isPayingCustomer = false;
    }

    // Get total count
    const total = await prisma.customer.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get customers
    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        [orderBy]: order,
      },
      skip,
      take: perPage,
    });

    // Transform data
    const transformedCustomers = customers.map((customer: any) => ({
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      username: customer.username,
      avatarUrl: customer.avatarUrl,
      phone: customer.billingPhone,
      provider: customer.provider,
      isPayingCustomer: customer.isPayingCustomer,
      ordersCount: customer._count.orders,
      reviewsCount: customer._count.reviews,
      totalSpent: customer.totalSpent,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      lastActive: customer.lastActive?.toISOString() || null,
      billingCity: customer.billingCity,
      billingCountry: customer.billingCountry,
    }));

    return NextResponse.json({
      data: transformedCustomers,
      meta: {
        total,
        page,
        perPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      username,
      avatarUrl,
      phone,
      billingAddress,
      shippingAddress,
    } = body;

    // Check if email already exists
    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email,
        firstName,
        lastName,
        username: username || email.split('@')[0],
        avatarUrl,
        billingPhone: phone,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'customer_created',
        objectType: 'customer',
        objectId: customer.id,
        details: JSON.stringify({ email: customer.email }),
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
