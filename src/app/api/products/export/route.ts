import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import * as XLSX from "xlsx";

// GET /api/products/export - Export products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "xlsx";
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");

    // Build query
    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const products = await prisma.product.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Map products to export format
    const exportData = products.map((product: any) => ({
      ID: product.id,
      SKU: product.sku || "",
      "상품명": product.name,
      Slug: product.slug,
      "상품설명": product.description || "",
      "짧은설명": product.shortDescription || "",
      "가격": product.price,
      "정가": product.regularPrice || product.price,
      "할인가": product.salePrice || "",
      "재고": product.stockQuantity || 0,
      "재고상태": product.stockStatus || "instock",
      "상태": product.status,
      "추천상품": product.featured ? "Y" : "N",
      "카테고리": product.categories?.map((pc: any) => pc.category?.name).filter(Boolean).join(", ") || "",
      "이미지": product.images?.map((img: any) => img.src).join(";") || "",
      "생성일": product.createdAt.toISOString(),
      "수정일": product.updatedAt.toISOString(),
    }));

    if (format === "json") {
      return NextResponse.json(exportData, {
        headers: {
          "Content-Disposition": `attachment; filename="products-${Date.now()}.json"`,
        },
      });
    }

    if (format === "csv") {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="products-${Date.now()}.csv"`,
        },
      });
    }

    // Default: XLSX
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    worksheet["!cols"] = [
      { wch: 10 }, // ID
      { wch: 15 }, // SKU
      { wch: 40 }, // 상품명
      { wch: 30 }, // Slug
      { wch: 50 }, // 상품설명
      { wch: 30 }, // 짧은설명
      { wch: 12 }, // 가격
      { wch: 12 }, // 정가
      { wch: 12 }, // 할인가
      { wch: 8 },  // 재고
      { wch: 10 }, // 재고상태
      { wch: 10 }, // 상태
      { wch: 10 }, // 추천상품
      { wch: 20 }, // 카테고리
      { wch: 50 }, // 이미지
      { wch: 20 }, // 생성일
      { wch: 20 }, // 수정일
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="products-${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/products/export/template - Download import template
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "xlsx";

    const templateData = [
      {
        SKU: "SAMPLE-001",
        "상품명": "샘플 상품",
        "상품설명": "상품 설명을 입력하세요",
        "짧은설명": "짧은 설명",
        "가격": 10000,
        "정가": 12000,
        "할인가": "",
        "재고": 100,
        "재고상태": "instock",
        "상태": "publish",
        "추천상품": "N",
        "이미지": "https://example.com/image1.jpg;https://example.com/image2.jpg",
      },
    ];

    if (format === "json") {
      return NextResponse.json(templateData, {
        headers: {
          "Content-Disposition": `attachment; filename="product-template.json"`,
        },
      });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    worksheet["!cols"] = [
      { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 30 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 8 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 50 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="product-template.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
