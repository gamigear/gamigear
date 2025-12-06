import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample reviewer names by locale
const reviewerNamesByLocale: Record<string, string[]> = {
  ko: [
    "김민수", "이영희", "박지훈", "최수진", "정현우",
    "강미영", "조성민", "윤서연", "임재현", "한지원",
    "송민지", "오준혁", "신예진", "황동현", "전소희",
  ],
  vi: [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Minh Châu", "Phạm Đức Dũng", "Hoàng Thị Em",
    "Vũ Quang Hải", "Đặng Thị Hương", "Bùi Văn Khoa", "Ngô Thị Lan", "Đỗ Minh Long",
    "Trịnh Thị Mai", "Lý Văn Nam", "Phan Thị Oanh", "Hồ Quốc Phong", "Dương Thị Quỳnh",
  ],
  en: [
    "John Smith", "Emily Johnson", "Michael Brown", "Sarah Davis", "David Wilson",
    "Jessica Taylor", "Chris Anderson", "Amanda Thomas", "Matthew Jackson", "Ashley White",
    "Daniel Harris", "Jennifer Martin", "James Thompson", "Elizabeth Garcia", "Robert Martinez",
  ],
};

const reviewTemplatesByLocale: Record<string, Record<number, string[]>> = {
  ko: {
    5: [
      "정말 좋은 상품이에요! 배송도 빠르고 품질도 만족스럽습니다.",
      "아이가 너무 좋아해요. 재구매 의사 있습니다!",
      "기대 이상이에요! 다음에도 이용할게요.",
      "최고의 상품입니다! 강력 추천해요~",
      "품질이 정말 좋아요. 가격 대비 최고입니다.",
    ],
    4: [
      "가격 대비 품질이 훌륭합니다. 추천해요~",
      "배송이 빨라서 좋았어요. 상품도 만족합니다.",
      "포장이 꼼꼼하게 되어 왔어요. 감사합니다!",
      "사진과 동일한 상품이 왔어요. 만족합니다.",
    ],
    3: ["보통이에요. 가격 대비 괜찮은 것 같아요.", "나쁘지 않아요."],
  },
  vi: {
    5: [
      "Sản phẩm rất tốt! Giao hàng nhanh, chất lượng tuyệt vời.",
      "Con tôi rất thích. Chắc chắn sẽ mua lại!",
      "Vượt quá mong đợi! Sẽ tiếp tục ủng hộ shop.",
      "Sản phẩm tuyệt vời! Recommend cho mọi người~",
      "Chất lượng rất tốt, giá cả hợp lý. 10 điểm!",
    ],
    4: [
      "Chất lượng tốt so với giá tiền. Recommend!",
      "Giao hàng nhanh, sản phẩm đẹp như hình.",
      "Đóng gói cẩn thận, cảm ơn shop!",
      "Sản phẩm giống hình, rất hài lòng.",
    ],
    3: ["Bình thường, tạm được với giá này.", "Không tệ."],
  },
  en: {
    5: [
      "Excellent product! Fast shipping and great quality.",
      "My kids love it! Will definitely buy again.",
      "Exceeded my expectations! Highly recommend.",
      "Best product ever! 5 stars all the way~",
      "Amazing quality for the price. Worth every penny!",
    ],
    4: [
      "Great value for money. Recommended!",
      "Fast shipping, product looks exactly like the photos.",
      "Well packaged, thank you!",
      "Product matches the description. Happy with purchase.",
    ],
    3: ["Average product, okay for the price.", "It's okay."],
  },
};

const emailDomainsByLocale: Record<string, string[]> = {
  ko: ["gmail.com", "naver.com", "daum.net", "kakao.com"],
  vi: ["gmail.com", "yahoo.com", "outlook.com"],
  en: ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomRating(): number {
  const weights = [1, 2, 3, 5, 8];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i + 1;
  }
  return 5;
}

async function main() {
  console.log("🗑️  Xóa tất cả reviews cũ...");
  const deleted = await prisma.review.deleteMany({});
  console.log(`   Đã xóa ${deleted.count} reviews`);

  // Reset product ratings
  console.log("🔄 Reset product ratings...");
  await prisma.product.updateMany({
    data: { averageRating: 0, ratingCount: 0 },
  });

  // Get all published products
  const products = await prisma.product.findMany({
    where: { status: "publish" },
    select: { id: true, name: true },
  });
  console.log(`📦 Tìm thấy ${products.length} sản phẩm`);

  const locale = "vi"; // Thay đổi thành "ko" hoặc "en" nếu cần
  const reviewsPerProduct = 5;
  const reviewerNames = reviewerNamesByLocale[locale];
  const reviewTemplates = reviewTemplatesByLocale[locale];
  const emailDomains = emailDomainsByLocale[locale];

  console.log(`\n🌐 Tạo reviews với ngôn ngữ: ${locale.toUpperCase()}`);
  console.log(`📝 Số reviews mỗi sản phẩm: ${reviewsPerProduct}`);

  const reviewsToCreate: any[] = [];
  const usedNames = new Set<string>();

  for (const product of products) {
    for (let i = 0; i < reviewsPerProduct; i++) {
      const rating = Math.max(3, generateRandomRating()); // Min 3 stars
      const templates = reviewTemplates[rating] || reviewTemplates[5];
      const reviewText = getRandomElement(templates);

      let reviewerName = getRandomElement(reviewerNames);
      let attempts = 0;
      while (usedNames.has(`${product.id}-${reviewerName}`) && attempts < 10) {
        reviewerName = getRandomElement(reviewerNames);
        attempts++;
      }
      usedNames.add(`${product.id}-${reviewerName}`);

      const emailPrefix = reviewerName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s/g, "");
      const emailSuffix = Math.floor(Math.random() * 10000);
      const reviewerEmail = `${emailPrefix}${emailSuffix}@${getRandomElement(emailDomains)}`;

      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      reviewsToCreate.push({
        productId: product.id,
        rating,
        review: reviewText,
        reviewerName,
        reviewerEmail,
        status: "approved",
        verified: Math.random() > 0.3,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  // Create reviews in batches
  console.log(`\n⏳ Tạo ${reviewsToCreate.length} reviews...`);
  const batchSize = 100;
  let created = 0;

  for (let i = 0; i < reviewsToCreate.length; i += batchSize) {
    const batch = reviewsToCreate.slice(i, i + batchSize);
    await prisma.review.createMany({ data: batch });
    created += batch.length;
    process.stdout.write(`\r   Đã tạo: ${created}/${reviewsToCreate.length}`);
  }
  console.log("\n");

  // Update product ratings
  console.log("📊 Cập nhật ratings cho sản phẩm...");
  for (let i = 0; i < products.length; i += 10) {
    const batch = products.slice(i, i + 10);
    await Promise.all(
      batch.map(async (product) => {
        const stats = await prisma.review.aggregate({
          where: { productId: product.id, status: "approved" },
          _avg: { rating: true },
          _count: { rating: true },
        });
        if (stats._count.rating > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              averageRating: stats._avg.rating || 0,
              ratingCount: stats._count.rating,
            },
          });
        }
      })
    );
    process.stdout.write(`\r   Đã cập nhật: ${Math.min(i + 10, products.length)}/${products.length}`);
  }

  console.log("\n\n✅ Hoàn thành!");
  console.log(`   - Tổng reviews đã tạo: ${created}`);
  console.log(`   - Ngôn ngữ: ${locale.toUpperCase()}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
