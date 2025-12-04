import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default menus
const defaultMenus = {
  topbar: [
    { id: "1", name: "Gamigear", href: "/", isExternal: false, isActive: true },
    { id: "2", name: "Blog", href: "/blog", isExternal: false, isActive: true },
    { id: "3", name: "Liên hệ", href: "/contact", isExternal: false, isActive: true },
  ],
  main: [
    { id: "1", name: "Bán chạy", href: "/category/best", isExternal: false, isActive: true, highlight: false },
    { id: "2", name: "Sản phẩm mới", href: "/category/new", isExternal: false, isActive: true, highlight: false },
    { id: "3", name: "Khuyến mãi", href: "/category/sale", isExternal: false, isActive: true, highlight: true },
    { id: "4", name: "Blog", href: "/blog", isExternal: false, isActive: true, highlight: false },
  ],
};

export async function GET() {
  try {
    // Try to get menus from settings
    const setting = await prisma.setting.findUnique({
      where: { key: "site_menus" },
    });

    if (setting?.value) {
      const menus = JSON.parse(setting.value);
      return NextResponse.json({ data: menus });
    }

    // Return default menus if not found
    return NextResponse.json({ data: defaultMenus });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json({ data: defaultMenus });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const menus = await request.json();

    // Save to settings
    await prisma.setting.upsert({
      where: { key: "site_menus" },
      update: { value: JSON.stringify(menus) },
      create: { key: "site_menus", value: JSON.stringify(menus) },
    });

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error("Error saving menus:", error);
    return NextResponse.json(
      { error: "Failed to save menus" },
      { status: 500 }
    );
  }
}
