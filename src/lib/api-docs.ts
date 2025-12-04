/**
 * API Documentation - Gamigear Backend
 * 
 * Base URL: /api
 * 
 * ==================== PRODUCTS ====================
 * 
 * GET /api/products
 *   - Query params: category, status, featured, page, per_page
 *   - Returns: { data: Product[], meta: { total, page, perPage, totalPages } }
 * 
 * POST /api/products
 *   - Body: Product data (without id, createdAt, updatedAt)
 *   - Returns: Created product
 * 
 * GET /api/products/[id]
 *   - Returns: Single product
 * 
 * PUT /api/products/[id]
 *   - Body: Partial product data
 *   - Returns: Updated product
 * 
 * DELETE /api/products/[id]
 *   - Returns: { success: true }
 * 
 * ==================== ORDERS ====================
 * 
 * GET /api/orders
 *   - Query params: status, customer, page, per_page
 *   - Returns: { data: Order[], meta: { total, page, perPage, totalPages } }
 * 
 * POST /api/orders
 *   - Body: Order data
 *   - Returns: Created order with orderNumber
 * 
 * GET /api/orders/[id]
 *   - Returns: Single order
 * 
 * PUT /api/orders/[id]
 *   - Body: Partial order data (e.g., status update)
 *   - Returns: Updated order
 * 
 * ==================== CUSTOMERS ====================
 * 
 * GET /api/customers
 *   - Query params: page, per_page
 *   - Returns: { data: Customer[], meta: { total, page, perPage, totalPages } }
 * 
 * POST /api/customers
 *   - Body: Customer data
 *   - Returns: Created customer
 * 
 * GET /api/customers/[id]
 *   - Returns: Single customer
 * 
 * PUT /api/customers/[id]
 *   - Body: Partial customer data
 *   - Returns: Updated customer
 * 
 * ==================== CATEGORIES ====================
 * 
 * GET /api/categories
 *   - Query params: page, per_page
 *   - Returns: { data: Category[], meta: { total, page, perPage, totalPages } }
 * 
 * POST /api/categories
 *   - Body: Category data
 *   - Returns: Created category
 * 
 * GET /api/categories/[id]
 *   - Returns: Single category
 * 
 * PUT /api/categories/[id]
 *   - Body: Partial category data
 *   - Returns: Updated category
 * 
 * DELETE /api/categories/[id]
 *   - Returns: { success: true }
 * 
 * ==================== COUPONS ====================
 * 
 * GET /api/coupons
 *   - Query params: page, per_page
 *   - Returns: { data: Coupon[], meta: { total, page, perPage, totalPages } }
 * 
 * POST /api/coupons
 *   - Body: Coupon data
 *   - Returns: Created coupon
 * 
 * GET /api/coupons/[id]
 *   - Returns: Single coupon
 * 
 * PUT /api/coupons/[id]
 *   - Body: Partial coupon data
 *   - Returns: Updated coupon
 * 
 * DELETE /api/coupons/[id]
 *   - Returns: { success: true }
 * 
 * ==================== REVIEWS ====================
 * 
 * GET /api/reviews
 *   - Query params: product, status, page, per_page
 *   - Returns: { data: Review[], meta: { total, page, perPage, totalPages } }
 * 
 * POST /api/reviews
 *   - Body: Review data
 *   - Returns: Created review
 * 
 * GET /api/reviews/[id]
 *   - Returns: Single review
 * 
 * PUT /api/reviews/[id]
 *   - Body: Partial review data (e.g., status update)
 *   - Returns: Updated review
 * 
 * DELETE /api/reviews/[id]
 *   - Returns: { success: true }
 * 
 * ==================== CART ====================
 * 
 * GET /api/cart
 *   - Returns: { items: CartItem[], total, itemCount }
 * 
 * POST /api/cart
 *   - Body: { productId, variationId?, quantity }
 *   - Returns: { success: true, message }
 * 
 * PUT /api/cart
 *   - Body: { productId, variationId?, quantity }
 *   - Returns: { success: true, message }
 * 
 * DELETE /api/cart
 *   - Query params: productId?, variationId?
 *   - Returns: { success: true, message }
 * 
 * ==================== SEARCH ====================
 * 
 * GET /api/search
 *   - Query params: q, category, min_price, max_price, sort, page, per_page
 *   - sort options: relevance, price_asc, price_desc, newest, rating, popularity
 *   - Returns: { data: Product[], meta, facets: { categories, priceRange } }
 * 
 * ==================== AUTH ====================
 * 
 * POST /api/auth/login
 *   - Body: { email, password }
 *   - Returns: { success, token, user }
 * 
 * POST /api/auth/register
 *   - Body: { email, password, firstName, lastName, phone? }
 *   - Returns: { success, token, user }
 * 
 * ==================== SETTINGS ====================
 * 
 * GET /api/settings
 *   - Returns: Store settings
 * 
 * PUT /api/settings
 *   - Body: Partial settings data
 *   - Returns: Updated settings
 * 
 * ==================== STATS ====================
 * 
 * GET /api/stats
 *   - Returns: { totalRevenue, totalOrders, totalCustomers, totalProducts, pendingOrders, processingOrders }
 * 
 * ==================== UPLOAD ====================
 * 
 * POST /api/upload
 *   - Body: FormData with 'file' field
 *   - Returns: { success, url, filename, size, type }
 * 
 * ==================== BANNERS ====================
 * 
 * GET /api/banners
 *   - Query params: active
 *   - Returns: { data: Banner[] }
 * 
 * POST /api/banners
 *   - Body: Banner data
 *   - Returns: Created banner
 * 
 * ==================== PROMOTIONS ====================
 * 
 * GET /api/promotions
 *   - Query params: active
 *   - Returns: { data: Promotion[] }
 * 
 * POST /api/promotions
 *   - Body: Promotion data
 *   - Returns: Created promotion
 */

