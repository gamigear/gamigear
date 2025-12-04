import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    await removeAuthCookie();
    
    return NextResponse.json({
      success: true,
      message: "로그아웃되었습니다",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "로그아웃에 실패했습니다" },
      { status: 500 }
    );
  }
}
