import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List all WooCommerce sites
export async function GET() {
  try {
    const sites = await prisma.wooCommerceSite.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { syncLogs: true } },
      },
    });

    // Mask secrets for security
    const safeSites = sites.map((site) => ({
      ...site,
      consumerKey: site.consumerKey.substring(0, 10) + "...",
      consumerSecret: "***hidden***",
    }));

    return NextResponse.json(safeSites);
  } catch (error) {
    console.error("Error fetching sites:", error);
    // Return empty array instead of error object for better client handling
    return NextResponse.json([]);
  }
}

// POST - Create new WooCommerce site
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, consumerKey, consumerSecret } = body;

    if (!name || !url || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize URL
    const normalizedUrl = url.replace(/\/$/, "");

    // Test connection first - use Basic Auth for HTTP, query params for HTTPS
    const testUrl = new URL(`${normalizedUrl}/wp-json/wc/v3/products`);
    testUrl.searchParams.set("per_page", "1");
    
    const isHttps = normalizedUrl.startsWith("https://");
    const headers: HeadersInit = {};
    
    if (isHttps) {
      // HTTPS: use query params
      testUrl.searchParams.set("consumer_key", consumerKey);
      testUrl.searchParams.set("consumer_secret", consumerSecret);
    } else {
      // HTTP: use Basic Auth
      const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    const testResponse = await fetch(testUrl.toString(), { headers });
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return NextResponse.json(
        { error: `Connection failed: ${testResponse.status} - ${errorText}` },
        { status: 400 }
      );
    }

    // Create site
    const site = await prisma.wooCommerceSite.create({
      data: {
        name,
        url: normalizedUrl,
        consumerKey,
        consumerSecret,
      },
    });

    return NextResponse.json({
      ...site,
      consumerKey: site.consumerKey.substring(0, 10) + "...",
      consumerSecret: "***hidden***",
    });
  } catch (error) {
    console.error("Error creating site:", error);
    const err = error as { code?: string; message?: string };
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Site with this URL already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Failed to create site: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
