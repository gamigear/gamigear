export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categoryId: string;
  brand: string;
  isNew?: boolean;
  isBest?: boolean;
  isSpecial?: boolean;
  isFreeShipping?: boolean;
  isToday?: boolean;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  rank?: number;
  tags?: string[];
  badges?: ProductBadge[];
  description?: string;
  options?: ProductOption[];
  createdAt?: string;
  stock?: number;
}

export type ProductBadge = 'best' | 'new' | 'special' | 'free-shipping' | 'today';

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface Promotion {
  id: string;
  title: string;
  image: string;
  startDate: string;
  endDate: string;
  link: string;
  isActive?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  mobileImage?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  images?: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  points?: number;
}
