import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorageService, isR2Configured } from "@/lib/storage";

// WooCommerce REST API types
interface WCProduct {
  id: number;
  name: string;
  slug: string;
  status: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  stock_status: string;
  manage_stock: boolean;
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ id: number; src: string; name: string; alt: string }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
    visible: boolean;
    variation: boolean;
  }>;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  type: string;
  featured: boolean;
}

interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  image: { id: number; src: string; alt: string } | null;
  count: number;
}

const WP_URL = process.env.WOO_URL || "http://localhost:8000";
const WC_KEY = process.env.WOO_CONSUMER_KEY || "";
const WC_SECRET = process.env.WOO_CONSUMER_SECRET || "";

// Fetch from WooCommerce REST API v3
async function fetchWC<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${WP_URL}/wp-json/wc/v3/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  // Add OAuth 1.0a authentication
  url.searchParams.set("consumer_key", WC_KEY);
  url.searchParams.set("consumer_secret", WC_SECRET);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WooCommerce API error: ${response.status} - ${errorText}`);
  }
  return response.json();
}

async function downloadAndUploadImage(imageUrl: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/jpeg";

    const storageProvider = isR2Configured() ? "r2" : "local";
    const storageService = getStorageService(storageProvider);

    const result = await storageService.upload(buffer, filename, contentType, {
      folder: "products",
      convertToWebp: true,
    });

    // Save to media table
    await prisma.$executeRaw`
      INSERT INTO Media (id, filename, originalName, mimeType, size, url, folder, storageProvider, width, height, createdAt, updatedAt)
      VALUES (${crypto.randomUUID()}, ${result.filename}, ${filename}, ${result.mimeType}, ${result.size}, ${result.url}, 'products', ${storageProvider}, ${result.width || null}, ${result.height || null}, datetime('now'), datetime('now'))
    `;

    return result.url;
  } catch (error) {
    console.error(`Failed to download image ${imageUrl}:`, error);
    return null;
  }
}

// GET - Check sync status
export async function GET() {
  try {
    // Check if API keys are configured
    if (!WC_KEY || !WC_SECRET) {
      return NextResponse.json({
        configured: false,
        connected: false,
        error: "WooCommerce API keys not configured. Set WOO_CONSUMER_KEY and WOO_CONSUMER_SECRET in .env",
        wpUrl: WP_URL,
      });
    }

    // Test connection with WooCommerce API
    const products = await fetchWC<WCProduct[]>("products", { per_page: "1" });

    return NextResponse.json({
      configured: true,
      connected: true,
      sampleProduct: products[0]?.name || null,
      productCount: products.length,
      wpUrl: WP_URL,
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      connected: false,
      error: error instanceof Error ? error.message : "Connection failed",
      wpUrl: WP_URL,
    });
  }
}

// POST - Sync products from WooCommerce
export async function POST(request: NextRequest) {
  try {
    // Check API keys
    if (!WC_KEY || !WC_SECRET) {
      return NextResponse.json(
        { error: "WooCommerce API keys not configured" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const syncImages = body.syncImages !== false;
    const perPage = Math.min(body.perPage || 100, 100);

    const results = {
      categories: { synced: 0, failed: 0 },
      products: { synced: 0, failed: 0, skipped: 0 },
      images: { uploaded: 0, failed: 0 },
    };

    // 1. Sync Categories first
    console.log("Syncing WooCommerce categories...");
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const categories = await fetchWC<WCCategory[]>("products/categories", {
        per_page: "100",
        page: page.toString(),
      });

      if (categories.length === 0) {
        hasMore = false;
        break;
      }

      for (const cat of categories) {
        try {
          // Download category image if exists
          let categoryImageUrl: string | null = null;
          if (syncImages && cat.image?.src) {
            const filename = `category-${cat.slug}.jpg`;
            categoryImageUrl = await downloadAndUploadImage(cat.image.src, filename);
            if (categoryImageUrl) {
              results.images.uploaded++;
            }
          }

          await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {
              name: cat.name,
              description: cat.description || null,
              image: categoryImageUrl || undefined,
            },
            create: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description || null,
              image: categoryImageUrl,
            },
          });
          results.categories.synced++;
        } catch (error) {
          console.error(`Failed to sync category ${cat.slug}:`, error);
          results.categories.failed++;
        }
      }

      page++;
      if (categories.length < 100) hasMore = false;
    }

    // 2. Sync Products
    console.log("Syncing WooCommerce products...");
    page = 1;
    hasMore = true;

    while (hasMore) {
      const products = await fetchWC<WCProduct[]>("products", {
        per_page: perPage.toString(),
        page: page.toString(),
        status: "publish",
      });

      if (products.length === 0) {
        hasMore = false;
        break;
      }

      for (const product of products) {
        try {
          // Check if product exists
          const existing = await prisma.product.findUnique({
            where: { slug: product.slug },
          });

          if (existing) {
            results.products.skipped++;
            continue;
          }

          // Download and upload product images
          const uploadedImages: Array<{ src: string; alt: string; position: number }> = [];
          
          if (syncImages && product.images.length > 0) {
            for (let i = 0; i < product.images.length; i++) {
              const img = product.images[i];
              const filename = `${product.slug}-${i}.jpg`;
              const uploadedUrl = await downloadAndUploadImage(img.src, filename);
              
              if (uploadedUrl) {
                uploadedImages.push({
                  src: uploadedUrl,
                  alt: img.alt || product.name,
                  position: i,
                });
                results.images.uploaded++;
              } else {
                results.images.failed++;
              }
            }
          }

          // Parse prices
          const price = parseFloat(product.price) || 0;
          const regularPrice = parseFloat(product.regular_price) || price;
          const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;

          // Create product with full WooCommerce data
          const newProduct = await prisma.product.create({
            data: {
              name: product.name,
              slug: product.slug,
              description: product.description || null,
              shortDescription: product.short_description || null,
              sku: product.sku || null,
              price: price,
              regularPrice: regularPrice > price ? regularPrice : null,
              salePrice: salePrice,
              stockQuantity: product.stock_quantity ?? null,
              stockStatus: product.stock_status || "instock",
              manageStock: product.manage_stock,
              weight: product.weight || null,
              status: product.status === "publish" ? "publish" : "draft",
              featured: product.featured,
            },
          });

          // Add product images
          for (const img of uploadedImages) {
            await prisma.productImage.create({
              data: {
                productId: newProduct.id,
                src: img.src,
                alt: img.alt,
                position: img.position,
              },
            });
          }

          // Link categories
          for (const cat of product.categories) {
            try {
              const category = await prisma.category.findUnique({
                where: { slug: cat.slug },
              });
              if (category) {
                await prisma.productCategory.create({
                  data: {
                    productId: newProduct.id,
                    categoryId: category.id,
                  },
                }).catch(() => {}); // Ignore duplicates
              }
            } catch {
              // Ignore category link errors
            }
          }

          results.products.synced++;
        } catch (error) {
          console.error(`Failed to sync product ${product.slug}:`, error);
          results.products.failed++;
        }
      }

      page++;
      if (products.length < perPage) hasMore = false;
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
