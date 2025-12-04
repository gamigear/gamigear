import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/reports
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'sales';
    const period = searchParams.get('period') || '7d';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Calculate date range
    let dateFrom: Date;
    let dateTo = new Date();

    if (startDate && endDate) {
      dateFrom = new Date(startDate);
      dateTo = new Date(endDate);
    } else {
      switch (period) {
        case '24h':
          dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          dateFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    switch (type) {
      case 'sales':
        return await getSalesReport(dateFrom, dateTo);
      case 'products':
        return await getProductsReport(dateFrom, dateTo);
      case 'customers':
        return await getCustomersReport(dateFrom, dateTo);
      case 'orders':
        return await getOrdersReport(dateFrom, dateTo);
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function getSalesReport(dateFrom: Date, dateTo: Date) {
  // Get orders in date range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
      status: {
        in: ['completed', 'processing'],
      },
    },
    select: {
      id: true,
      total: true,
      subtotal: true,
      discountTotal: true,
      shippingTotal: true,
      taxTotal: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Calculate totals
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalDiscount = orders.reduce((sum, o) => sum + o.discountTotal, 0);
  const totalShipping = orders.reduce((sum, o) => sum + o.shippingTotal, 0);
  const totalTax = orders.reduce((sum, o) => sum + o.taxTotal, 0);

  // Group by date
  const dailyData = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!dailyData.has(date)) {
      dailyData.set(date, { revenue: 0, orders: 0 });
    }
    const data = dailyData.get(date)!;
    data.revenue += order.total;
    data.orders += 1;
  }

  const chartData = Array.from(dailyData.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));

  return NextResponse.json({
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue),
      totalDiscount,
      totalShipping,
      totalTax,
    },
    chartData,
    period: {
      from: dateFrom.toISOString(),
      to: dateTo.toISOString(),
    },
  });
}

async function getProductsReport(dateFrom: Date, dateTo: Date) {
  // Get top selling products
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: {
          in: ['completed', 'processing'],
        },
      },
    },
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
  });

  // Aggregate by product
  const productStats = new Map<string, {
    product: any;
    quantity: number;
    revenue: number;
  }>();

  for (const item of orderItems) {
    if (!item.product) continue;
    
    if (!productStats.has(item.productId)) {
      productStats.set(item.productId, {
        product: item.product,
        quantity: 0,
        revenue: 0,
      });
    }
    const stats = productStats.get(item.productId)!;
    stats.quantity += item.quantity;
    stats.revenue += item.total;
  }

  // Sort by revenue
  const topProducts = Array.from(productStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((stats) => ({
      id: stats.product.id,
      name: stats.product.name,
      sku: stats.product.sku,
      image: stats.product.images[0]?.src || null,
      quantity: stats.quantity,
      revenue: stats.revenue,
    }));

  return NextResponse.json({
    topProducts,
    totalProductsSold: orderItems.reduce((sum, i) => sum + i.quantity, 0),
    uniqueProducts: productStats.size,
    period: {
      from: dateFrom.toISOString(),
      to: dateTo.toISOString(),
    },
  });
}

async function getCustomersReport(dateFrom: Date, dateTo: Date) {
  // Get new customers
  const newCustomers = await prisma.customer.count({
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
  });

  // Get top customers by spending
  const topCustomers = await prisma.customer.findMany({
    where: {
      orders: {
        some: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
          status: {
            in: ['completed', 'processing'],
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      totalSpent: 'desc',
    },
    take: 10,
  });

  // Get returning vs new customer orders
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
      status: {
        in: ['completed', 'processing'],
      },
    },
    include: {
      customer: {
        select: {
          ordersCount: true,
        },
      },
    },
  });

  const newCustomerOrders = orders.filter((o) => o.customer?.ordersCount === 1).length;
  const returningCustomerOrders = orders.length - newCustomerOrders;

  return NextResponse.json({
    newCustomers,
    topCustomers: topCustomers.map((c) => ({
      id: c.id,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
      email: c.email,
      ordersCount: c._count.orders,
      totalSpent: c.totalSpent,
    })),
    orderBreakdown: {
      newCustomerOrders,
      returningCustomerOrders,
    },
    period: {
      from: dateFrom.toISOString(),
      to: dateTo.toISOString(),
    },
  });
}

async function getOrdersReport(dateFrom: Date, dateTo: Date) {
  // Get orders by status
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    _count: true,
    _sum: {
      total: true,
    },
  });

  // Get orders by payment method
  const ordersByPayment = await prisma.order.groupBy({
    by: ['paymentMethod'],
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    _count: true,
    _sum: {
      total: true,
    },
  });

  // Get daily order counts
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    select: {
      createdAt: true,
      status: true,
    },
  });

  const dailyData = new Map<string, number>();
  for (const order of orders) {
    const date = order.createdAt.toISOString().split('T')[0];
    dailyData.set(date, (dailyData.get(date) || 0) + 1);
  }

  return NextResponse.json({
    byStatus: ordersByStatus.map((s) => ({
      status: s.status,
      count: s._count,
      total: s._sum.total || 0,
    })),
    byPaymentMethod: ordersByPayment.map((p) => ({
      method: p.paymentMethod || 'Unknown',
      count: p._count,
      total: p._sum.total || 0,
    })),
    dailyOrders: Array.from(dailyData.entries()).map(([date, count]) => ({
      date,
      count,
    })),
    period: {
      from: dateFrom.toISOString(),
      to: dateTo.toISOString(),
    },
  });
}
