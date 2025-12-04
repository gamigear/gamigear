import Image from "next/image";
import { Instagram } from "lucide-react";

const instagramPosts = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400",
  "https://images.unsplash.com/photo-1485968579169-a6b9e5938b8c?w=400",
  "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=400",
];

export default function InstagramFeed() {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Instagram size={24} />
            <h2 className="text-2xl md:text-3xl font-bold">INSTAGRAM</h2>
          </div>
          <p className="text-gray-500 text-sm">@hi_store_official</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {instagramPosts.map((post, index) => (
            <a
              key={index}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden"
            >
              <Image
                src={post}
                alt={`Instagram post ${index + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Instagram
                  size={24}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
