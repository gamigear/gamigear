import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Shopee API endpoints for different regions
const SHOPEE_REGIONS: Record<string, string> = {
  "shopee.vn": "https://shopee.vn/api/v4/item/get",
  "shopee.co.id": "https://shopee.co.id/api/v4/item/get",
  "shopee.co.th": "https://shopee.co.th/api/v4/item/get",
  "shopee.com.my": "https://shopee.com.my/api/v4/item/get",
  "shopee.sg": "https://shopee.sg/api/v4/item/get",
  "shopee.ph": "https://shopee.ph/api/v4/item/get",
  "shopee.com.br": "https://shopee.com.br/api/v4/item/get",
  "shopee.kr": "https://shopee.kr/api/v4/item/get",
};

interface ShopeeProduct {
  itemid: number;
  shopid: number;
  name: string;
  description: string;
  price: number;
  price_min: number;
  price_max: number;
  price_before_discount: number;
  stock: number;
  images: string[];
  image: string;
  rating_star: number;
  item_rating: {
    rating_star: number;
    rating_count: number[];
  };
  sold: number;
  historical_sold: number;
  brand: string;
  tier_variations: Array<{
    name: string;
    options: string[];
    images?: string[];
  }>;
}

// POST /api/products/scrape-shopee - Scrape product from Shopee URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, saveToDb = false } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract shopid and itemid from URL
    const { shopId, itemId, region } = extractShopeeIds(url);
    
    if (!shopId || !itemId) {
      return NextResponse.json(
        { error: "Invalid Shopee URL. Could not extract shop ID and item ID." },
        { status: 400 }
      );
    }

    // Get API endpoint for region
    const apiEndpoint = SHOPEE_REGIONS[region] || SHOPEE_REGIONS["shopee.vn"];

    // Fetch product data from Shopee API
    const productData = await fetchShopeeProduct(apiEndpoint, shopId, itemId);

    if (!productData) {
      return NextResponse.json(
        { 
          error: "Không thể lấy thông tin sản phẩm từ Shopee. Shopee có thể đã chặn request. Vui lòng thử lại sau hoặc sử dụng chức năng nhập file Excel từ Shopee Seller Center.",
          suggestion: "Bạn có thể xuất sản phẩm từ Shopee Seller Center và import file Excel thay thế."
        },
        { status: 404 }
      );
    }

    // Map to our product format
    const mappedProduct = mapShopeeToProduct(productData, region);

    // Optionally save to database
    if (saveToDb) {
      const savedProduct = await saveProduct(mappedProduct);
      return NextResponse.json({
        success: true,
        message: "Product imported successfully",
        product: savedProduct,
        source: "shopee",
      });
    }

    // Return preview data
    return NextResponse.json({
      success: true,
      product: mappedProduct,
      source: "shopee",
      raw: productData, // Include raw data for debugging
    });
  } catch (error: any) {
    console.error("Shopee scrape error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scrape Shopee product" },
      { status: 500 }
    );
  }
}

function extractShopeeIds(url: string): { shopId: string | null; itemId: string | null; region: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Pattern 1: https://shopee.vn/product-name-i.{shopid}.{itemid}
    const pattern1 = /i\.(\d+)\.(\d+)/;
    const match1 = url.match(pattern1);
    if (match1) {
      return { shopId: match1[1], itemId: match1[2], region: hostname };
    }

    // Pattern 2: https://shopee.vn/product?shopid=XXX&itemid=XXX
    const shopId = urlObj.searchParams.get("shopid");
    const itemId = urlObj.searchParams.get("itemid");
    if (shopId && itemId) {
      return { shopId, itemId, region: hostname };
    }

    // Pattern 3: Short URL - need to follow redirect
    // For now, return null and handle separately
    return { shopId: null, itemId: null, region: hostname };
  } catch {
    return { shopId: null, itemId: null, region: "shopee.vn" };
  }
}

async function fetchShopeeProduct(
  apiEndpoint: string,
  shopId: string,
  itemId: string
): Promise<ShopeeProduct | null> {
  // Try multiple API versions
  const apiVersions = [
    `${apiEndpoint}?itemid=${itemId}&shopid=${shopId}`,
    apiEndpoint.replace("/v4/", "/v2/").replace("/item/get", `/item/get?itemid=${itemId}&shopid=${shopId}`),
  ];

  for (const apiUrl of apiVersions) {
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "Origin": "https://shopee.vn",
          "Referer": `https://shopee.vn/product/${shopId}/${itemId}`,
          "X-Requested-With": "XMLHttpRequest",
          "X-API-SOURCE": "pc",
          "X-Shopee-Language": "vi",
          "If-None-Match-": "*",
          "Connection": "keep-alive",
        },
      });

      if (!response.ok) {
        console.error("Shopee API error:", response.status, apiUrl);
        continue;
      }

      const data = await response.json();
      
      // Handle different response structures
      if (data.data) {
        return data.data;
      }
      if (data.item) {
        return data.item;
      }
      if (data.error === 0 && data.data) {
        return data.data;
      }
    } catch (error) {
      console.error("Error fetching from Shopee:", error);
      continue;
    }
  }

  // Try fetching from product page HTML as fallback
  return await fetchFromProductPage(shopId, itemId);
}

