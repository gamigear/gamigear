import { unstable_cache } from "next/cache";
import DynamicHomepage from "@/components/DynamicHomepage";
import HeroBannerPreload from "@/components/HeroBannerPreload";
import { getBestProducts, getNewProducts, getProductsByCategory } from "@/lib/api";
import prisma from "@/lib/db/prisma";

// Cache banner data for 30 seconds (faster updates for marketing)
const getCachedBanners = unstable_cache(
  async () => {
    const [banners, categories] = await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
        include: { category: true },
      }),
      prisma.bannerCategory.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
      }),
    ]);
    return { banners, categories };
  },
  ['homepage-banners'],
  { revalidate: 30 }
);

// Cache homepage data for 60 seconds
const getCachedHomeData = unstable_cache(
  async () => {
    const [bestProducts, newProducts, lolProducts, dot2Products] = await Promise.all([
      getBestProducts(12),
      getNewProducts(8),
      getProductsByCategory('lol', 8),
      getProductsByCategory('dot2', 8),
    ]);
    return { bestProducts, newProducts, lolProducts, dot2Products };
  },
  ['homepage-data'],
  { revalidate: 60 }
);

export default async function Home() {
  // Fetch all data in parallel at server-side
  const [{ bestProducts, newProducts, lolProducts, dot2Products }, { banners, categories }] = 
    await Promise.all([getCachedHomeData(), getCachedBanners()]);

  return (
    <>
      {/* Preload first banner images for instant display */}
      <HeroBannerPreload banners={banners} />
      <DynamicHomepage
        initialProducts={{
          best: bestProducts,
          new: newProducts,
          books: lolProducts,
          tickets: dot2Products,
        }}
        initialBanners={banners}
        initialBannerCategories={categories}
      />
    </>
  );
}
