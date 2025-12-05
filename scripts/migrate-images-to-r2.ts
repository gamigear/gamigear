// Script to migrate localhost images to R2
// Run: npx ts-node scripts/migrate-images-to-r2.ts

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

const prisma = new PrismaClient();

const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.R2_BUCKET_NAME!,
  publicUrl: process.env.R2_PUBLIC_URL!,
};

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey,
  },
});

const LOCALHOST_PATTERNS = [
  "http://localhost:8000",
  "http://localhost:8080", 
  "http://127.0.0.1:8000",
  "http://127.0.0.1:8080",
];

// Cache to avoid re-uploading same images
const uploadedUrls = new Map<string, string>();

function isLocalhostUrl(url: string): boolean {
  return LOCALHOST_PATTERNS.some(pattern => url.includes(pattern));
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  return types[ext] || "application/octet-stream";
}

async function downloadAndUpload(originalUrl: string): Promise<string | null> {
  // Check cache first
  if (uploadedUrls.has(originalUrl)) {
    return uploadedUrls.get(originalUrl)!;
  }

  try {
    // Download image
    console.log(`  📥 Downloading: ${originalUrl.substring(0, 60)}...`);
    const response = await fetch(originalUrl);
    
    if (!response.ok) {
      console.log(`  ⚠️ Failed to download (${response.status}): ${originalUrl}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Extract filename from URL
    const urlPath = new URL(originalUrl).pathname;
    const filename = path.basename(urlPath);
    const key = `products/${Date.now()}-${filename}`;
    
    // Upload to R2
    console.log(`  📤 Uploading to R2: ${key}`);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: getContentType(filename),
      })
    );

    const newUrl = `${r2Config.publicUrl}/${key}`;
    uploadedUrls.set(originalUrl, newUrl);
    console.log(`  ✅ Uploaded: ${newUrl}`);
    
    return newUrl;
  } catch (error) {
    console.error(`  ❌ Error processing ${originalUrl}:`, error);
    return null;
  }
}

async function migrateProductImages() {
  console.log("\n📸 Migrating ProductImage URLs...");
  const images = await prisma.productImage.findMany();
  let count = 0;
  let failed = 0;

  for (const img of images) {
    if (isLocalhostUrl(img.src)) {
      const newUrl = await downloadAndUpload(img.src);
      if (newUrl) {
        await prisma.productImage.update({
          where: { id: img.id },
          data: { src: newUrl },
        });
        count++;
      } else {
        failed++;
      }
    }
  }
  
  console.log(`  ✅ Migrated: ${count}, Failed: ${failed}\n`);
  return { migrated: count, failed };
}

async function migrateVariationImages() {
  console.log("🎨 Migrating ProductVariation images...");
  const variations = await prisma.productVariation.findMany({
    where: { image: { not: null } },
  });
  let count = 0;
  let failed = 0;

  for (const v of variations) {
    if (v.image && isLocalhostUrl(v.image)) {
      const newUrl = await downloadAndUpload(v.image);
      if (newUrl) {
        await prisma.productVariation.update({
          where: { id: v.id },
          data: { image: newUrl },
        });
        count++;
      } else {
        failed++;
      }
    }
  }
  
  console.log(`  ✅ Migrated: ${count}, Failed: ${failed}\n`);
  return { migrated: count, failed };
}

async function migrateCategoryImages() {
  console.log("📁 Migrating Category images...");
  const categories = await prisma.category.findMany({
    where: { image: { not: null } },
  });
  let count = 0;
  let failed = 0;

  for (const cat of categories) {
    if (cat.image && isLocalhostUrl(cat.image)) {
      const newUrl = await downloadAndUpload(cat.image);
      if (newUrl) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { image: newUrl },
        });
        count++;
      } else {
        failed++;
      }
    }
  }
  
  console.log(`  ✅ Migrated: ${count}, Failed: ${failed}\n`);
  return { migrated: count, failed };
}

async function migrateBannerImages() {
  console.log("🖼️ Migrating Banner images...");
  const banners = await prisma.banner.findMany();
  let count = 0;
  let failed = 0;

  for (const banner of banners) {
    const updates: any = {};
    let hasUpdate = false;

    if (banner.image && isLocalhostUrl(banner.image)) {
      const newUrl = await downloadAndUpload(banner.image);
      if (newUrl) {
        updates.image = newUrl;
        hasUpdate = true;
      } else {
        failed++;
      }
    }
    if (banner.mobileImage && isLocalhostUrl(banner.mobileImage)) {
      const newUrl = await downloadAndUpload(banner.mobileImage);
      if (newUrl) {
        updates.mobileImage = newUrl;
        hasUpdate = true;
      } else {
        failed++;
      }
    }
    if (banner.tabletImage && isLocalhostUrl(banner.tabletImage)) {
      const newUrl = await downloadAndUpload(banner.tabletImage);
      if (newUrl) {
        updates.tabletImage = newUrl;
        hasUpdate = true;
      } else {
        failed++;
      }
    }

    if (hasUpdate) {
      await prisma.banner.update({
        where: { id: banner.id },
        data: updates,
      });
      count++;
    }
  }
  
  console.log(`  ✅ Migrated: ${count}, Failed: ${failed}\n`);
  return { migrated: count, failed };
}

async function main() {
  console.log("🚀 Starting image migration to R2...\n");
  console.log("R2 Config:", {
    bucket: r2Config.bucketName,
    publicUrl: r2Config.publicUrl,
  });

  const results = {
    productImages: await migrateProductImages(),
    variations: await migrateVariationImages(),
    categories: await migrateCategoryImages(),
    banners: await migrateBannerImages(),
  };

  console.log("\n🎉 Migration Complete!");
  console.log("Summary:");
  console.log(`  - Product Images: ${results.productImages.migrated} migrated, ${results.productImages.failed} failed`);
  console.log(`  - Variations: ${results.variations.migrated} migrated, ${results.variations.failed} failed`);
  console.log(`  - Categories: ${results.categories.migrated} migrated, ${results.categories.failed} failed`);
  console.log(`  - Banners: ${results.banners.migrated} migrated, ${results.banners.failed} failed`);
  console.log(`\nTotal unique images uploaded: ${uploadedUrls.size}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
