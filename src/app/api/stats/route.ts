import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/stats - Lấy thống kê tổng quan
export async function GET() {
  try {
    // Get counts
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { status: 'publish' } }),
      prisma.customer.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'completed' } }),
    ]);

    // Get revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          in: ['completed', 'processing'],
        },
      },
    });

    const totalRevenue = revenueResult._sum.total || 0;

    // Get low stock products
    const lowStockProducts = await prisma.product.count({
      where: {
        manageStock: true,
        stockQuantity: {
          lte: 10,
        },
      },
    });

    // Get out of stock products
    const outOfStockProducts = await prisma.product.count({
      where: {
        stockStatus: 'outofstock',
      },
    });

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      processingOrders,
      completedOrders,
      lowStockProducts,
      outOfStockProducts,
      conversionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
