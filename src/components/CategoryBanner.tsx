import Link from "next/link";
import Image from "next/image";

const categoryImages = [
  {
    name: "TOP",
    slug: "top",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600",
  },
  {
    name: "BOTTOM",
    slug: "bottom",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
  },
  {
    name: "OUTER",
    slug: "outer",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
  },
  {
    name: "ACC",
    slug: "acc",
    image: "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=600",
  },
];

export default function CategoryBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">CATEGORY</h2>
          <p className="text-gray-500 text-sm">카테고리별 상품 보기</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryImages.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative aspect-square overflow-hidden bg-gray-100"
            >
              {cat.image && cat.image !== "#" && (cat.image.startsWith("/") || cat.image.startsWith("http")) ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xl md:text-2xl font-bold tracking-wider">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
