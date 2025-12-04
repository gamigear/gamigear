import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/inventory/logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('product_id');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');

    // Build where clause
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type;
    }

    // Get total count
    const total = await prisma.inventoryLog.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get logs
    const logs = await prisma.inventoryLog.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: perPage,
    });

    // Transform data
    const transformedLogs = logs.map((log) => ({
      id: log.id,
      productId: log.productId,
      product: log.product,
      type: log.type,
      quantityChange: log.quantityChange,
      previousQuantity: log.previousQuantity,
      newQuantity: log.newQuantity,
      orderId: log.orderId,
      order: log.order,
      userId: log.userId,
      user: log.user,
      note: log.note,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      data: transformedLogs,
      meta: {
        total,
        page,
        perPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Inventory logs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory logs' },
      { status: 500 }
    );
  }
}
