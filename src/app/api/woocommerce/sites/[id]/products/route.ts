import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WCProduct {
  id: number;
  name: string;
  slug: string;
  status: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ id: number; src: string; alt: string }>;
  sku: string;
  type: string;
}

// GET - List products from WooCommerce site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "20";
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const site = await prisma.wooCommerceSite.findUnique({
      where: { id },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Build WooCommerce API URL
    const url = new URL(`${site.url}/wp-json/wc/v3/products`);
    url.searchParams.set("page", page);
    url.searchParams.set("per_page", perPage);
    url.searchParams.set("status", "publish");

    if (search) url.searchParams.set("search", search);
    if (category) url.searchParams.set("category", category);

    // Use Basic Auth for HTTP, query params for HTTPS
    const isHttps = site.url.startsWith("https://");
    const headers: HeadersInit = {};
    
    if (isHttps) {
      url.searchParams.set("consumer_key", site.consumerKey);
      url.searchParams.set("consumer_secret", site.consumerSecret);
    } else {
      const credentials = Buffer.from(`${site.consumerKey}:${site.consumerSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`);
    }

    const products: WCProduct[] = await response.json();
    const totalProducts = response.headers.get("X-WP-Total") || "0";
    const totalPages = response.headers.get("X-WP-TotalPages") || "1";

    // Check which products already exist locally
    const slugs = products.map((p: WCProduct) => p.slug);
    const existingProducts = await prisma.product.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    const existingSlugs = new Set(existingProducts.map((p: { slug: string }) => p.slug));

    // Add sync status to products
    const productsWithStatus = products.map((p) => ({
      ...p,
      alreadySynced: existingSlugs.has(p.slug),
    }));

    return NextResponse.json({
      products: productsWithStatus,
      pagination: {
        page: parseInt(page),
        perPage: parseInt(perPage),
        total: parseInt(totalProducts),
        totalPages: parseInt(totalPages),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}
