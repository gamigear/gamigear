/**
 * Script to generate blur placeholders (LQIP) for existing product images
 * Run: npx tsx scripts/generate-blur-placeholders.ts
 */

import { PrismaClient } from '@prisma/client';
import { generateBlurDataUrl } from '../src/lib/blur-image';

const prisma = new PrismaClient();

async function main() {
  console.log('🖼️  Generating blur placeholders for product images...\n');

  // Get all images without blur data
  const images = await prisma.productImage.findMany({
    where: {
      blurDataUrl: null,
      src: {
        not: '',
      },
    },
    select: {
      id: true,
      src: true,
    },
  });

  console.log(`Found ${images.length} images without blur placeholders\n`);

  if (images.length === 0) {
    console.log('✅ All images already have blur placeholders!');
    return;
  }

  let processed = 0;
  let success = 0;
  let failed = 0;

  // Process in batches of 10
  const batchSize = 10;
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (image) => {
        try {
          const blurDataUrl = await generateBlurDataUrl(image.src);
          
          if (blurDataUrl) {
            await prisma.productImage.update({
              where: { id: image.id },
              data: { blurDataUrl },
            });
            success++;
            console.log(`✅ ${image.id}: Generated blur`);
          } else {
            failed++;
            console.log(`⚠️  ${image.id}: Could not generate blur`);
          }
        } catch (error) {
          failed++;
          console.error(`❌ ${image.id}: Error -`, error);
        }
        processed++;
      })
    );

    // Progress update
    console.log(`\nProgress: ${processed}/${images.length} (${Math.round(processed/images.length*100)}%)\n`);
  }

  console.log('\n📊 Summary:');
  console.log(`   Total: ${images.length}`);
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
