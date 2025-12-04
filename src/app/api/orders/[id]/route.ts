import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: {
                  take: 1,
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        coupons: {
          include: {
            coupon: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform data
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      subtotal: order.subtotal,
      discountTotal: order.discountTotal,
      shippingTotal: order.shippingTotal,
      taxTotal: order.taxTotal,
      total: order.total,
      customer: order.customer,
      customerNote: order.customerNote,
      billing: {
        firstName: order.billingFirstName,
        lastName: order.billingLastName,
        company: order.billingCompany,
        address1: order.billingAddress1,
        address2: order.billingAddress2,
        city: order.billingCity,
        state: order.billingState,
        postcode: order.billingPostcode,
        country: order.billingCountry,
        email: order.billingEmail,
        phone: order.billingPhone,
      },
      shipping: {
        firstName: order.shippingFirstName,
        lastName: order.shippingLastName,
        company: order.shippingCompany,
        address1: order.shippingAddress1,
        address2: order.shippingAddress2,
        city: order.shippingCity,
        state: order.shippingState,
        postcode: order.shippingPostcode,
        country: order.shippingCountry,
      },
      paymentMethod: order.paymentMethod,
      paymentMethodTitle: order.paymentMethodTitle,
      transactionId: order.transactionId,
      datePaid: order.datePaid?.toISOString(),
      dateCompleted: order.dateCompleted?.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        total: item.total,
        sku: item.sku,
        image: item.image,
      })),
      notes: order.notes,
      coupons: order.coupons.map((oc) => ({
        id: oc.id,
        code: oc.code,
        discount: oc.discount,
        coupon: oc.coupon,
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, customerNote, billing, shipping, paymentMethod, paymentMethodTitle } = body;

    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true, orderNumber: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === 'completed' && currentOrder.status !== 'completed') {
        updateData.dateCompleted = new Date();
      }
    }

    if (customerNote !== undefined) updateData.customerNote = customerNote;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (paymentMethodTitle) updateData.paymentMethodTitle = paymentMethodTitle;

    if (billing) {
      updateData.billingFirstName = billing.firstName;
      updateData.billingLastName = billing.lastName;
      updateData.billingCompany = billing.company;
      updateData.billingAddress1 = billing.address1;
      updateData.billingAddress2 = billing.address2;
      updateData.billingCity = billing.city;
      updateData.billingState = billing.state;
      updateData.billingPostcode = billing.postcode;
      updateData.billingCountry = billing.country;
      updateData.billingEmail = billing.email;
      updateData.billingPhone = billing.phone;
    }

    if (shipping) {
      updateData.shippingFirstName = shipping.firstName;
      updateData.shippingLastName = shipping.lastName;
      updateData.shippingCompany = shipping.company;
      updateData.shippingAddress1 = shipping.address1;
      updateData.shippingAddress2 = shipping.address2;
      updateData.shippingCity = shipping.city;
      updateData.shippingState = shipping.state;
      updateData.shippingPostcode = shipping.postcode;
      updateData.shippingCountry = shipping.country;
    }

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'order_updated',
        objectType: 'order',
        objectId: order.id,
        details: JSON.stringify({
          orderNumber: order.orderNumber,
          statusChange: status && status !== currentOrder.status ? { from: currentOrder.status, to: status } : null,
        }),
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get order for logging
    const order = await prisma.order.findUnique({
      where: { id },
      select: { orderNumber: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Delete order (cascade will handle related records)
    await prisma.order.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'order_deleted',
        objectType: 'order',
        objectId: id,
        details: JSON.stringify({ orderNumber: order.orderNumber }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
