// Script to fix localhost image URLs in database
// Run: npx ts-node scripts/fix-image-urls.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// WooCommerce source URL (localhost) -> Production URL
const OLD_URL_PATTERNS = [
  "http://localhost:8000",
  "http://localhost:8080",
  "http://127.0.0.1:8000",
  "http://127.0.0.1:8080",
];

// Replace with your actual WooCommerce production URL or R2 URL
const NEW_BASE_URL = process.env.WOOCOMMERCE_URL || "https://your-woocommerce-site.com";

async function fixImageUrls() {
  console.log("🔧 Starting image URL fix...\n");

  // Fix ProductImage URLs
  console.log("📸 Fixing ProductImage URLs...");
  const productImages = await prisma.productImage.findMany();
  let productImageCount = 0;

  for (const img of productImages) {
    for (const oldPattern of OLD_URL_PATTERNS) {
      if (img.src.includes(oldPattern)) {
        const newSrc = img.src.replace(oldPattern, NEW_BASE_URL);
        await prisma.productImage.update({
          where: { id: img.id },
          data: { src: newSrc },
        });
        productImageCount++;
        console.log(`  Updated: ${img.src.substring(0, 50)}...`);
        break;
      }
    }
  }
  console.log(`  ✅ Fixed ${productImageCount} product images\n`);

  // Fix ProductVariation images
  console.log("🎨 Fixing ProductVariation images...");
  const variations = await prisma.productVariation.findMany({
    where: { image: { not: null } },
  });
  let variationCount = 0;

  for (const v of variations) {
    if (!v.image) continue;
    for (const oldPattern of OLD_URL_PATTERNS) {
      if (v.image.includes(oldPattern)) {
        const newImage = v.image.replace(oldPattern, NEW_BASE_URL);
        await prisma.productVariation.update({
          where: { id: v.id },
          data: { image: newImage },
        });
        variationCount++;
        break;
      }
    }
  }
  console.log(`  ✅ Fixed ${variationCount} variation images\n`);

  // Fix Category images
  console.log("📁 Fixing Category images...");
  const categories = await prisma.category.findMany({
    where: { image: { not: null } },
  });
  let categoryCount = 0;

  for (const cat of categories) {
    if (!cat.image) continue;
    for (const oldPattern of OLD_URL_PATTERNS) {
      if (cat.image.includes(oldPattern)) {
        const newImage = cat.image.replace(oldPattern, NEW_BASE_URL);
        await prisma.category.update({
          where: { id: cat.id },
          data: { image: newImage },
        });
        categoryCount++;
        break;
      }
    }
  }
  console.log(`  ✅ Fixed ${categoryCount} category images\n`);

  // Fix Banner images
  console.log("🖼️ Fixing Banner images...");
  const banners = await prisma.banner.findMany();
  let bannerCount = 0;

  for (const banner of banners) {
    let updated = false;
    const updates: any = {};

    for (const oldPattern of OLD_URL_PATTERNS) {
      if (banner.image?.includes(oldPattern)) {
        updates.image = banner.image.replace(oldPattern, NEW_BASE_URL);
        updated = true;
      }
      if (banner.mobileImage?.includes(oldPattern)) {
        updates.mobileImage = banner.mobileImage.replace(oldPattern, NEW_BASE_URL);
        updated = true;
      }
      if (banner.tabletImage?.includes(oldPattern)) {
        updates.tabletImage = banner.tabletImage.replace(oldPattern, NEW_BASE_URL);
        updated = true;
      }
    }

    if (updated) {
      await prisma.banner.update({
        where: { id: banner.id },
        data: updates,
      });
      bannerCount++;
    }
  }
  console.log(`  ✅ Fixed ${bannerCount} banners\n`);

  // Fix Media URLs
  console.log("📷 Fixing Media URLs...");
  const media = await prisma.media.findMany();
  let mediaCount = 0;

  for (const m of media) {
    let updated = false;
    const updates: any = {};

    for (const oldPattern of OLD_URL_PATTERNS) {
      if (m.url?.includes(oldPattern)) {
        updates.url = m.url.replace(oldPattern, NEW_BASE_URL);
        updated = true;
      }
      if (m.thumbnailUrl?.includes(oldPattern)) {
        updates.thumbnailUrl = m.thumbnailUrl.replace(oldPattern, NEW_BASE_URL);
        updated = true;
      }
    }

    if (updated) {
      await prisma.media.update({
        where: { id: m.id },
        data: updates,
      });
      mediaCount++;
    }
  }
  console.log(`  ✅ Fixed ${mediaCount} media items\n`);

  console.log("🎉 Done! Summary:");
  console.log(`   - Product Images: ${productImageCount}`);
  console.log(`   - Variations: ${variationCount}`);
  console.log(`   - Categories: ${categoryCount}`);
  console.log(`   - Banners: ${bannerCount}`);
  console.log(`   - Media: ${mediaCount}`);
}

fixImageUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
