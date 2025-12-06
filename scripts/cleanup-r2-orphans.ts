// Script to cleanup orphan images in R2 that are not referenced in database
// Run: npx ts-node scripts/cleanup-r2-orphans.ts
// Add --dry-run to preview without deleting

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

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

const DRY_RUN = process.argv.includes("--dry-run");

async function getAllR2Keys(): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  console.log("📂 Listing all objects in R2 bucket...");

  do {
    const command = new ListObjectsV2Command({
      Bucket: r2Config.bucketName,
      Prefix: "products/",
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);
    
    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key) {
          keys.push(obj.Key);
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  console.log(`  Found ${keys.length} objects in R2\n`);
  return keys;
}

async function getUsedUrls(): Promise<Set<string>> {
  const usedUrls = new Set<string>();

  console.log("🔍 Fetching URLs from database...");

  // ProductImage URLs
  const productImages = await prisma.productImage.findMany({ select: { src: true } });
  productImages.forEach(img => {
    if (img.src.includes(r2Config.publicUrl)) {
      usedUrls.add(img.src);
    }
  });
  console.log(`  ProductImage: ${productImages.length} records`);

  // ProductVariation images
  const variations = await prisma.productVariation.findMany({
    where: { image: { not: null } },
    select: { image: true },
  });
  variations.forEach(v => {
    if (v.image?.includes(r2Config.publicUrl)) {
      usedUrls.add(v.image);
    }
  });
  console.log(`  ProductVariation: ${variations.length} records`);

  // Category images
  const categories = await prisma.category.findMany({
    where: { image: { not: null } },
    select: { image: true },
  });
  categories.forEach(c => {
    if (c.image?.includes(r2Config.publicUrl)) {
      usedUrls.add(c.image);
    }
  });
  console.log(`  Category: ${categories.length} records`);

  // Banner images
  const banners = await prisma.banner.findMany({
    select: { image: true, mobileImage: true, tabletImage: true },
  });
  banners.forEach(b => {
    if (b.image?.includes(r2Config.publicUrl)) usedUrls.add(b.image);
    if (b.mobileImage?.includes(r2Config.publicUrl)) usedUrls.add(b.mobileImage);
    if (b.tabletImage?.includes(r2Config.publicUrl)) usedUrls.add(b.tabletImage);
  });
  console.log(`  Banner: ${banners.length} records`);

  // Media URLs
  const media = await prisma.media.findMany({
    select: { url: true, thumbnailUrl: true },
  });
  media.forEach(m => {
    if (m.url?.includes(r2Config.publicUrl)) usedUrls.add(m.url);
    if (m.thumbnailUrl?.includes(r2Config.publicUrl)) usedUrls.add(m.thumbnailUrl);
  });
  console.log(`  Media: ${media.length} records`);

  console.log(`\n  Total unique R2 URLs in database: ${usedUrls.size}\n`);
  return usedUrls;
}

async function deleteObjects(keys: string[]): Promise<void> {
  // Delete in batches of 1000 (R2 limit)
  const batchSize = 1000;
  
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    
    const command = new DeleteObjectsCommand({
      Bucket: r2Config.bucketName,
      Delete: {
        Objects: batch.map(key => ({ Key: key })),
      },
    });

    await s3Client.send(command);
    console.log(`  Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} objects`);
  }
}

async function main() {
  console.log("🧹 R2 Orphan Cleanup Script\n");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no deletions)" : "LIVE (will delete files)"}\n`);

  // Get all R2 keys
  const allKeys = await getAllR2Keys();

  // Get all URLs used in database
  const usedUrls = await getUsedUrls();

  // Convert URLs to keys for comparison
  const usedKeys = new Set<string>();
  usedUrls.forEach(url => {
    const key = url.replace(`${r2Config.publicUrl}/`, "");
    usedKeys.add(key);
  });

  // Find orphan keys
  const orphanKeys = allKeys.filter(key => !usedKeys.has(key));

  console.log(`📊 Summary:`);
  console.log(`  Total R2 objects: ${allKeys.length}`);
  console.log(`  Used in database: ${usedKeys.size}`);
  console.log(`  Orphan objects: ${orphanKeys.length}`);

  if (orphanKeys.length === 0) {
    console.log("\n✅ No orphan files found!");
    return;
  }

  // Calculate size (estimate)
  console.log(`\n🗑️ Orphan files to delete:`);
  orphanKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
  if (orphanKeys.length > 10) {
    console.log(`  ... and ${orphanKeys.length - 10} more`);
  }

  if (DRY_RUN) {
    console.log("\n⚠️ DRY RUN - No files deleted. Run without --dry-run to delete.");
  } else {
    console.log("\n🗑️ Deleting orphan files...");
    await deleteObjects(orphanKeys);
    console.log(`\n✅ Deleted ${orphanKeys.length} orphan files!`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
