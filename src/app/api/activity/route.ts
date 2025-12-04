import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/activity
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const objectType = searchParams.get('object_type');
    const objectId = searchParams.get('object_id');
    const action = searchParams.get('action');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');

    // Build where clause
    const where: any = {};

    if (objectType) {
      where.objectType = objectType;
    }

    if (objectId) {
      where.objectId = objectId;
    }

    if (action) {
      where.action = action;
    }

    // Get total count
    const total = await prisma.activityLog.count({ where });
    const totalPages = Math.ceil(total / perPage);
    const skip = (page - 1) * perPage;

    // Get activity logs
    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
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
      action: log.action,
      objectType: log.objectType,
      objectId: log.objectId,
      details: log.details ? JSON.parse(log.details) : null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      user: log.user,
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
    console.error('Activity API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
