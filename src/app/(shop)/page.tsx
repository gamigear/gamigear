import { unstable_cache } from "next/cache";
import DynamicHomepage from "@/components/DynamicHomepage";
import { getBestProducts, getNewProducts, getProductsByCategory } from "@/lib/api";

// Cache homepage data for 60 seconds
const getCachedHomeData = unstable_cache(
  async () => {
    const [bestProducts, newProducts, bookProducts, ticketProducts] = await Promise.all([
      getBestProducts(12),
      getNewProducts(8),
      getProductsByCategory('books', 8),
      getProductsByCategory('tickets', 8),
    ]);
    return { bestProducts, newProducts, bookProducts, ticketProducts };
  },
  ['homepage-data'],
  { revalidate: 60 } // Revalidate every 60 seconds
);

export default async function Home() {
  const { bestProducts, newProducts, bookProducts, ticketProducts } = await getCachedHomeData();

  return (
    <DynamicHomepage
      initialProducts={{
        best: bestProducts,
        new: newProducts,
        books: bookProducts,
        tickets: ticketProducts,
      }}
    />
  );
}
