import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ user: null });
    }

    // Get fresh user data
    const customer = await prisma.customer.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        ordersCount: true,
        totalSpent: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: customer,
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json({ user: null });
  }
}