async function fetchFromProductPage(shopId: string, itemId: string): Promise<ShopeeProduct | null> {
  try {
    const pageUrl = `https://shopee.vn/product/${shopId}/${itemId}`;
    
    const response = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    // Try to extract JSON data from script tags
    const scriptMatch = html.match(/<script[^>]*>window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?})<\/script>/);
    if (scriptMatch) {
      try {
        const initialState = JSON.parse(scriptMatch[1]);
        if (initialState.item?.item) {
          return initialState.item.item;
        }
      } catch {
        // JSON parse failed
      }
    }

    // Try another pattern
    const dataMatch = html.match(/"item":\s*({[^}]+(?:{[^}]*}[^}]*)*})/);
    if (dataMatch) {
      try {
        return JSON.parse(dataMatch[1]);
      } catch {
        // JSON parse failed
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching product page:", error);
    return null;
  }
}

function mapShopeeToProduct(data: ShopeeProduct, region: string): any {
  // Convert price (Shopee stores price in smallest unit, e.g., VND * 100000)
  const priceMultiplier = region === "shopee.vn" ? 100000 : 100000;
  const price = data.price_min / priceMultiplier;
  const regularPrice = data.price_before_discount 
    ? data.price_before_discount / priceMultiplier 
    : price;

  // Build image URLs
  const imageBaseUrl = "https://down-vn.img.susercontent.com/file/";
  const images = data.images?.map((img: string) => ({
    src: img.startsWith("http") ? img : `${imageBaseUrl}${img}`,
    alt: data.name,
  })) || [];

  // If no images array, use main image
  if (images.length === 0 && data.image) {
    images.push({
      src: data.image.startsWith("http") ? data.image : `${imageBaseUrl}${data.image}`,
      alt: data.name,
    });
  }

  // Extract attributes from tier_variations
  const attributes = data.tier_variations?.map((variation, idx) => ({
    name: variation.name,
    value: variation.options.join(", "),
    position: idx,
    visible: true,
    variation: true,
  })) || [];

  return {
    name: data.name,
    description: data.description || "",
    shortDescription: data.description?.substring(0, 200) || "",
    sku: `SHOPEE-${data.shopid}-${data.itemid}`,
    price: price,
    regularPrice: regularPrice,
    salePrice: price < regularPrice ? price : null,
    stockQuantity: data.stock || 0,
    stockStatus: data.stock > 0 ? "instock" : "outofstock",
    status: "draft", // Import as draft for review
    featured: false,
    images: images,
    attributes: attributes,
    averageRating: data.item_rating?.rating_star || data.rating_star || 0,
    ratingCount: data.item_rating?.rating_count?.reduce((a, b) => a + b, 0) || 0,
    sold: data.historical_sold || data.sold || 0,
    brand: data.brand || "",
    sourceUrl: `https://${region}/product/i.${data.shopid}.${data.itemid}`,
    sourceShopId: String(data.shopid),
    sourceItemId: String(data.itemid),
  };
}

async function saveProduct(productData: any): Promise<any> {
  const { images, attributes, ...productFields } = productData;

  // Remove fields that don't exist in schema
  delete productFields.sold;
  delete productFields.brand;
  delete productFields.sourceUrl;
  delete productFields.sourceShopId;
  delete productFields.sourceItemId;
  delete productFields.averageRating;
  delete productFields.ratingCount;

  // Generate unique slug
  const { generateSlug: genSlug } = await import('@/lib/slug');
  const slug = genSlug(productFields.name) + "-" + Date.now();

  // Check if SKU already exists
  const existing = await prisma.product.findFirst({
    where: { sku: productFields.sku },
  });

  if (existing) {
    // Update existing product
    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: productFields,
      include: { images: true, attributes: true },
    });

    // Update images
    if (images?.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.createMany({
        data: images.map((img: any, idx: number) => ({
          productId: existing.id,
          src: img.src,
          alt: img.alt || "",
          position: idx,
        })),
      });
    }

    return updated;
  }

  // Create new product
  const newProduct = await prisma.product.create({
    data: {
      ...productFields,
      slug,
    },
  });

  // Create images
  if (images?.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((img: any, idx: number) => ({
        productId: newProduct.id,
        src: img.src,
        alt: img.alt || "",
        position: idx,
      })),
    });
  }

  // Create attributes
  if (attributes?.length > 0) {
    await prisma.productAttribute.createMany({
      data: attributes.map((attr: any) => ({
        productId: newProduct.id,
        name: attr.name,
        value: attr.value,
        position: attr.position || 0,
        visible: attr.visible ?? true,
        variation: attr.variation ?? false,
      })),
    });
  }

  return prisma.product.findUnique({
    where: { id: newProduct.id },
    include: { images: true, attributes: true },
  });
}
