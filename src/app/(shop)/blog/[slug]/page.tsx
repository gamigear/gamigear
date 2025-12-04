import { notFound } from "next/navigation";
import BlogDetailClient from "./BlogDetailClient";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  status: string;
  author: {
    displayName: string;
    avatarUrl: string | null;
  } | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  publishedAt: string | null;
  createdAt: string;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/posts?slug=${slug}&status=publish`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.data && data.data.length > 0) {
      const postRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/posts/${data.data[0].id}`,
        { cache: "no-store" }
      );
      if (!postRes.ok) return null;
      return postRes.json();
    }
    return null;
  } catch {
    return null;
  }
}

async function getRelatedPosts(currentId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/posts?status=publish&per_page=4`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).filter((p: Post) => p.id !== currentId).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id);

  return <BlogDetailClient post={post} relatedPosts={relatedPosts} />;
}
