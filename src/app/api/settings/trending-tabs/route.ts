import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/api-auth";

const SETTING_KEY = "trending_tabs_config";

export interface TrendingTab {
  id: string;
  label: string;
  emoji: string;
  enabled: boolean;
  hideOnMobile?: boolean;
  selectionMode: "auto" | "manual";
  // Auto mode settings
  autoFilter?: "featured" | "newest" | "on_sale" | "popular" | "category";
  categorySlug?: string;
  // Manual mode settings
  productIds?: string[];
  limit?: number;
}

export interface TrendingTabsConfig {
  title: string;
  subtitle: string;
  showEmoji: boolean;
  defaultLimit: number;
  tabs: TrendingTab[];
}

const defaultConfig: TrendingTabsConfig = {
  title: "Xem giỏ hàng người khác",
  subtitle: "Sản phẩm được yêu thích nhất",
  showEmoji: true,
  defaultLimit: 16,
  tabs: [
    { id: "best", label: "BEST", emoji: "🥇", enabled: true, selectionMode: "auto", autoFilter: "featured" },
    { id: "hot", label: "Hot Items", emoji: "🔥", enabled: true, selectionMode: "auto", autoFilter: "popular" },
    { id: "new", label: "New Arrivals", emoji: "✨", enabled: true, hideOnMobile: true, selectionMode: "auto", autoFilter: "newest" },
    { id: "sale", label: "On Sale", emoji: "💰", enabled: true, selectionMode: "auto", autoFilter: "on_sale" },
  ],
};

// GET - Lấy cấu hình
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    if (setting) {
      return NextResponse.json(JSON.parse(setting.value));
    }

    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error("Error fetching trending tabs config:", error);
    return NextResponse.json(defaultConfig);
  }
}

// PUT - Cập nhật cấu hình (Admin only)
export async function PUT(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required"
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }

  try {
    const body: TrendingTabsConfig = await request.json();

    // Validate
    if (!body.tabs || !Array.isArray(body.tabs)) {
      return NextResponse.json({ error: "Invalid tabs configuration" }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value: JSON.stringify(body) },
      create: { key: SETTING_KEY, value: JSON.stringify(body), group: "homepage" },
    });

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Error saving trending tabs config:", error);
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 });
  }
}
