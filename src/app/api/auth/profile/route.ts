import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken, hashPassword, verifyPassword } from "@/lib/auth";

// GET /api/auth/profile - Get full profile
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        avatarUrl: true,
        role: true,
        billingFirstName: true,
        billingLastName: true,
        billingCompany: true,
        billingAddress1: true,
        billingAddress2: true,
        billingCity: true,
        billingState: true,
        billingPostcode: true,
        billingCountry: true,
        billingEmail: true,
        billingPhone: true,
        shippingFirstName: true,
        shippingLastName: true,
        shippingCompany: true,
        shippingAddress1: true,
        shippingAddress2: true,
        shippingCity: true,
        shippingState: true,
        shippingPostcode: true,
        shippingCountry: true,
        ordersCount: true,
        totalSpent: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: customer });
  } catch (error: any) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get profile" },
      { status: 500 }
    );
  }
}

// PUT /api/auth/profile - Update profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      avatarUrl,
      // Billing address
      billingFirstName,
      billingLastName,
      billingCompany,
      billingAddress1,
      billingAddress2,
      billingCity,
      billingState,
      billingPostcode,
      billingCountry,
      billingPhone,
      // Shipping address
      shippingFirstName,
      shippingLastName,
      shippingCompany,
      shippingAddress1,
      shippingAddress2,
      shippingCity,
      shippingState,
      shippingPostcode,
      shippingCountry,
    } = body;

    const customer = await prisma.customer.update({
      where: { id: payload.userId },
      data: {
        firstName,
        lastName,
        avatarUrl,
        billingFirstName: billingFirstName || firstName,
        billingLastName: billingLastName || lastName,
        billingCompany,
        billingAddress1,
        billingAddress2,
        billingCity,
        billingState,
        billingPostcode,
        billingCountry,
        billingPhone: billingPhone || phone,
        shippingFirstName: shippingFirstName || firstName,
        shippingLastName: shippingLastName || lastName,
        shippingCompany,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingPostcode,
        shippingCountry,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "프로필이 업데이트되었습니다",
      user: customer,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: error.message || "프로필 업데이트에 실패했습니다" },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/profile - Change password
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호와 새 비밀번호를 입력해주세요" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "새 비밀번호는 6자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    // Get current user
    const customer = await prisma.customer.findUnique({
      where: { id: payload.userId },
    });

    if (!customer || !customer.passwordHash) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, customer.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "현재 비밀번호가 올바르지 않습니다" },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.customer.update({
      where: { id: payload.userId },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      message: "비밀번호가 변경되었습니다",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: error.message || "비밀번호 변경에 실패했습니다" },
      { status: 500 }
    );
  }
}
