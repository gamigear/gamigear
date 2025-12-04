import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/orders/stats
export async function GET() {
  try {
    const [total, pending, processing, shipped, completed, cancelled] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'shipped' } }),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
    ]);

    return NextResponse.json({
      data: {
        total,
        pending,
        processing,
        shipped,
        completed,
        cancelled,
      },
    });
  } catch (error) {
    console.error('Order stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
