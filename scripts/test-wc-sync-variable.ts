/**
 * Test script để sync 1 sản phẩm có biến thể từ WooCommerce
 * 
 * Cách chạy:
 * npx ts-node scripts/test-wc-sync-variable.ts
 * 
 * Hoặc:
 * npx tsx scripts/test-wc-sync-variable.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Cấu hình WooCommerce site (sử dụng biến từ .env)
const WC_CONFIG = {
  url: process.env.WOO_URL || "http://localhost:8000",
  consumerKey: process.env.WOO_CONSUMER_KEY || "ck_xxx",
  consumerSecret: process.env.WOO_CONSUMER_SECRET || "cs_xxx",
};

// ID sản phẩm có biến thể cần test (thay đổi theo site của bạn)
const VARIABLE_PRODUCT_ID = parseInt(process.env.WC_PRODUCT_ID || "0");

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
  const url = new URL(`${WC_CONFIG.url}/wp-json/wc/v3/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const isHttps = WC_CONFIG.url.startsWith("https://");
  const headers: HeadersInit = {};

  if (isHttps) {
    url.searchParams.set("consumer_key", WC_CONFIG.consumerKey);
    url.searchParams.set("consumer_secret", WC_CONFIG.consumerSecret);
  } else {
    const credentials = Buffer.from(`${WC_CONFIG.consumerKey}:${WC_CONFIG.consumerSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  }

  console.log(`📡 Fetching: ${endpoint}`);
  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WooCommerce API error: ${response.status} - ${text}`);
  }
  
  return response.json();
}

async function testSyncVariableProduct() {
  console.log("🚀 Bắt đầu test sync sản phẩm có biến thể từ WooCommerce\n");
  console.log("📋 Cấu hình:");
  console.log(`   - URL: ${WC_CONFIG.url}`);
  console.log(`   - Product ID: ${VARIABLE_PRODUCT_ID}\n`);

  if (!VARIABLE_PRODUCT_ID) {
    console.error("❌ Vui lòng set WC_PRODUCT_ID trong .env hoặc environment");
    console.log("\nVí dụ: WC_PRODUCT_ID=123 npx tsx scripts/test-wc-sync-variable.ts");
    return;
  }

  try {
    // 1. Fetch sản phẩm từ WooCommerce
    console.log("📦 Đang fetch sản phẩm từ WooCommerce...");
    const product = await fetchWC<WCProduct>(`products/${VARIABLE_PRODUCT_ID}`);
    
    console.log(`\n✅ Đã fetch sản phẩm: ${product.name}`);
    console.log(`   - Type: ${product.type}`);
    console.log(`   - Slug: ${product.slug}`);
    console.log(`   - SKU: ${product.sku || "(không có)"}`);
    console.log(`   - Price: ${product.price}`);
    console.log(`   - Status: ${product.status}`);
    console.log(`   - Images: ${product.images.length}`);
    console.log(`   - Attributes: ${product.attributes.length}`);
    console.log(`   - Variations: ${product.variations.length}`);

    // 2. Hiển thị attributes
    if (product.attributes.length > 0) {
      console.log("\n📝 Attributes:");
      for (const attr of product.attributes) {
        console.log(`   - ${attr.name}: ${attr.options.join(", ")} (variation: ${attr.variation})`);
      }
    }

    // 3. Fetch variations nếu là variable product
    if (product.type === "variable" && product.variations.length > 0) {
      console.log("\n🔄 Đang fetch variations...");
      const variations = await fetchWC<WCVariation[]>(
        `products/${VARIABLE_PRODUCT_ID}/variations`,
        { per_page: "100" }
      );

      console.log(`\n✅ Đã fetch ${variations.length} variations:`);
      for (const v of variations) {
        const attrs = v.attributes.map(a => `${a.name}: ${a.option}`).join(", ");
        console.log(`   - ID ${v.id}: ${attrs}`);
        console.log(`     Price: ${v.price}, Regular: ${v.regular_price}, Sale: ${v.sale_price || "N/A"}`);
        console.log(`     Stock: ${v.stock_status} (${v.stock_quantity ?? "N/A"})`);
        console.log(`     Image: ${v.image?.src ? "Có" : "Không"}`);
      }

      // 4. Tạo sản phẩm trong database (test)
      console.log("\n💾 Đang tạo sản phẩm trong database...");
      
      // Kiểm tra xem sản phẩm đã tồn tại chưa
      const existing = await prisma.product.findUnique({
        where: { slug: product.slug },
        include: { variations: true, images: true, attributes: true },
      });

      if (existing) {
        console.log(`⚠️  Sản phẩm đã tồn tại với slug: ${product.slug}`);
        console.log(`   - ID: ${existing.id}`);
        console.log(`   - Variations: ${existing.variations.length}`);
        console.log(`   - Images: ${existing.images.length}`);
        
        // Hỏi có muốn xóa và tạo lại không
        console.log("\n🗑️  Đang xóa sản phẩm cũ để test lại...");
        await prisma.product.delete({ where: { id: existing.id } });
        console.log("✅ Đã xóa sản phẩm cũ");
      }

      // Tạo sản phẩm mới
      const price = parseFloat(product.price) || 0;
      const regularPrice = parseFloat(product.regular_price) || price;
      const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;

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
          onSale: salePrice !== null && salePrice < regularPrice,
          stockQuantity: product.stock_quantity ?? null,
          stockStatus: product.stock_status || "instock",
          manageStock: product.manage_stock,
          weight: product.weight || null,
          status: product.status === "publish" ? "publish" : "draft",
          featured: product.featured,
          productType: "variable",
        },
      });

      console.log(`\n✅ Đã tạo sản phẩm: ${newProduct.id}`);

      // Tạo images (không download, chỉ lưu URL gốc để test)
      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        await prisma.productImage.create({
          data: {
            productId: newProduct.id,
            src: img.src,
            alt: img.alt || product.name,
            position: i,
          },
        });
      }
      console.log(`✅ Đã tạo ${product.images.length} images`);

      // Tạo attributes
      for (const attr of product.attributes) {
        await prisma.productAttribute.create({
          data: {
            productId: newProduct.id,
            name: attr.name,
            value: attr.options.join(", "),
            position: attr.position,
            visible: attr.visible,
            variation: attr.variation,
          },
        });
      }
      console.log(`✅ Đã tạo ${product.attributes.length} attributes`);

      // Tạo variations
      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        const vPrice = parseFloat(v.price) || 0;
        const vRegularPrice = parseFloat(v.regular_price) || vPrice;
        const vSalePrice = v.sale_price ? parseFloat(v.sale_price) : null;

        await prisma.productVariation.create({
          data: {
            productId: newProduct.id,
            wcVariationId: v.id,
            sku: v.sku || null,
            price: vPrice,
            regularPrice: vRegularPrice > vPrice ? vRegularPrice : null,
            salePrice: vSalePrice,
            onSale: v.on_sale,
            stockQuantity: v.stock_quantity ?? null,
            stockStatus: v.stock_status || "instock",
            manageStock: v.manage_stock,
            weight: v.weight || null,
            length: v.dimensions?.length || null,
            width: v.dimensions?.width || null,
            height: v.dimensions?.height || null,
            image: v.image?.src || null,
            attributes: JSON.stringify(v.attributes),
            position: i,
          },
        });
      }
      console.log(`✅ Đã tạo ${variations.length} variations`);

      // 5. Verify kết quả
      console.log("\n🔍 Kiểm tra kết quả trong database...");
      const savedProduct = await prisma.product.findUnique({
        where: { id: newProduct.id },
        include: {
          variations: true,
          images: true,
          attributes: true,
        },
      });

      if (savedProduct) {
        console.log(`\n✅ Sản phẩm đã được lưu thành công:`);
        console.log(`   - ID: ${savedProduct.id}`);
        console.log(`   - Name: ${savedProduct.name}`);
        console.log(`   - Type: ${savedProduct.productType}`);
        console.log(`   - Images: ${savedProduct.images.length}`);
        console.log(`   - Attributes: ${savedProduct.attributes.length}`);
        console.log(`   - Variations: ${savedProduct.variations.length}`);

        console.log("\n📊 Chi tiết variations:");
        for (const v of savedProduct.variations) {
          const attrs = JSON.parse(v.attributes || "[]");
          const attrStr = attrs.map((a: { name: string; option: string }) => `${a.name}: ${a.option}`).join(", ");
          console.log(`   - ${attrStr}`);
          console.log(`     Price: ${v.price}, Stock: ${v.stockStatus}`);
        }
      }

    } else {
      console.log("\n⚠️  Sản phẩm này không phải là variable product hoặc không có variations");
      console.log("   Vui lòng chọn một sản phẩm có biến thể để test");
    }

    console.log("\n🎉 Test hoàn tất!");

  } catch (error) {
    console.error("\n❌ Lỗi:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testSyncVariableProduct();
