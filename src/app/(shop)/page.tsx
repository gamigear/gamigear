import { unstable_cache } from "next/cache";
import DynamicHomepage from "@/components/DynamicHomepage";
import { getBestProducts, getNewProducts, getProductsByCategory } from "@/lib/api";

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
  { revalidate: 60 } // Revalidate every 60 seconds
);

export default async function Home() {
  const { bestProducts, newProducts, lolProducts, dot2Products } = await getCachedHomeData();

  return (
    <DynamicHomepage
      initialProducts={{
        best: bestProducts,
        new: newProducts,
        books: lolProducts,
        tickets: dot2Products,
      }}
    />
  );
}
