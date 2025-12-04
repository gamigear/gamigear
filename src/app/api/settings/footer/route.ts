import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

const FOOTER_SETTINGS_KEY = "footer_settings";

interface FooterSettings {
  companyName: { ko: string; en: string; vi: string };
  ceo: { ko: string; en: string; vi: string };
  address: { ko: string; en: string; vi: string };
  businessNo: string;
  salesNo: string;
  phone: string;
  fax: string;
  email: string;
  hours: { ko: string; en: string; vi: string };
  lunchTime: { ko: string; en: string; vi: string };
  disclaimer: { ko: string; en: string; vi: string };
  copyright: { ko: string; en: string; vi: string };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    kakao?: string;
    naver?: string;
  };
}

const defaultSettings: FooterSettings = {
  companyName: {
    ko: "(주)아이스크림미디어",
    en: "i-Scream Media Co., Ltd.",
    vi: "Công ty TNHH i-Scream Media",
  },
  ceo: {
    ko: "대표이사 : 홍길동",
    en: "CEO: Hong Gil Dong",
    vi: "Giám đốc: Hong Gil Dong",
  },
  address: {
    ko: "주소 : 경기도 성남시 분당구 판교역로 225-20",
    en: "Address: 225-20 Pangyoyeok-ro, Bundang-gu, Seongnam-si, Gyeonggi-do",
    vi: "Địa chỉ: 225-20 Pangyoyeok-ro, Bundang-gu, Seongnam-si, Gyeonggi-do",
  },
  businessNo: "123-45-67890",
  salesNo: "2024-경기성남-12345",
  phone: "1544-6040",
  fax: "02-3444-0308",
  email: "support@gamigear.com",
  hours: {
    ko: "평일 09:00 ~ 18:00 (주말, 공휴일 휴무)",
    en: "Weekdays 09:00 ~ 18:00 (Closed on weekends and holidays)",
    vi: "Thứ 2-6: 09:00 ~ 18:00 (Nghỉ cuối tuần và ngày lễ)",
  },
  lunchTime: {
    ko: "점심시간 12:00 ~ 13:00",
    en: "Lunch 12:00 ~ 13:00",
    vi: "Nghỉ trưa 12:00 ~ 13:00",
  },
  disclaimer: {
    ko: "Gamigear에서 판매되는 상품중에는 위탁판매자가 판매하는 상품이 포함되어 있습니다.",
    en: "Some products sold on Gamigear are sold by consignment sellers.",
    vi: "Một số sản phẩm trên Gamigear được bán bởi người bán ký gửi.",
  },
  copyright: {
    ko: "Copyright © (주)아이스크림미디어. All Rights Reserved",
    en: "Copyright © i-Scream Media Co., Ltd. All Rights Reserved",
    vi: "Copyright © i-Scream Media Co., Ltd. All Rights Reserved",
  },
  socialLinks: {},
};

// GET - Get footer settings
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: FOOTER_SETTINGS_KEY },
    });

    if (!setting) {
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(JSON.parse(setting.value));
  } catch (error) {
    console.error("Error fetching footer settings:", error);
    return NextResponse.json(defaultSettings);
  }
}

// PUT - Update footer settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    await prisma.setting.upsert({
      where: { key: FOOTER_SETTINGS_KEY },
      update: { value: JSON.stringify(body) },
      create: {
        key: FOOTER_SETTINGS_KEY,
        value: JSON.stringify(body),
        group: "general",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating footer settings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 500 }
    );
  }
}
