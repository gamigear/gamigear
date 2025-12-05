import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function applyBulkSale() {
  console.log("🏷️ Applying 30% discount to all products...\n");

  const discountValue = 30; // 30%

  // Helper function to calculate sale price
  const calculateSalePrice = (originalPrice: number): number => {
    return Math.round((originalPrice * (1 - discountValue / 100)) * 100) / 100;
  };

  // Get products NOT yet on sale
  const products = await prisma.product.findMany({
    where: { 
      status: "publish",
      onSale: false, // Only products not yet on sale
    },
    select: {
      id: true,
      name: true,
      price: true,
      regularPrice: true,
      productType: true,
      variations: {
        where: { isActive: true, onSale: false },
        select: {
          id: true,
          price: true,
          regularPrice: true,
        },
      },
    },
  });

  console.log(`Found ${products.length} products not yet on sale\n`);

  let updated = 0;
  let variationsUpdated = 0;

  for (const product of products) {
    // Handle variable products
    if (product.productType === "variable" && product.variations.length > 0) {
      let lowestSalePrice = Infinity;
      let lowestOriginalPrice = Infinity;

      for (const variation of product.variations) {
        const varOriginalPrice = variation.regularPrice || variation.price;
        if (varOriginalPrice <= 0) continue;

        const varSalePrice = calculateSalePrice(varOriginalPrice);

        if (varSalePrice > 0 && varSalePrice < varOriginalPrice) {
          await prisma.productVariation.update({
            where: { id: variation.id },
            data: {
              salePrice: varSalePrice,
              regularPrice: varOriginalPrice,
              price: varSalePrice,
              onSale: true,
            },
          });
          variationsUpdated++;

          if (varSalePrice < lowestSalePrice) lowestSalePrice = varSalePrice;
          if (varOriginalPrice < lowestOriginalPrice) lowestOriginalPrice = varOriginalPrice;
        }
      }

      if (lowestSalePrice < Infinity) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            salePrice: lowestSalePrice,
            regularPrice: lowestOriginalPrice,
            price: lowestSalePrice,
            onSale: true,
          },
        });
        updated++;
      }
    } else {
      // Simple product
      const originalPrice = product.regularPrice || product.price;
      if (originalPrice <= 0) continue;
      
      const salePrice = calculateSalePrice(originalPrice);

      if (salePrice > 0 && salePrice < originalPrice) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            salePrice,
            regularPrice: originalPrice,
            price: salePrice,
            onSale: true,
          },
        });
        updated++;
      }
    }
  }

  console.log("\n========================================");
  console.log(`✅ Products updated: ${updated}`);
  console.log(`📦 Variations updated: ${variationsUpdated}`);
  console.log("========================================");

  // Final count
  const totalOnSale = await prisma.product.count({ where: { onSale: true } });
  const totalVarOnSale = await prisma.productVariation.count({ where: { onSale: true } });
  console.log(`\nTotal on sale: ${totalOnSale} products, ${totalVarOnSale} variations`);

  await prisma.$disconnect();
}

applyBulkSale().catch((e) => {
  console.error("Error:", e);
  prisma.$disconnect();
  process.exit(1);
});
