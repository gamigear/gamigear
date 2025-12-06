import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/api-auth";

// Sample reviewer names by locale
const reviewerNamesByLocale: Record<string, string[]> = {
  ko: [
    "김민수", "이영희", "박지훈", "최수진", "정현우",
    "강미영", "조성민", "윤서연", "임재현", "한지원",
    "송민지", "오준혁", "신예진", "황동현", "전소희",
    "권태영", "류지민", "배수현", "홍성준", "문지영",
  ],
  vi: [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Minh Châu", "Phạm Đức Dũng", "Hoàng Thị Em",
    "Vũ Quang Hải", "Đặng Thị Hương", "Bùi Văn Khoa", "Ngô Thị Lan", "Đỗ Minh Long",
    "Trịnh Thị Mai", "Lý Văn Nam", "Phan Thị Oanh", "Hồ Quốc Phong", "Dương Thị Quỳnh",
    "Võ Văn Sơn", "Đinh Thị Tâm", "Lương Văn Tuấn", "Mai Thị Uyên", "Cao Văn Vinh",
  ],
  en: [
    "John Smith", "Emily Johnson", "Michael Brown", "Sarah Davis", "David Wilson",
    "Jessica Taylor", "Chris Anderson", "Amanda Thomas", "Matthew Jackson", "Ashley White",
    "Daniel Harris", "Jennifer Martin", "James Thompson", "Elizabeth Garcia", "Robert Martinez",
    "Michelle Robinson", "William Clark", "Stephanie Lewis", "Joseph Lee", "Nicole Walker",
  ],
};

// Sample review templates by locale and rating
const reviewTemplatesByLocale: Record<string, Record<number, string[]>> = {
  ko: {
    5: [
      "정말 좋은 상품이에요! 배송도 빠르고 품질도 만족스럽습니다.",
      "아이가 너무 좋아해요. 재구매 의사 있습니다!",
      "기대 이상이에요! 다음에도 이용할게요.",
      "최고의 상품입니다! 강력 추천해요~",
      "품질이 정말 좋아요. 가격 대비 최고입니다.",
      "선물용으로 구매했는데 반응이 너무 좋았어요!",
      "완벽한 상품이에요. 두 번째 구매입니다.",
      "배송도 빠르고 포장도 꼼꼼해요. 만족합니다!",
    ],
    4: [
      "가격 대비 품질이 훌륭합니다. 추천해요~",
      "배송이 빨라서 좋았어요. 상품도 만족합니다.",
      "포장이 꼼꼼하게 되어 왔어요. 감사합니다!",
      "사진과 동일한 상품이 왔어요. 만족합니다.",
      "가성비 최고! 주변에 추천하고 있어요.",
      "전체적으로 만족스러워요. 다음에도 구매할게요.",
    ],
    3: [
      "보통이에요. 가격 대비 괜찮은 것 같아요.",
      "나쁘지 않아요. 기대한 만큼은 아니지만요.",
      "평범한 상품이에요. 그래도 쓸만해요.",
    ],
    2: ["기대보다 별로예요. 아쉽네요.", "품질이 생각보다 좋지 않아요."],
    1: ["실망스러워요.", "품질이 너무 안 좋아요."],
  },
  vi: {
    5: [
      "Sản phẩm rất tốt! Giao hàng nhanh, chất lượng tuyệt vời.",
      "Con tôi rất thích. Chắc chắn sẽ mua lại!",
      "Vượt quá mong đợi! Sẽ tiếp tục ủng hộ shop.",
      "Sản phẩm tuyệt vời! Recommend cho mọi người~",
      "Chất lượng rất tốt, giá cả hợp lý. 10 điểm!",
      "Mua làm quà tặng, người nhận rất thích!",
      "Sản phẩm hoàn hảo. Đây là lần mua thứ 2 rồi.",
      "Giao hàng nhanh, đóng gói cẩn thận. Rất hài lòng!",
    ],
    4: [
      "Chất lượng tốt so với giá tiền. Recommend!",
      "Giao hàng nhanh, sản phẩm đẹp như hình.",
      "Đóng gói cẩn thận, cảm ơn shop!",
      "Sản phẩm giống hình, rất hài lòng.",
      "Giá tốt, chất lượng ổn. Đã giới thiệu cho bạn bè.",
      "Nhìn chung rất hài lòng, sẽ mua lại.",
    ],
    3: [
      "Bình thường, tạm được với giá này.",
      "Không tệ, nhưng chưa như kỳ vọng.",
      "Sản phẩm bình thường, dùng được.",
    ],
    2: ["Hơi thất vọng, không như mong đợi.", "Chất lượng không tốt lắm."],
    1: ["Thất vọng.", "Chất lượng kém."],
  },
  en: {
    5: [
      "Excellent product! Fast shipping and great quality.",
      "My kids love it! Will definitely buy again.",
      "Exceeded my expectations! Highly recommend.",
      "Best product ever! 5 stars all the way~",
      "Amazing quality for the price. Worth every penny!",
      "Bought as a gift, they loved it!",
      "Perfect product. This is my second purchase.",
      "Fast delivery, well packaged. Very satisfied!",
    ],
    4: [
      "Great value for money. Recommended!",
      "Fast shipping, product looks exactly like the photos.",
      "Well packaged, thank you!",
      "Product matches the description. Happy with purchase.",
      "Good price, decent quality. Told my friends about it.",
      "Overall satisfied, will buy again.",
    ],
    3: [
      "Average product, okay for the price.",
      "Not bad, but not what I expected.",
      "It's okay, does the job.",
    ],
    2: ["A bit disappointed, not as expected.", "Quality could be better."],
    1: ["Disappointed.", "Poor quality."],
  },
};

