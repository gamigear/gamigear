/**
 * API Client for Gamigear
 * Provides typed methods for all API endpoints
 */

import { API_ENDPOINTS } from './api-docs';
import type { 
  DBProduct, 
  DBOrder, 
  DBCustomer, 
  DBCategory, 
  DBCoupon, 
  DBReview,
  DBSettings 
} from './db/schema';

interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

interface CartResponse {
  items: Array<{
    productId: string;
    variationId?: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      salePrice?: number;
      image?: string;
      stockStatus: string;
    } | null;
    subtotal: number;
  }>;
  total: number;
  itemCount: number;
}

interface SearchResponse {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    onSale: boolean;
    image?: string;
    averageRating: number;
    ratingCount: number;
  }>;
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    query: string;
  };
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}

interface StatsResponse {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  processingOrders: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Products
  async getProducts(params?: {
    category?: string;
    status?: string;
    featured?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<DBProduct[]>> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.featured !== undefined) searchParams.set('featured', String(params.featured));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    
    const query = searchParams.toString();
    return this.request(`${API_ENDPOINTS.products}${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string): Promise<DBProduct> {
    return this.request(API_ENDPOINTS.product(id));
  }

  async createProduct(data: Omit<DBProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBProduct> {
    return this.request(API_ENDPOINTS.products, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<DBProduct>): Promise<DBProduct> {
    return this.request(API_ENDPOINTS.product(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return this.request(API_ENDPOINTS.product(id), { method: 'DELETE' });
  }

  // Orders
  async getOrders(params?: {
    status?: string;
    customer?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<DBOrder[]>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.customer) searchParams.set('customer', params.customer);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    
    const query = searchParams.toString();
    return this.request(`${API_ENDPOINTS.orders}${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string): Promise<DBOrder> {
    return this.request(API_ENDPOINTS.order(id));
  }

  async createOrder(data: Omit<DBOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<DBOrder> {
    return this.request(API_ENDPOINTS.orders, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id: string, data: Partial<DBOrder>): Promise<DBOrder> {
    return this.request(API_ENDPOINTS.order(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Customers
  async getCustomers(params?: {
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<DBCustomer[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    
    const query = searchParams.toString();
    return this.request(`${API_ENDPOINTS.customers}${query ? `?${query}` : ''}`);
  }

  async getCustomer(id: string): Promise<DBCustomer> {
    return this.request(API_ENDPOINTS.customer(id));
  }

  // Categories
  async getCategories(): Promise<ApiResponse<DBCategory[]>> {
    return this.request(API_ENDPOINTS.categories);
  }

  async getCategory(id: string): Promise<DBCategory> {
    return this.request(API_ENDPOINTS.category(id));
  }

  // Cart
  async getCart(): Promise<CartResponse> {
    return this.request(API_ENDPOINTS.cart);
  }

  async addToCart(productId: string, quantity = 1, variationId?: string): Promise<{ success: boolean; message: string }> {
    return this.request(API_ENDPOINTS.cart, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, variationId }),
    });
  }

  async updateCartItem(productId: string, quantity: number, variationId?: string): Promise<{ success: boolean; message: string }> {
    return this.request(API_ENDPOINTS.cart, {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity, variationId }),
    });
  }

  async removeFromCart(productId: string, variationId?: string): Promise<{ success: boolean; message: string }> {
    const params = new URLSearchParams({ productId });
    if (variationId) params.set('variationId', variationId);
    return this.request(`${API_ENDPOINTS.cart}?${params}`, { method: 'DELETE' });
  }

  async clearCart(): Promise<{ success: boolean; message: string }> {
    return this.request(API_ENDPOINTS.cart, { method: 'DELETE' });
  }

  // Search
  async search(params: {
    q: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity';
    page?: number;
    per_page?: number;
  }): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('q', params.q);
    if (params.category) searchParams.set('category', params.category);
    if (params.min_price) searchParams.set('min_price', String(params.min_price));
    if (params.max_price) searchParams.set('max_price', String(params.max_price));
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));
    
    return this.request(`${API_ENDPOINTS.search}?${searchParams}`);
  }

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: any }> {
    return this.request(API_ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ success: boolean; token: string; user: any }> {
    return this.request(API_ENDPOINTS.register, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings(): Promise<DBSettings> {
    return this.request(API_ENDPOINTS.settings);
  }

  async updateSettings(data: Partial<DBSettings>): Promise<DBSettings> {
    return this.request(API_ENDPOINTS.settings, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Stats
  async getStats(): Promise<StatsResponse> {
    return this.request(API_ENDPOINTS.stats);
  }

  // Upload
  async uploadFile(file: File): Promise<{ success: boolean; url: string; filename: string; size: number; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.upload}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  // Reviews
  async getReviews(params?: {
    product?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<DBReview[]>> {
    const searchParams = new URLSearchParams();
    if (params?.product) searchParams.set('product', params.product);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    
    const query = searchParams.toString();
    return this.request(`${API_ENDPOINTS.reviews}${query ? `?${query}` : ''}`);
  }

  async createReview(data: Omit<DBReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBReview> {
    return this.request(API_ENDPOINTS.reviews, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Coupons
  async getCoupons(): Promise<ApiResponse<DBCoupon[]>> {
    return this.request(API_ENDPOINTS.coupons);
  }

  async validateCoupon(code: string): Promise<DBCoupon | null> {
    const response = await this.getCoupons();
    return response.data.find(c => c.code === code) || null;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };
