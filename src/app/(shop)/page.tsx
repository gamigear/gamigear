import DynamicHomepage from "@/components/DynamicHomepage";
import { getBestProducts, getNewProducts, getProductsByCategory } from "@/lib/api";

export default async function Home() {
  // Fetch initial data from database
  const [bestProducts, newProducts, bookProducts, ticketProducts] = await Promise.all([
    getBestProducts(12),
    getNewProducts(8),
    getProductsByCategory('books', 8),
    getProductsByCategory('tickets', 8),
  ]);

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
