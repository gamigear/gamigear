import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || limit.toString());
    const status = searchParams.get("status") || "approved";
    const productId = searchParams.get("productId");

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (productId) {
      where.productId = productId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              images: {
                select: { src: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.review.count({ where }),
    ]);

    // Format for reviews page
    const formattedReviews = reviews.map((review: any) => ({
      id: review.id,
      productId: review.productId,
      productName: review.product?.name || "Sản phẩm",
      productImage: review.product?.images?.[0]?.src || "",
      rating: review.rating,
      review: review.review,
      reviewerName: review.reviewerName,
      verified: review.verified,
      createdAt: review.createdAt.toISOString(),
    }));

    return NextResponse.json({
      reviews, // Original format for homepage slider
      data: formattedReviews, // Format for reviews page
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, reviewerName, reviewerEmail, review, rating } = body;

    if (!productId || !reviewerName || !reviewerEmail || !review || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newReview = await prisma.review.create({
      data: {
        productId,
        reviewerName,
        reviewerEmail,
        review,
        rating: parseInt(rating),
        status: "hold", // Pending approval
      },
    });

    return NextResponse.json({ review: newReview });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
