import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorageService, isR2Configured } from "@/lib/storage";

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
  variations: number[]; // Array of variation IDs for variable products
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

interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  image: { id: number; src: string; alt: string } | null;
}

async function downloadAndUploadImage(
  imageUrl: string,
  filename: string,
  preferredStorage?: "local" | "r2" | "auto"
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Determine storage provider based on preference
    let storageProvider: "local" | "r2";
    if (preferredStorage === "r2") {
      storageProvider = isR2Configured() ? "r2" : "local";
    } else if (preferredStorage === "local") {
      storageProvider = "local";
    } else {
      // auto - use R2 if configured, otherwise local
      storageProvider = isR2Configured() ? "r2" : "local";
    }
    
    const storageService = getStorageService(storageProvider);

    const result = await storageService.upload(buffer, filename, contentType, {
      folder: "products",
      convertToWebp: true,
    });

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

async function fetchWC<T>(
  site: { url: string; consumerKey: string; consumerSecret: string },
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${site.url}/wp-json/wc/v3/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

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
  return response.json();
}

// POST - Sync products from WooCommerce site
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      productIds = [], // Array of WC product IDs to sync (empty = sync all)
      categoryIds = [], // Array of WC category IDs to sync products from
      syncImages = true,
      syncCategories = true,
      storageProvider = "auto", // "local", "r2", or "auto"
      // Currency conversion options
      sourceCurrency = "USD", // Currency of WooCommerce site
      targetCurrency = "KRW", // Currency to convert to
      exchangeRate = 0, // Custom exchange rate (0 = use from database)
      convertPrices = false, // Whether to convert prices
    } = body;

    const site = await prisma.wooCommerceSite.findUnique({
      where: { id },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Determine sync type
    let syncType = "full";
    if (productIds.length > 0) syncType = "selective";
    else if (categoryIds.length > 0) syncType = "categories";

    // Create sync log
    const syncLog = await prisma.wooCommerceSyncLog.create({
      data: {
        siteId: site.id,
        type: syncType,
        status: "running",
      },
    });

    const results = {
      categories: { synced: 0, failed: 0 },
      products: { synced: 0, failed: 0, skipped: 0 },
      images: { uploaded: 0, failed: 0 },
      variations: { synced: 0, failed: 0 },
    };

    try {
      // 1. Sync Categories first (if enabled)
      if (syncCategories) {
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const categories = await fetchWC<WCCategory[]>(
            site,
            "products/categories",
            { per_page: "100", page: page.toString() }
          );

          if (categories.length === 0) break;

          for (const cat of categories) {
            try {
              let categoryImageUrl: string | null = null;
              if (syncImages && cat.image?.src) {
                const filename = `category-${cat.slug}.jpg`;
                categoryImageUrl = await downloadAndUploadImage(
                  cat.image.src,
                  filename,
                  storageProvider
                );
                if (categoryImageUrl) results.images.uploaded++;
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
            } catch {
              results.categories.failed++;
            }
          }

          page++;
          if (categories.length < 100) hasMore = false;
        }
      }

      // 2. Sync Products
      if (productIds.length > 0) {
        // Selective sync - fetch specific products
        for (const wcProductId of productIds) {
          try {
            const product = await fetchWC<WCProduct>(
              site,
              `products/${wcProductId}`
            );
            // Get exchange rate for currency conversion
            let finalExchangeRate = exchangeRate;
            if (convertPrices && exchangeRate === 0) {
              const sourceCurrencyData = await prisma.currency.findUnique({ where: { code: sourceCurrency } });
              const targetCurrencyData = await prisma.currency.findUnique({ where: { code: targetCurrency } });
              if (sourceCurrencyData && targetCurrencyData) {
                // Convert: source -> base (VND) -> target
                finalExchangeRate = sourceCurrencyData.exchangeRate / targetCurrencyData.exchangeRate;
              }
            }
            
            await syncProduct(product, syncImages, storageProvider, convertPrices, finalExchangeRate, results, site);
          } catch (error) {
            console.error(`Failed to sync product ${wcProductId}:`, error);
            results.products.failed++;
          }
        }
      } else if (categoryIds.length > 0) {
        // Get exchange rate for currency conversion
        let finalExchangeRate = exchangeRate;
        if (convertPrices && exchangeRate === 0) {
          const sourceCurrencyData = await prisma.currency.findUnique({ where: { code: sourceCurrency } });
          const targetCurrencyData = await prisma.currency.findUnique({ where: { code: targetCurrency } });
          if (sourceCurrencyData && targetCurrencyData) {
            finalExchangeRate = sourceCurrencyData.exchangeRate / targetCurrencyData.exchangeRate;
          }
        }
        
        // Sync by categories - fetch products from specific categories
        for (const categoryId of categoryIds) {
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const products = await fetchWC<WCProduct[]>(site, "products", {
              per_page: "100",
              page: page.toString(),
              status: "publish",
              category: categoryId.toString(),
            });

            if (products.length === 0) break;

            for (const product of products) {
              await syncProduct(product, syncImages, storageProvider, convertPrices, finalExchangeRate, results, site);
            }

            page++;
            if (products.length < 100) hasMore = false;
          }
        }
      } else {
        // Get exchange rate for currency conversion
        let finalExchangeRate = exchangeRate;
        if (convertPrices && exchangeRate === 0) {
          const sourceCurrencyData = await prisma.currency.findUnique({ where: { code: sourceCurrency } });
          const targetCurrencyData = await prisma.currency.findUnique({ where: { code: targetCurrency } });
          if (sourceCurrencyData && targetCurrencyData) {
            finalExchangeRate = sourceCurrencyData.exchangeRate / targetCurrencyData.exchangeRate;
          }
        }
        
        // Full sync - fetch all products
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const products = await fetchWC<WCProduct[]>(site, "products", {
            per_page: "100",
            page: page.toString(),
            status: "publish",
          });

          if (products.length === 0) break;

          for (const product of products) {
            await syncProduct(product, syncImages, storageProvider, convertPrices, finalExchangeRate, results, site);
          }

          page++;
          if (products.length < 100) hasMore = false;
        }
      }

      // Update sync log
      await prisma.wooCommerceSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "completed",
          categoriesSynced: results.categories.synced,
          productsSynced: results.products.synced,
          productsSkipped: results.products.skipped,
          productsFailed: results.products.failed,
          imagesUploaded: results.images.uploaded,
          imagesFailed: results.images.failed,
          completedAt: new Date(),
        },
      });

      // Update site stats
      await prisma.wooCommerceSite.update({
        where: { id: site.id },
        data: {
          lastSyncAt: new Date(),
          productCount: { increment: results.products.synced },
          categoryCount: { increment: results.categories.synced },
        },
      });

      return NextResponse.json({ success: true, results, syncLogId: syncLog.id });
    } catch (error) {
      // Update sync log with error
      await prisma.wooCommerceSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        },
      });
      throw error;
    }
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}

