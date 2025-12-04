import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import LandingPageClient from "./LandingPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const landingPage = await prisma.landingPage.findUnique({
    where: { slug },
  });

  if (!landingPage) {
    return { title: "Not Found" };
  }

  return {
    title: landingPage.metaTitle || landingPage.title,
    description: landingPage.metaDescription || landingPage.description,
    openGraph: {
      title: landingPage.metaTitle || landingPage.title,
      description: landingPage.metaDescription || landingPage.description || "",
      images: landingPage.ogImage ? [landingPage.ogImage] : [],
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;

  const landingPage = await prisma.landingPage.findUnique({
    where: { slug },
  });

  if (!landingPage || !landingPage.isActive) {
    notFound();
  }

  // Increment view count
  await prisma.landingPage.update({
    where: { id: landingPage.id },
    data: { viewCount: { increment: 1 } },
  });

  // Get products if needed
  let products: any[] = [];
  if (landingPage.showProducts && landingPage.productIds) {
    try {
      const productIds = JSON.parse(landingPage.productIds);
      if (Array.isArray(productIds) && productIds.length > 0) {
        products = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            status: "publish",
          },
          include: {
            images: {
              orderBy: { position: "asc" },
              take: 1,
            },
          },
        });
      }
    } catch (e) {
      console.error("Failed to parse productIds:", e);
    }
  }

  // Transform null to undefined for optional fields
  const transformedLandingPage = {
    ...landingPage,
    heroTitle: landingPage.heroTitle ?? undefined,
    heroSubtitle: landingPage.heroSubtitle ?? undefined,
    heroImage: landingPage.heroImage ?? undefined,
    heroButtonText: landingPage.heroButtonText ?? undefined,
    heroButtonLink: landingPage.heroButtonLink ?? undefined,
    heroBackground: landingPage.heroBackground ?? undefined,
    contentTitle: landingPage.contentTitle ?? undefined,
    contentText: landingPage.contentText ?? undefined,
    contentImage: landingPage.contentImage ?? undefined,
    productTitle: landingPage.productTitle ?? undefined,
    ctaTitle: landingPage.ctaTitle ?? undefined,
    ctaSubtitle: landingPage.ctaSubtitle ?? undefined,
    ctaButtonText: landingPage.ctaButtonText ?? undefined,
    ctaButtonLink: landingPage.ctaButtonLink ?? undefined,
    ctaBackground: landingPage.ctaBackground ?? undefined,
    countdownEndDate: landingPage.countdownEndDate?.toISOString() ?? undefined,
    countdownTitle: landingPage.countdownTitle ?? undefined,
    customCss: landingPage.customCss ?? undefined,
  };

  return <LandingPageClient landingPage={transformedLandingPage} products={products} />;
}
