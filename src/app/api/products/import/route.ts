import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import * as XLSX from "xlsx";

// POST /api/products/import - Import products from file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const source = formData.get("source") as string || "file";
    const googleSheetUrl = formData.get("googleSheetUrl") as string;

    let products: any[] = [];

    if (source === "googlesheet" && googleSheetUrl) {
      // Parse Google Sheet URL to get CSV export URL
      const sheetId = extractGoogleSheetId(googleSheetUrl);
      if (!sheetId) {
        return NextResponse.json({ error: "Invalid Google Sheet URL" }, { status: 400 });
      }
      
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl);
      const csvText = await response.text();
      products = parseCSV(csvText);
    } else if (file) {
      const buffer = await file.arrayBuffer();
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".json")) {
        const text = new TextDecoder().decode(buffer);
        const jsonData = JSON.parse(text);
        products = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        products = XLSX.utils.sheet_to_json(worksheet);
      } else if (fileName.endsWith(".csv")) {
        const text = new TextDecoder().decode(buffer);
        products = parseCSV(text);
      } else {
        return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Process and create products
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const productData of products) {
      try {
        const mappedProduct = mapProductData(productData, source);
        
        // Extract images for separate handling
        const { images, ...productFields } = mappedProduct;
        
        // Check if product exists by SKU
        if (productFields.sku) {
          const existing = await prisma.product.findFirst({
            where: { sku: productFields.sku },
          });

          if (existing) {
            // Update existing product
            await prisma.product.update({
              where: { id: existing.id },
              data: productFields,
            });
            
            // Update images if provided
            if (images && images.length > 0) {
              // Delete existing images
              await prisma.productImage.deleteMany({
                where: { productId: existing.id },
              });
              // Create new images
              await prisma.productImage.createMany({
                data: images.map((img: any, idx: number) => ({
                  productId: existing.id,
                  src: img.src,
                  alt: img.alt || "",
                  position: idx,
                })),
              });
            }
            results.success++;
            continue;
          }
        }

        // Create new product
        const newProduct = await prisma.product.create({
          data: {
            ...productFields,
            slug: productFields.slug || generateSlugWithTimestamp(productFields.name),
          },
        });
        
        // Create images if provided
        if (images && images.length > 0) {
          await prisma.productImage.createMany({
            data: images.map((img: any, idx: number) => ({
              productId: newProduct.id,
              src: img.src,
              alt: img.alt || "",
              position: idx,
            })),
          });
        }
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${productData.name || "Unknown"}: ${error.message}`);
      }
    }

    return NextResponse.json({
      message: `Import completed: ${results.success} success, ${results.failed} failed`,
      ...results,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function extractGoogleSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function parseCSV(text: string): any[] {
  const lines = text.split("\n").filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
    const product: any = {};
    headers.forEach((header, index) => {
      product[header] = values[index] || "";
    });
    products.push(product);
  }

  return products;
}

function mapProductData(data: any, source: string): any {
  // Map from different sources (Shopee, Lazada, standard)
  if (source === "shopee") {
    return mapShopeeProduct(data);
  } else if (source === "lazada") {
    return mapLazadaProduct(data);
  }

  // Standard mapping
  return {
    name: data.name || data.productName || data["상품명"] || "",
    slug: data.slug || "",
    description: data.description || data["상품설명"] || "",
    shortDescription: data.shortDescription || data["짧은설명"] || "",
    sku: data.sku || data.SKU || data["SKU"] || "",
    price: parseFloat(data.price || data["가격"] || 0),
    regularPrice: parseFloat(data.regularPrice || data["정가"] || data.price || 0),
    salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
    stockQuantity: parseInt(data.stockQuantity || data.stock || data["재고"] || 0),
    stockStatus: data.stockStatus || "instock",
    status: data.status || "publish",
    featured: data.featured === true || data.featured === "true" || data.featured === "1",
    images: parseImages(data.images || data.image || data["이미지"]),
  };
}

function mapShopeeProduct(data: any): any {
  return {
    name: data["Product Name"] || data.name || "",
    slug: "",
    description: data["Product Description"] || data.description || "",
    shortDescription: "",
    sku: data["SKU"] || data["Parent SKU"] || "",
    price: parseFloat(data["Price"] || data["Current Price"] || 0),
    regularPrice: parseFloat(data["Original Price"] || data["Price"] || 0),
    salePrice: data["Discount Price"] ? parseFloat(data["Discount Price"]) : null,
    stockQuantity: parseInt(data["Stock"] || data["Quantity"] || 0),
    stockStatus: "instock",
    status: "publish",
    featured: false,
    images: parseImages(data["Image"] || data["Main Image"]),
  };
}

function mapLazadaProduct(data: any): any {
  return {
    name: data["Name"] || data["Product Name"] || "",
    slug: "",
    description: data["Long Description"] || data["Description"] || "",
    shortDescription: data["Short Description"] || "",
    sku: data["SellerSku"] || data["SKU"] || "",
    price: parseFloat(data["Price"] || data["SpecialPrice"] || 0),
    regularPrice: parseFloat(data["Price"] || 0),
    salePrice: data["SpecialPrice"] ? parseFloat(data["SpecialPrice"]) : null,
    stockQuantity: parseInt(data["Quantity"] || data["Stock"] || 0),
    stockStatus: "instock",
    status: "publish",
    featured: false,
    images: parseImages(data["Images"] || data["MainImage"]),
  };
}

function parseImages(images: any): any {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map((img, i) => ({
      src: typeof img === "string" ? img : img.src || img.url,
      alt: typeof img === "string" ? "" : img.alt || "",
    }));
  }
  if (typeof images === "string") {
    return images.split(";").filter(Boolean).map(src => ({ src: src.trim(), alt: "" }));
  }
  return [];
}

function removeVietnameseTones(str: string): string {
  let normalized = str.normalize('NFD');
  normalized = normalized.replace(/[\u0300-\u036f]/g, '');
  normalized = normalized
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/ư/g, 'u').replace(/Ư/g, 'U')
    .replace(/ơ/g, 'o').replace(/Ơ/g, 'O')
    .replace(/ă/g, 'a').replace(/Ă/g, 'A')
    .replace(/â/g, 'a').replace(/Â/g, 'A')
    .replace(/ê/g, 'e').replace(/Ê/g, 'E')
    .replace(/ô/g, 'o').replace(/Ô/g, 'O');
  return normalized;
}

function generateSlugWithTimestamp(name: string): string {
  return removeVietnameseTones(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") + "-" + Date.now();
}