async function syncProduct(
  product: WCProduct,
  syncImages: boolean,
  storageProvider: "local" | "r2" | "auto",
  convertPrices: boolean,
  exchangeRate: number,
  results: {
    categories: { synced: number; failed: number };
    products: { synced: number; failed: number; skipped: number };
    images: { uploaded: number; failed: number };
    variations: { synced: number; failed: number };
  },
  site?: { url: string; consumerKey: string; consumerSecret: string }
) {
  try {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
    });

    if (existing) {
      results.products.skipped++;
      return;
    }

    // Download images
    const uploadedImages: Array<{
      src: string;
      alt: string;
      position: number;
    }> = [];

    if (syncImages && product.images.length > 0) {
      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        const filename = `${product.slug}-${i}.jpg`;
        const uploadedUrl = await downloadAndUploadImage(img.src, filename, storageProvider);

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

    // Parse prices and apply currency conversion if enabled
    let price = parseFloat(product.price) || 0;
    let regularPrice = parseFloat(product.regular_price) || price;
    let salePrice = product.sale_price
      ? parseFloat(product.sale_price)
      : null;
    
    // Apply currency conversion
    if (convertPrices && exchangeRate > 0) {
      price = Math.round(price * exchangeRate);
      regularPrice = Math.round(regularPrice * exchangeRate);
      if (salePrice !== null) {
        salePrice = Math.round(salePrice * exchangeRate);
      }
    }

    // Determine product type
    const productType = product.type || "simple";

    // Create product
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
        productType: productType,
      },
    });

    // Add images
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

    // Add product attributes
    if (product.attributes && product.attributes.length > 0) {
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
    }

    // Sync variations for variable products
    if (productType === "variable" && product.variations && product.variations.length > 0 && site) {
      await syncVariations(
        newProduct.id,
        product.id,
        site,
        syncImages,
        storageProvider,
        convertPrices,
        exchangeRate,
        results
      );
    }

    // Link categories
    for (const cat of product.categories) {
      try {
        const category = await prisma.category.findUnique({
          where: { slug: cat.slug },
        });
        if (category) {
          await prisma.productCategory
            .create({
              data: {
                productId: newProduct.id,
                categoryId: category.id,
              },
            })
            .catch(() => {});
        }
      } catch {
        // Ignore
      }
    }

    results.products.synced++;
  } catch (error) {
    console.error(`Failed to sync product ${product.slug}:`, error);
    results.products.failed++;
  }
}

