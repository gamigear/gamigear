/**
 * Full WooCommerce Sync Script
 * 1. Xóa tất cả sản phẩm và danh mục hiện tại
 * 2. Tạo/cập nhật WooCommerce site
 * 3. Sync tất cả sản phẩm và danh mục từ WooCommerce
 * 
 * Usage: npx tsx scripts/full-sync-woocommerce.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WOO_URL = process.env.WOO_URL || "http://localhost:8000";
const WOO_CONSUMER_KEY = process.env.WOO_CONSUMER_KEY || "";
const WOO_CONSUMER_SECRET = process.env.WOO_CONSUMER_SECRET || "";

interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  image: { id: number; src: string; alt: string } | null;
}

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
  images: Array<{ id: number; src: string; name: string; alt: string }>;
  weight: string;
  featured: boolean;
  type: string;
  attributes: Array<{
    id: number;
    name: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }>;
  variations: number[];
}

interface WCVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_quantity: number | null;
  stock_status: string;
  manage_stock: boolean;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  image: { id: number; src: string; alt: string } | null;
  attributes: Array<{ id: number; name: string; option: string }>;
}

async function fetchWC<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${WOO_URL}/wp-json/wc/v3/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const isHttps = WOO_URL.startsWith("https://");
  const headers: HeadersInit = {};

  if (isHttps) {
    url.searchParams.set("consumer_key", WOO_CONSUMER_KEY);
    url.searchParams.set("consumer_secret", WOO_CONSUMER_SECRET);
  } else {
    const credentials = Buffer.from(`${WOO_CONSUMER_KEY}:${WOO_CONSUMER_SECRET}`).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  }

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`WooCommerce API error: ${response.status} - ${await response.text()}`);
  }
  return response.json();
}

async function main() {
  console.log("🚀 Starting Full WooCommerce Sync...\n");
  console.log(`📡 WooCommerce URL: ${WOO_URL}`);

  if (!WOO_CONSUMER_KEY || !WOO_CONSUMER_SECRET) {
    console.error("❌ Missing WOO_CONSUMER_KEY or WOO_CONSUMER_SECRET in .env");
    process.exit(1);
  }

  // Test connection
  console.log("\n🔗 Testing WooCommerce connection...");
  try {
    await fetchWC<WCProduct[]>("products", { per_page: "1" });
    console.log("✅ Connection successful!");
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }

  // Step 1: Delete all existing products and categories
  console.log("\n🗑️  Deleting existing data...");
  
  // Delete in correct order due to foreign key constraints
  await prisma.productCategory.deleteMany({});
  await prisma.productTag.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.productVariation.deleteMany({});
  await prisma.relatedProduct.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  
  console.log("✅ All products and categories deleted!");

  // Step 2: Sync Categories
  console.log("\n📁 Syncing categories...");
  const categoryMap = new Map<number, string>(); // WC ID -> Local ID
  let page = 1;
  let totalCategories = 0;

  while (true) {
    const categories = await fetchWC<WCCategory[]>("products/categories", {
      per_page: "100",
      page: page.toString(),
    });

    if (categories.length === 0) break;

    for (const cat of categories) {
      try {
        const created = await prisma.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description || null,
            image: cat.image?.src || null,
          },
        });
        categoryMap.set(cat.id, created.id);
        totalCategories++;
      } catch (error) {
        console.error(`  ⚠️ Failed to create category ${cat.name}:`, error);
      }
    }

    page++;
    if (categories.length < 100) break;
  }
  console.log(`✅ Synced ${totalCategories} categories!`);

  // Step 3: Sync Products
  console.log("\n📦 Syncing products...");
  page = 1;
  let totalProducts = 0;
  let totalVariations = 0;

  while (true) {
    const products = await fetchWC<WCProduct[]>("products", {
      per_page: "100",
      page: page.toString(),
      status: "publish",
    });

    if (products.length === 0) break;

    for (const product of products) {
      try {
        // Parse prices
        const price = parseFloat(product.price) || 0;
        const regularPrice = parseFloat(product.regular_price) || price;
        const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;

        // Create product
        const created = await prisma.product.create({
          data: {
            name: product.name,
            slug: product.slug,
            description: product.description || null,
            shortDescription: product.short_description || null,
            sku: product.sku || null,
            price: price,
            regularPrice: regularPrice > price ? regularPrice : null,
            salePrice: salePrice,
            onSale: salePrice !== null && salePrice < regularPrice,
            stockQuantity: product.stock_quantity ?? null,
            stockStatus: product.stock_status || "instock",
            manageStock: product.manage_stock,
            weight: product.weight || null,
            status: "publish",
            featured: product.featured,
            productType: product.type || "simple",
          },
        });

        // Add images
        for (let i = 0; i < product.images.length; i++) {
          const img = product.images[i];
          await prisma.productImage.create({
            data: {
              productId: created.id,
              src: img.src,
              alt: img.alt || product.name,
              position: i,
            },
          });
        }

        // Add attributes
        for (const attr of product.attributes) {
          await prisma.productAttribute.create({
            data: {
              productId: created.id,
              name: attr.name,
              value: attr.options.join(", "),
              position: attr.position,
              visible: attr.visible,
              variation: attr.variation,
            },
          });
        }

        // Link categories
        for (const cat of product.categories) {
          const localCatId = categoryMap.get(cat.id);
          if (localCatId) {
            await prisma.productCategory.create({
              data: {
                productId: created.id,
                categoryId: localCatId,
              },
            }).catch(() => {});
          }
        }

        // Sync variations for variable products
        if (product.type === "variable" && product.variations.length > 0) {
          try {
            const variations = await fetchWC<WCVariation[]>(
              `products/${product.id}/variations`,
              { per_page: "100" }
            );

            for (let i = 0; i < variations.length; i++) {
              const variation = variations[i];
              const vPrice = parseFloat(variation.price) || 0;
              const vRegularPrice = parseFloat(variation.regular_price) || vPrice;
              const vSalePrice = variation.sale_price ? parseFloat(variation.sale_price) : null;

              await prisma.productVariation.create({
                data: {
                  productId: created.id,
                  wcVariationId: variation.id,
                  sku: variation.sku || null,
                  price: vPrice,
                  regularPrice: vRegularPrice > vPrice ? vRegularPrice : null,
                  salePrice: vSalePrice,
                  onSale: variation.on_sale,
                  stockQuantity: variation.stock_quantity ?? null,
                  stockStatus: variation.stock_status || "instock",
                  manageStock: variation.manage_stock,
                  weight: variation.weight || null,
                  length: variation.dimensions?.length || null,
                  width: variation.dimensions?.width || null,
                  height: variation.dimensions?.height || null,
                  image: variation.image?.src || null,
                  attributes: JSON.stringify(variation.attributes),
                  position: i,
                },
              });
              totalVariations++;
            }
          } catch (error) {
            console.error(`  ⚠️ Failed to sync variations for ${product.name}:`, error);
          }
        }

        totalProducts++;
        process.stdout.write(`\r  📦 Synced ${totalProducts} products, ${totalVariations} variations...`);
      } catch (error) {
        console.error(`\n  ⚠️ Failed to sync product ${product.name}:`, error);
      }
    }

    page++;
    if (products.length < 100) break;
  }

  console.log(`\n✅ Synced ${totalProducts} products with ${totalVariations} variations!`);

  // Update category counts
  console.log("\n📊 Updating category counts...");
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    const count = await prisma.productCategory.count({
      where: { categoryId: cat.id },
    });
    await prisma.category.update({
      where: { id: cat.id },
      data: { count },
    });
  }

  console.log("\n🎉 Full sync completed!");
  console.log(`   - Categories: ${totalCategories}`);
  console.log(`   - Products: ${totalProducts}`);
  console.log(`   - Variations: ${totalVariations}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("❌ Sync failed:", error);
  prisma.$disconnect();
  process.exit(1);
});
