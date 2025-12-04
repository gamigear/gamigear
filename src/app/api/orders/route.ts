import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/orders - Lấy danh sách đơn hàng
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get total count
    const total = await prisma.order.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    });

    // Transform data
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.datePaid ? 'paid' : 'pending',
      total: order.total,
      itemCount: order.items.length,
      customer: {
        id: order.customer?.id || '',
        name: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || order.billingFirstName || 'Guest',
        email: order.customer?.email || order.billingEmail || '',
        phone: order.billingPhone || '',
      },
      createdAt: order.createdAt.toISOString(),
    }));

    return NextResponse.json({
      data: transformedOrders,
      meta: {
        total,
        page,
        perPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Tạo đơn hàng mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      items,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      billingName,
      billingPhone,
      billingAddress,
      billingCity,
      billingPostalCode,
      billingEmail,
      paymentMethod,
      notes,
      couponCode,
    } = body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      const price = product.salePrice || product.price;
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        total,
      });
    }

    // Calculate shipping and discount
    const shippingCost = subtotal >= 50000 ? 0 : 3000;
    let discount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      if (coupon && (!coupon.dateExpires || coupon.dateExpires > new Date())) {
        if (coupon.discountType === 'percent') {
          discount = (subtotal * coupon.amount) / 100;
          if (coupon.maximumAmount && discount > coupon.maximumAmount) {
            discount = coupon.maximumAmount;
          }
        } else {
          discount = coupon.amount;
        }
      }
    }

    const total = subtotal + shippingCost - discount;

    // Generate order number
    const orderNumber = `ORD${Date.now()}`;

    // Create order with schema-compatible fields
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        status: 'pending',
        currency: 'KRW',
        subtotal,
        discountTotal: discount,
        shippingTotal: shippingCost,
        total,
        paymentMethod: paymentMethod || 'cod',
        paymentMethodTitle: paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery',
        // Billing
        billingFirstName: billingName?.split(' ')[0] || '',
        billingLastName: billingName?.split(' ').slice(1).join(' ') || '',
        billingAddress1: billingAddress || '',
        billingCity: billingCity || '',
        billingState: '',
        billingPostcode: billingPostalCode || '',
        billingCountry: 'KR',
        billingEmail: billingEmail || '',
        billingPhone: billingPhone || '',
        // Shipping
        shippingFirstName: shippingName?.split(' ')[0] || '',
        shippingLastName: shippingName?.split(' ').slice(1).join(' ') || '',
        shippingAddress1: shippingAddress || '',
        shippingCity: shippingCity || '',
        shippingState: '',
        shippingPostcode: shippingPostalCode || '',
        shippingCountry: 'KR',
        customerNote: notes || '',
        items: {
          create: orderItems.map(item => ({
            ...item,
            name: '',
            subtotal: item.total,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // Update product stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'order_created',
        objectType: 'order',
        objectId: order.id,
        details: JSON.stringify({ orderNumber: order.orderNumber, total: order.total }),
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
