import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요" },
        { status: 400 }
      );
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer || !customer.passwordHash) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, customer.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    // Update last active
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastActive: new Date() },
    });

    // Generate token
    const token = generateToken({
      userId: customer.id,
      email: customer.email,
      role: customer.role,
      type: "customer",
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "로그인되었습니다",
      user: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        avatarUrl: customer.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "로그인에 실패했습니다" },
      { status: 500 }
    );
  }
}
