import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 이름은 필수입니다" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        username: email.split("@")[0] + "_" + Date.now(),
        billingPhone: phone,
        billingEmail: email,
        billingFirstName: firstName,
        billingLastName: lastName,
      },
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
      message: "회원가입이 완료되었습니다",
      user: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "회원가입에 실패했습니다" },
      { status: 500 }
    );
  }
}
