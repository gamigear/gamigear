import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get site details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await prisma.wooCommerceSite.findUnique({
      where: { id },
      include: {
        syncLogs: {
          orderBy: { startedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...site,
      consumerKey: site.consumerKey.substring(0, 10) + "...",
      consumerSecret: "***hidden***",
    });
  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json(
      { error: "Failed to fetch site" },
      { status: 500 }
    );
  }
}

// PUT - Update site
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, url, consumerKey, consumerSecret, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url.replace(/\/$/, "");
    if (consumerKey !== undefined) updateData.consumerKey = consumerKey;
    if (consumerSecret !== undefined) updateData.consumerSecret = consumerSecret;
    if (isActive !== undefined) updateData.isActive = isActive;

    const site = await prisma.wooCommerceSite.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...site,
      consumerKey: site.consumerKey.substring(0, 10) + "...",
      consumerSecret: "***hidden***",
    });
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}

// DELETE - Delete site
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.wooCommerceSite.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}
