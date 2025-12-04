import { NextResponse } from "next/server";
import { removeAuthCookie, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    
    if (currentUser) {
      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: currentUser.userId,
          action: "logout",
          objectType: "user",
          objectId: currentUser.userId,
        },
      });
    }

    await removeAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
