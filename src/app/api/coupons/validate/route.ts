import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: "Vui lòng nhập mã giảm giá" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Mã giảm giá không tồn tại" },
        { status: 404 }
      );
    }

    const now = new Date();

    // Check expiration
    if (coupon.dateExpires && coupon.dateExpires < now) {
      return NextResponse.json(
        { message: "Mã giảm giá đã hết hạn" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { message: "Mã giảm giá đã hết lượt sử dụng" },
        { status: 400 }
      );
    }

    // Check minimum amount
    if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
      return NextResponse.json(
        { message: `Đơn hàng tối thiểu ${coupon.minimumAmount.toLocaleString()}đ để sử dụng mã này` },
        { status: 400 }
      );
    }

    // Check maximum amount
    if (coupon.maximumAmount && subtotal > coupon.maximumAmount) {
      return NextResponse.json(
        { message: `Đơn hàng tối đa ${coupon.maximumAmount.toLocaleString()}đ để sử dụng mã này` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = (subtotal * coupon.amount) / 100;
    } else if (coupon.discountType === "fixed_cart" || coupon.discountType === "fixed_product") {
      discount = coupon.amount;
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      amount: coupon.amount,
      discount,
      description: coupon.description,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi kiểm tra mã giảm giá" },
      { status: 500 }
    );
  }
}
