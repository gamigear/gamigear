// Server-side API functions to fetch data from database
import prisma from '@/lib/db/prisma';

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  brand?: string | null;
  category?: string;
  categoryId?: string;
  categorySlug?: string;
  rating?: number;
  reviewCount?: number;
  isBest?: boolean;
  isNew?: boolean;
  isFreeShipping?: boolean;
  rank?: number;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  count: number;
}

// Transform Prisma product to ProductData format
function transformProduct(product: any, rank?: number): ProductData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.regularPrice !== product.price ? product.regularPrice : null,
    image: product.images?.[0]?.src || '/placeholder.png',
    brand: product.brand?.name || null,
    category: product.categories?.[0]?.category?.name || '',
    categoryId: product.categories?.[0]?.category?.id || '',
    categorySlug: product.categories?.[0]?.category?.slug || '',
    rating: product.averageRating || 0,
    reviewCount: product.ratingCount || 0,
    isBest: product.featured,
    isNew: product.tags?.some((t: any) => t.tag?.slug === 'new') || false,
    isFreeShipping: product.tags?.some((t: any) => t.tag?.slug === 'free-shipping') || false,
    rank,
  };
}

// Get best/featured products
export async function getBestProducts(limit: number = 12): Promise<ProductData[]> {
  const products = await prisma.product.findMany({
    where: {
      status: 'publish',
      featured: true,
    },
    include: {
      images: {
        orderBy: { position: 'asc' },
        take: 1,
      },
      brand: true,
      categories: {
        include: { category: true },
        take: 1,
      },
      tags: {
        include: { tag: true },
      },
    },
    orderBy: [
      { ratingCount: 'desc' },
      { averageRating: 'desc' },
    ],
    take: limit,
  });

  return products.map((p: any, index: number) => transformProduct(p, index + 1));
}

// Get new products
export async function getNewProducts(limit: number = 8): Promise<ProductData[]> {
  const products = await prisma.product.findMany({
    where: {
      status: 'publish',
      tags: {
        some: {
          tag: { slug: 'new' },
        },
      },
    },
    include: {
      images: {
        orderBy: { position: 'asc' },
        take: 1,
      },
      brand: true,
      categories: {
        include: { category: true },
        take: 1,
      },
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return products.map((p: any) => transformProduct(p));
}

// Get products by category
export async function getProductsByCategory(categorySlug: string, limit: number = 8): Promise<ProductData[]> {
  const products = await prisma.product.findMany({
    where: {
      status: 'publish',
      categories: {
        some: {
          category: { slug: categorySlug },
        },
      },
    },
    include: {
      images: {
        orderBy: { position: 'asc' },
        take: 1,
      },
      brand: true,
      categories: {
        include: { category: true },
        take: 1,
      },
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return products.map((p: any) => transformProduct(p));
}

// Get all products with pagination
export async function getProducts(options: {
  page?: number;
  perPage?: number;
  category?: string;
  featured?: boolean;
  search?: string;
} = {}): Promise<{ products: ProductData[]; total: number; totalPages: number }> {
  const { page = 1, perPage = 20, category, featured, search } = options;

  const where: any = {
    status: 'publish',
  };

  if (featured !== undefined) {
    where.featured = featured;
  }

  if (category) {
    where.categories = {
      some: {
        category: { slug: category },
      },
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { position: 'asc' },
          take: 1,
        },
        brand: true,
        categories: {
          include: { category: true },
          take: 1,
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p: any) => transformProduct(p)),
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

// Get single product by ID
export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      brand: true,
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
      attributes: {
        orderBy: { position: 'asc' },
      },
      variations: {
        where: { isActive: true },
        orderBy: { position: 'asc' },
      },
      reviews: {
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  return {
    ...transformProduct(product),
    description: product.description,
    shortDescription: product.shortDescription,
    images: product.images.map((img: { src: string; alt: string | null }) => ({
      src: img.src,
      alt: img.alt || '',
    })),
    attributes: product.attributes,
    variations: product.variations.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      regularPrice: v.regularPrice,
      salePrice: v.salePrice,
      onSale: v.onSale,
      stockQuantity: v.stockQuantity,
      stockStatus: v.stockStatus,
      image: v.image,
      attributes: v.attributes ? JSON.parse(v.attributes) : [],
    })),
    reviews: product.reviews,
    stockStatus: product.stockStatus,
    stockQuantity: product.stockQuantity,
    productType: product.productType,
    affiliateUrl: product.affiliateUrl,
    affiliateButtonText: product.affiliateButtonText,
  };
}

// Get single product by Slug (with fallback to ID)
export async function getProductBySlug(slug: string) {
  // Try to find by slug first
  let product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      brand: true,
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
      attributes: {
        orderBy: { position: 'asc' },
      },
      variations: {
        where: { isActive: true },
        orderBy: { position: 'asc' },
      },
      reviews: {
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // If not found by slug, try to find by ID (for backward compatibility)
  if (!product) {
    product = await prisma.product.findUnique({
      where: { id: slug },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
        brand: true,
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
        attributes: {
          orderBy: { position: 'asc' },
        },
        variations: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
        reviews: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  if (!product) return null;

  return {
    ...transformProduct(product),
    description: product.description,
    shortDescription: product.shortDescription,
    images: product.images.map((img: { src: string; alt: string | null }) => ({
      src: img.src,
      alt: img.alt || '',
    })),
    attributes: product.attributes,
    variations: product.variations.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      regularPrice: v.regularPrice,
      salePrice: v.salePrice,
      onSale: v.onSale,
      stockQuantity: v.stockQuantity,
      stockStatus: v.stockStatus,
      image: v.image,
      attributes: v.attributes ? JSON.parse(v.attributes) : [],
    })),
    reviews: product.reviews,
    stockStatus: product.stockStatus,
    stockQuantity: product.stockQuantity,
    productType: product.productType,
    affiliateUrl: product.affiliateUrl,
    affiliateButtonText: product.affiliateButtonText,
  };
}

// Get categories
export async function getCategories(): Promise<CategoryData[]> {
  const categories = await prisma.category.findMany({
    orderBy: { menuOrder: 'asc' },
  });

  return categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    count: c.count,
  }));
}

// Get category by slug
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}
