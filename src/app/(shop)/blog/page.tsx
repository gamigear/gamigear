import BlogPageClient from "./BlogPageClient";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  status: string;
  author: {
    displayName: string;
  } | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  publishedAt: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

async function getPosts(page = 1, category?: string) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: "10",
      status: "publish",
    });
    if (category) {
      params.set("category", category);
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/posts?${params}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { data: [], meta: { total: 0, totalPages: 1 } };
    return res.json();
  } catch {
    return { data: [], meta: { total: 0, totalPages: 1 } };
  }
}

async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/post-categories`,
      { cache: "no-store" }
    );
    if (!res.ok) return { data: [] };
    return res.json();
  } catch {
    return { data: [] };
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const category = params.category;

  const [postsData, categoriesData] = await Promise.all([
    getPosts(page, category),
    getCategories(),
  ]);

  const posts: Post[] = postsData.data || [];
  const categories: Category[] = categoriesData.data || [];
  const totalPages = postsData.meta?.totalPages || 1;

  return (
    <BlogPageClient
      posts={posts}
      categories={categories}
      totalPages={totalPages}
      currentPage={page}
      currentCategory={category}
    />
  );
}