// Email domains by locale
const emailDomainsByLocale: Record<string, string[]> = {
  ko: ["gmail.com", "naver.com", "daum.net", "kakao.com"],
  vi: ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
  en: ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"],
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomRating(minRating: number, maxRating: number): number {
  // Weighted towards higher ratings
  const weights = [1, 2, 3, 5, 8]; // 1-5 stars weights
  const validWeights = weights.slice(minRating - 1, maxRating);
  const totalWeight = validWeights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < validWeights.length; i++) {
    random -= validWeights[i];
    if (random <= 0) {
      return minRating + i;
    }
  }
  return maxRating;
}

// POST /api/reviews/bulk - Create bulk reviews
export async function POST(request: NextRequest) {
  console.log("=== BULK REVIEWS API CALLED ===");
  
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    console.log("Auth failed:", authResult.error);
    return authResult.error === "Admin access required"
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }

  try {
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    const {
      mode, // "product" | "category" | "all"
      productIds = [],
      categoryIds = [],
      count = 5,
      minRating = 4,
      maxRating = 5,
      status = "approved",
      includeImages = false,
      sampleImages = [],
      locale = "vi", // "vi" | "ko" | "en"
    } = body;

    // Get templates for selected locale
    const reviewerNames = reviewerNamesByLocale[locale] || reviewerNamesByLocale.vi;
    const reviewTemplates = reviewTemplatesByLocale[locale] || reviewTemplatesByLocale.vi;
    const emailDomains = emailDomainsByLocale[locale] || emailDomainsByLocale.vi;

    let targetProductIds: string[] = [];

    if (mode === "product" && productIds.length > 0) {
      targetProductIds = productIds;
    } else if (mode === "category" && categoryIds.length > 0) {
      // Get products from selected categories
      const products = await prisma.product.findMany({
        where: {
          status: "publish",
          categories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
        },
        select: { id: true },
      });
      targetProductIds = products.map((p) => p.id);
    } else if (mode === "all") {
      // Get all published products
      const products = await prisma.product.findMany({
        where: { status: "publish" },
        select: { id: true },
      });
      targetProductIds = products.map((p) => p.id);
    }

    if (targetProductIds.length === 0) {
      return NextResponse.json(
        { error: "No products found to create reviews for" },
        { status: 400 }
      );
    }

    const reviewsToCreate: any[] = [];
    const usedNames = new Set<string>();

    for (const productId of targetProductIds) {
      for (let i = 0; i < count; i++) {
        const rating = generateRandomRating(minRating, maxRating);
        const templates = reviewTemplates[rating] || reviewTemplates[4];
        const reviewText = getRandomElement(templates);
        
        // Get unique reviewer name
        let reviewerName = getRandomElement(reviewerNames);
        let attempts = 0;
        while (usedNames.has(`${productId}-${reviewerName}`) && attempts < 10) {
          reviewerName = getRandomElement(reviewerNames);
          attempts++;
        }
        usedNames.add(`${productId}-${reviewerName}`);

        // Generate random email based on locale
        const emailPrefix = reviewerName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .replace(/\s/g, "");
        const emailSuffix = Math.floor(Math.random() * 10000);
        const reviewerEmail = `${emailPrefix}${emailSuffix}@${getRandomElement(emailDomains)}`;

        // Random images if enabled
        let images: string[] | null = null;
        if (includeImages && sampleImages.length > 0 && Math.random() > 0.5) {
          const imageCount = Math.floor(Math.random() * 3) + 1;
          images = [];
          for (let j = 0; j < imageCount && j < sampleImages.length; j++) {
            images.push(getRandomElement(sampleImages));
          }
        }

        // Random date within last 90 days
        const daysAgo = Math.floor(Math.random() * 90);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        reviewsToCreate.push({
          productId,
          rating,
          review: reviewText,
          reviewerName,
          reviewerEmail,
          status,
          verified: Math.random() > 0.3,
          images: images ? JSON.stringify(images) : null,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }

    // Create reviews in batches
    const batchSize = 100;
    let created = 0;

    for (let i = 0; i < reviewsToCreate.length; i += batchSize) {
      const batch = reviewsToCreate.slice(i, i + batchSize);
      await prisma.review.createMany({
        data: batch,
      });
      created += batch.length;
    }

    // Update product ratings in batches to avoid connection pool exhaustion
    const productBatchSize = 10;
    for (let i = 0; i < targetProductIds.length; i += productBatchSize) {
      const productBatch = targetProductIds.slice(i, i + productBatchSize);
      
      await Promise.all(
        productBatch.map(async (productId) => {
          const stats = await prisma.review.aggregate({
            where: { productId, status: "approved" },
            _avg: { rating: true },
            _count: { rating: true },
          });

          if (stats._count.rating > 0) {
            await prisma.product.update({
              where: { id: productId },
              data: {
                averageRating: stats._avg.rating || 0,
                ratingCount: stats._count.rating,
              },
            });
          }
        })
      );
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "bulk_reviews_created",
        objectType: "review",
        details: JSON.stringify({
          mode,
          productsCount: targetProductIds.length,
          reviewsPerProduct: count,
          totalCreated: created,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      created,
      productsCount: targetProductIds.length,
    });
  } catch (error: any) {
    console.error("Bulk create reviews error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create bulk reviews",
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/bulk - Delete reviews by criteria
export async function DELETE(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) {
    return authResult.error === "Admin access required"
      ? forbiddenResponse(authResult.error)
      : unauthorizedResponse(authResult.error);
  }

  try {
    const body = await request.json();
    const { mode, productIds = [], categoryIds = [], status } = body;

    let where: any = {};

    if (mode === "product" && productIds.length > 0) {
      where.productId = { in: productIds };
    } else if (mode === "category" && categoryIds.length > 0) {
      const products = await prisma.product.findMany({
        where: {
          categories: {
            some: { categoryId: { in: categoryIds } },
          },
        },
        select: { id: true },
      });
      where.productId = { in: products.map((p) => p.id) };
    } else if (mode === "all") {
      // Delete all reviews
    }

    if (status) {
      where.status = status;
    }

    const result = await prisma.review.deleteMany({ where });

    // Update product ratings for affected products
    if (where.productId?.in) {
      for (const productId of where.productId.in) {
        const approvedReviews = await prisma.review.findMany({
          where: { productId, status: "approved" },
          select: { rating: true },
        });

        const avgRating =
          approvedReviews.length > 0
            ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
              approvedReviews.length
            : 0;

        await prisma.product.update({
          where: { id: productId },
          data: {
            averageRating: avgRating,
            ratingCount: approvedReviews.length,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Bulk delete reviews error:", error);
    return NextResponse.json(
      { error: "Failed to delete reviews" },
      { status: 500 }
    );
  }
}
