import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Get recent login activity for current admin
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.type !== "admin") {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get recent login activity
    const activities = await prisma.activityLog.findMany({
      where: {
        userId: currentUser.userId,
        action: {
          in: ["login_success", "login_failed", "password_changed", "logout"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        details: true,
      },
    });

    // Parse user agent for better display
    const sessions = activities.map((activity) => {
      const userAgent = activity.userAgent || "";
      let device = "Unknown";
      let browser = "Unknown";

      if (userAgent.includes("Mobile")) device = "Mobile";
      else if (userAgent.includes("Tablet")) device = "Tablet";
      else device = "Desktop";

      if (userAgent.includes("Chrome")) browser = "Chrome";
      else if (userAgent.includes("Firefox")) browser = "Firefox";
      else if (userAgent.includes("Safari")) browser = "Safari";
      else if (userAgent.includes("Edge")) browser = "Edge";

      return {
        id: activity.id,
        action: activity.action,
        ipAddress: activity.ipAddress,
        device,
        browser,
        createdAt: activity.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
