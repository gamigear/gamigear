import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateToken, setAuthCookie } from "@/lib/auth";

// POST /api/auth/oauth/callback - Handle OAuth callback and set custom auth cookie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, provider, providerId, name, image } = body;

    if (!email || !provider) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      // Parse name
      const nameParts = (name || "").split(" ");
      const firstName = nameParts.slice(1).join(" ") || name || "";
      const lastName = nameParts[0] || "";

      customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          username: email.split("@")[0] + "_" + Date.now(),
          avatarUrl: image,
          provider,
          providerId,
          emailVerified: new Date(),
        },
      });
    } else {
      // Update last active
      await prisma.customer.update({
        where: { id: customer.id },
        data: { 
          lastActive: new Date(),
          avatarUrl: customer.avatarUrl || image,
        },
      });
    }

    // Generate our custom JWT token
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
      user: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        avatarUrl: customer.avatarUrl,
        role: customer.role,
      },
    });
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      { error: error.message || "OAuth callback failed" },
      { status: 500 }
    );
  }
}
