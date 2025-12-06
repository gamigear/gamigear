import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleBlogs = [
  {
    title: "Top 10 xu hướng thời trang Gaming 2024",
    slug: "top-10-xu-huong-thoi-trang-gaming-2024",
    excerpt: "Khám phá những xu hướng thời trang gaming hot nhất năm 2024, từ hoodie oversized đến áo thun graphic độc đáo.",
    content: `<p>Năm 2024 đánh dấu sự bùng nổ của thời trang gaming với nhiều xu hướng mới mẻ và độc đáo.</p>
<h2>1. Hoodie Oversized</h2>
<p>Hoodie oversized vẫn là lựa chọn hàng đầu của các game thủ với sự thoải mái và phong cách.</p>
<h2>2. Áo thun Graphic</h2>
<p>Những chiếc áo thun với hình ảnh từ các game nổi tiếng như League of Legends, Genshin Impact...</p>`,
    featuredImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  },
  {
    title: "Cách phối đồ gaming streetwear cực chất",
    slug: "cach-phoi-do-gaming-streetwear-cuc-chat",
    excerpt: "Hướng dẫn phối đồ gaming streetwear để vừa thoải mái khi chơi game vừa thời trang khi ra phố.",
    content: `<p>Gaming streetwear đang trở thành xu hướng được nhiều bạn trẻ yêu thích.</p>
<h2>Phối với quần jogger</h2>
<p>Hoodie gaming kết hợp với quần jogger tạo nên set đồ năng động.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800",
  },
  {
    title: "Review: Bộ sưu tập League of Legends x Fashion",
    slug: "review-bo-suu-tap-league-of-legends-fashion",
    excerpt: "Đánh giá chi tiết bộ sưu tập thời trang hợp tác giữa League of Legends và các thương hiệu nổi tiếng.",
    content: `<p>Riot Games đã hợp tác với nhiều thương hiệu thời trang để tạo ra những sản phẩm độc đáo.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
  },
  {
    title: "5 tips chọn size áo hoodie gaming chuẩn nhất",
    slug: "5-tips-chon-size-ao-hoodie-gaming-chuan-nhat",
    excerpt: "Hướng dẫn cách chọn size hoodie gaming phù hợp với vóc dáng của bạn.",
    content: `<p>Việc chọn đúng size hoodie rất quan trọng để đảm bảo sự thoải mái khi mặc.</p>
<h2>Tip 1: Đo số đo cơ thể</h2>
<p>Đo vòng ngực, chiều dài tay và chiều dài áo trước khi mua.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
  },
  {
    title: "Anime Fashion: Từ màn hình đến đời thực",
    slug: "anime-fashion-tu-man-hinh-den-doi-thuc",
    excerpt: "Khám phá cách các nhân vật anime ảnh hưởng đến xu hướng thời trang đường phố.",
    content: `<p>Anime không chỉ là giải trí mà còn là nguồn cảm hứng thời trang vô tận.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800",
  },
  {
    title: "Chăm sóc áo thun in hình đúng cách",
    slug: "cham-soc-ao-thun-in-hinh-dung-cach", 
    excerpt: "Bí quyết giữ áo thun in hình luôn mới và bền màu theo thời gian.",
    content: `<p>Áo thun in hình cần được chăm sóc đặc biệt để giữ được chất lượng hình in.</p>
<h2>Giặt đúng cách</h2>
<p>Lộn trái áo trước khi giặt, sử dụng nước lạnh và không dùng máy sấy.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
  },
  {
    title: "Genshin Impact: Cosplay và thời trang",
    slug: "genshin-impact-cosplay-va-thoi-trang",
    excerpt: "Tìm hiểu về văn hóa cosplay Genshin Impact và ảnh hưởng đến thời trang.",
    content: `<p>Genshin Impact đã tạo ra một cộng đồng cosplay khổng lồ trên toàn thế giới.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800",
  },
  {
    title: "Mua sắm thông minh: Black Friday Gaming Gear",
    slug: "mua-sam-thong-minh-black-friday-gaming-gear",
    excerpt: "Hướng dẫn săn deal Black Friday cho các sản phẩm gaming gear và thời trang.",
    content: `<p>Black Friday là thời điểm tuyệt vời để mua sắm gaming gear với giá ưu đãi.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
  },
];

async function main() {
  console.log("🗑️  Xóa blogs cũ...");
  await prisma.post.deleteMany({});

  // Create or get default category
  let category = await prisma.postCategory.findFirst({ where: { slug: "tin-tuc" } });
  if (!category) {
    category = await prisma.postCategory.create({
      data: { name: "Tin tức", slug: "tin-tuc", description: "Tin tức và bài viết" },
    });
  }

  console.log("📝 Tạo 8 bài blog mẫu...");
  for (const blog of sampleBlogs) {
    const daysAgo = Math.floor(Math.random() * 30);
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - daysAgo);

    const post = await prisma.post.create({
      data: {
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        featuredImage: blog.featuredImage,
        status: "publish",
        publishedAt,
      },
    });

    await prisma.postCategoryRelation.create({
      data: { postId: post.id, categoryId: category.id },
    });

    console.log(`   ✓ ${blog.title}`);
  }

  console.log("\n✅ Hoàn thành! Đã tạo 8 bài blog.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
