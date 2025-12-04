import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source = "website" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { error: "Email already subscribed", code: "ALREADY_SUBSCRIBED" },
          { status: 400 }
        );
      }
      // Reactivate if previously unsubscribed
      await prisma.newsletterSubscriber.update({
        where: { email: email.toLowerCase() },
        data: {
          status: "active",
          name: name || existing.name,
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      });
      return NextResponse.json({ success: true, reactivated: true });
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        source,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
