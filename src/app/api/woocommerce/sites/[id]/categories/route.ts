import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image: { id: number; src: string; alt: string } | null;
}

// GET - List categories from WooCommerce site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const site = await prisma.wooCommerceSite.findUnique({
      where: { id },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Fetch all categories
    const allCategories: WCCategory[] = [];
    let page = 1;
    let hasMore = true;

    // Use Basic Auth for HTTP, query params for HTTPS
    const isHttps = site.url.startsWith("https://");
    const authHeaders: HeadersInit = {};
    if (!isHttps) {
      const credentials = Buffer.from(`${site.consumerKey}:${site.consumerSecret}`).toString("base64");
      authHeaders["Authorization"] = `Basic ${credentials}`;
    }

    while (hasMore) {
      const url = new URL(`${site.url}/wp-json/wc/v3/products/categories`);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("per_page", "100");
      
      if (isHttps) {
        url.searchParams.set("consumer_key", site.consumerKey);
        url.searchParams.set("consumer_secret", site.consumerSecret);
      }

      const response = await fetch(url.toString(), { headers: authHeaders });
      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status}`);
      }

      const categories: WCCategory[] = await response.json();
      allCategories.push(...categories);

      page++;
      if (categories.length < 100) hasMore = false;
    }

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
