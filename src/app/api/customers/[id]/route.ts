import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/customers/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            review: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
      billingAddress: {
        firstName: customer.billingFirstName,
        lastName: customer.billingLastName,
        company: customer.billingCompany,
        address1: customer.billingAddress1,
        address2: customer.billingAddress2,
        city: customer.billingCity,
        state: customer.billingState,
        postcode: customer.billingPostcode,
        country: customer.billingCountry,
        email: customer.billingEmail,
        phone: customer.billingPhone,
      },
      shippingAddress: {
        firstName: customer.shippingFirstName,
        lastName: customer.shippingLastName,
        company: customer.shippingCompany,
        address1: customer.shippingAddress1,
        address2: customer.shippingAddress2,
        city: customer.shippingCity,
        state: customer.shippingState,
        postcode: customer.shippingPostcode,
        country: customer.shippingCountry,
      },
      recentOrders: customer.orders,
      recentReviews: customer.reviews,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PATCH /api/customers/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      username,
      avatarUrl,
      billingAddress,
      shippingAddress,
    } = body;

    // Check if customer exists
    const existing = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (username !== undefined) updateData.username = username;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    // Update billing address
    if (billingAddress) {
      if (billingAddress.firstName !== undefined) updateData.billingFirstName = billingAddress.firstName;
      if (billingAddress.lastName !== undefined) updateData.billingLastName = billingAddress.lastName;
      if (billingAddress.company !== undefined) updateData.billingCompany = billingAddress.company;
      if (billingAddress.address1 !== undefined) updateData.billingAddress1 = billingAddress.address1;
      if (billingAddress.address2 !== undefined) updateData.billingAddress2 = billingAddress.address2;
      if (billingAddress.city !== undefined) updateData.billingCity = billingAddress.city;
      if (billingAddress.state !== undefined) updateData.billingState = billingAddress.state;
      if (billingAddress.postcode !== undefined) updateData.billingPostcode = billingAddress.postcode;
      if (billingAddress.country !== undefined) updateData.billingCountry = billingAddress.country;
      if (billingAddress.email !== undefined) updateData.billingEmail = billingAddress.email;
      if (billingAddress.phone !== undefined) updateData.billingPhone = billingAddress.phone;
    }

    // Update shipping address
    if (shippingAddress) {
      if (shippingAddress.firstName !== undefined) updateData.shippingFirstName = shippingAddress.firstName;
      if (shippingAddress.lastName !== undefined) updateData.shippingLastName = shippingAddress.lastName;
      if (shippingAddress.company !== undefined) updateData.shippingCompany = shippingAddress.company;
      if (shippingAddress.address1 !== undefined) updateData.shippingAddress1 = shippingAddress.address1;
      if (shippingAddress.address2 !== undefined) updateData.shippingAddress2 = shippingAddress.address2;
      if (shippingAddress.city !== undefined) updateData.shippingCity = shippingAddress.city;
      if (shippingAddress.state !== undefined) updateData.shippingState = shippingAddress.state;
      if (shippingAddress.postcode !== undefined) updateData.shippingPostcode = shippingAddress.postcode;
      if (shippingAddress.country !== undefined) updateData.shippingCountry = shippingAddress.country;
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'customer_updated',
        objectType: 'customer',
        objectId: customer.id,
        details: JSON.stringify({ changes: Object.keys(updateData) }),
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if customer exists
    const existing = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if customer has orders
    if (existing._count.orders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'customer_deleted',
        objectType: 'customer',
        objectId: params.id,
        details: JSON.stringify({ email: existing.email }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
