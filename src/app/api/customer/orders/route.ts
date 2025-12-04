import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Get customer ID from token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    let customerId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { customerId: string };
      customerId = decoded.customerId;
    } catch {
      return NextResponse.json(
        { message: "Phiên đăng nhập hết hạn" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi" },
      { status: 500 }
    );
  }
}
