import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

const MOBILE_MENU_KEY = "mobile_menu_settings";

interface MobileMenuItem {
  id: string;
  name: { ko: string; en: string; vi: string };
  icon: string; // Icon name from lucide-react
  href: string;
  isActive: boolean;
  position: number;
}

const defaultItems: MobileMenuItem[] = [
  { id: "home", name: { ko: "홈", en: "Home", vi: "Trang chủ" }, icon: "Home", href: "/", isActive: true, position: 0 },
  { id: "search", name: { ko: "검색", en: "Search", vi: "Tìm kiếm" }, icon: "Search", href: "/search", isActive: true, position: 1 },
  { id: "categories", name: { ko: "카테고리", en: "Categories", vi: "Danh mục" }, icon: "Grid3X3", href: "/categories", isActive: true, position: 2 },
  { id: "account", name: { ko: "마이페이지", en: "Account", vi: "Tài khoản" }, icon: "User", href: "/mypage", isActive: true, position: 3 },
  { id: "cart", name: { ko: "장바구니", en: "Cart", vi: "Giỏ hàng" }, icon: "ShoppingCart", href: "/cart", isActive: true, position: 4 },
];

// GET - Get mobile menu settings
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: MOBILE_MENU_KEY },
    });

    if (!setting) {
      return NextResponse.json({ items: defaultItems });
    }

    return NextResponse.json(JSON.parse(setting.value));
  } catch (error) {
    console.error("Error fetching mobile menu:", error);
    return NextResponse.json({ items: defaultItems });
  }
}

// PUT - Update mobile menu settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    await prisma.setting.upsert({
      where: { key: MOBILE_MENU_KEY },
      update: { value: JSON.stringify(body) },
      create: {
        key: MOBILE_MENU_KEY,
        value: JSON.stringify(body),
        group: "general",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating mobile menu:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 500 }
    );
  }
}