// Sync variations for variable products
async function syncVariations(
  productId: string,
  wcProductId: number,
  site: { url: string; consumerKey: string; consumerSecret: string },
  syncImages: boolean,
  storageProvider: "local" | "r2" | "auto",
  convertPrices: boolean,
  exchangeRate: number,
  results: {
    categories: { synced: number; failed: number };
    products: { synced: number; failed: number; skipped: number };
    images: { uploaded: number; failed: number };
    variations: { synced: number; failed: number };
  }
) {
  try {
    // Fetch all variations for this product
    const variations = await fetchWC<WCVariation[]>(
      site,
      `products/${wcProductId}/variations`,
      { per_page: "100" }
    );

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      try {
        // Download variation image
        let variationImage: string | null = null;
        if (syncImages && variation.image?.src) {
          const filename = `variation-${wcProductId}-${variation.id}.jpg`;
          variationImage = await downloadAndUploadImage(
            variation.image.src,
            filename,
            storageProvider
          );
          if (variationImage) {
            results.images.uploaded++;
          }
        }

        // Parse prices
        let price = parseFloat(variation.price) || 0;
        let regularPrice = parseFloat(variation.regular_price) || price;
        let salePrice = variation.sale_price ? parseFloat(variation.sale_price) : null;

        // Apply currency conversion
        if (convertPrices && exchangeRate > 0) {
          price = Math.round(price * exchangeRate);
          regularPrice = Math.round(regularPrice * exchangeRate);
          if (salePrice !== null) {
            salePrice = Math.round(salePrice * exchangeRate);
          }
        }

        // Create variation
        await prisma.productVariation.create({
          data: {
            productId: productId,
            wcVariationId: variation.id,
            sku: variation.sku || null,
            price: price,
            regularPrice: regularPrice > price ? regularPrice : null,
            salePrice: salePrice,
            onSale: variation.on_sale,
            stockQuantity: variation.stock_quantity ?? null,
            stockStatus: variation.stock_status || "instock",
            manageStock: variation.manage_stock,
            weight: variation.weight || null,
            length: variation.dimensions?.length || null,
            width: variation.dimensions?.width || null,
            height: variation.dimensions?.height || null,
            image: variationImage,
            attributes: JSON.stringify(variation.attributes),
            position: i,
          },
        });

        results.variations.synced++;
      } catch (error) {
        console.error(`Failed to sync variation ${variation.id}:`, error);
        results.variations.failed++;
      }
    }
  } catch (error) {
    console.error(`Failed to fetch variations for product ${wcProductId}:`, error);
  }
}
