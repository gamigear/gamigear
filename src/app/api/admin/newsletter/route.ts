import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET - List all subscribers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "50");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.newsletterSubscriber.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({
      data: subscribers,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// DELETE - Delete subscriber(s)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "IDs required" }, { status: 400 });
    }

    await prisma.newsletterSubscriber.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error("Error deleting subscribers:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