export const API_ENDPOINTS = {
  // Products
  products: '/api/products',
  product: (id: string) => `/api/products/${id}`,
  
  // Orders
  orders: '/api/orders',
  order: (id: string) => `/api/orders/${id}`,
  
  // Customers
  customers: '/api/customers',
  customer: (id: string) => `/api/customers/${id}`,
  
  // Categories
  categories: '/api/categories',
  category: (id: string) => `/api/categories/${id}`,
  
  // Coupons
  coupons: '/api/coupons',
  coupon: (id: string) => `/api/coupons/${id}`,
  
  // Reviews
  reviews: '/api/reviews',
  review: (id: string) => `/api/reviews/${id}`,
  
  // Cart
  cart: '/api/cart',
  
  // Search
  search: '/api/search',
  
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  
  // Settings
  settings: '/api/settings',
  
  // Stats
  stats: '/api/stats',
  
  // Upload
  upload: '/api/upload',
  
  // Banners
  banners: '/api/banners',
  
  // Promotions
  promotions: '/api/promotions',
  
  // Media Library
  media: '/api/media',
  mediaItem: (id: string) => `/api/media/${id}`,
  
  // Shipping
  shippingZones: '/api/shipping/zones',
  shippingZone: (id: string) => `/api/shipping/zones/${id}`,
  shippingMethods: '/api/shipping/methods',
  shippingCalculate: '/api/shipping/calculate',
  
  // Taxes
  taxes: '/api/taxes',
  taxCalculate: '/api/taxes/calculate',
  
  // Reports
  reports: '/api/reports',
  
  // Users
  users: '/api/users',
  user: (id: string) => `/api/users/${id}`,
  
  // Webhooks
  webhooks: '/api/webhooks',
  webhook: (id: string) => `/api/webhooks/${id}`,
  
  // Inventory
  inventory: '/api/inventory',
  
  // Activity Logs
  activity: '/api/activity',
};
