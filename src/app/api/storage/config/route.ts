import { NextResponse } from "next/server";
import { isR2Configured, getDefaultStorageProvider } from "@/lib/storage";

// GET /api/storage/config - Get storage configuration
export async function GET() {
  try {
    return NextResponse.json({
      r2Configured: isR2Configured(),
      defaultProvider: getDefaultStorageProvider(),
    });
  } catch (error) {
    console.error("Error getting storage config:", error);
    return NextResponse.json(
      { error: "Failed to get storage config" },
      { status: 500 }
    );
  }
}
