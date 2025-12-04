// Database Schema Types - Tương tự WooCommerce

// ==================== PRODUCTS ====================
export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku?: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  onSale: boolean;
  status: 'draft' | 'pending' | 'publish' | 'private';
  featured: boolean;
  catalogVisibility: 'visible' | 'catalog' | 'search' | 'hidden';
  
  // Inventory
  manageStock: boolean;
  stockQuantity?: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  backorders: 'no' | 'notify' | 'yes';
  lowStockAmount?: number;
  soldIndividually: boolean;
  
  // Shipping
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  shippingClass?: string;
  
  // Categories & Tags
  categoryIds: string[];
  tagIds: string[];
  brandId?: string;
  
  // Images
  images: ProductImage[];
  
  // Attributes & Variations
  attributes: ProductAttribute[];
  variations?: string[]; // variation IDs
  
  // Reviews
  reviewsAllowed: boolean;
  averageRating: number;
  ratingCount: number;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Dates
  createdAt: string;
  updatedAt: string;
  dateOnSaleFrom?: string;
  dateOnSaleTo?: string;
}

export interface ProductImage {
  id: string;
  src: string;
  alt?: string;
  position: number;
}

export interface ProductAttribute {
  id: string;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

// ==================== CATEGORIES ====================
export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  image?: string;
  displayType: 'default' | 'products' | 'subcategories' | 'both';
  menuOrder: number;
  count: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== ORDERS ====================
export interface DBOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  
  // Pricing
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  
  // Customer
  customerId?: string;
  customerNote?: string;
  
  // Addresses
  billing: Address;
  shipping: Address;
  
  // Items
  lineItems: OrderLineItem[];
  shippingLines: ShippingLine[];
  couponLines: CouponLine[];
  
  // Payment
  paymentMethod: string;
  paymentMethodTitle: string;
  transactionId?: string;
  datePaid?: string;
  
  // Dates
  createdAt: string;
  updatedAt: string;
  dateCompleted?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed';

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  variationId?: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  total: number;
  sku?: string;
  image?: string;
}

export interface ShippingLine {
  id: string;
  methodId: string;
  methodTitle: string;
  total: number;
}

export interface CouponLine {
  id: string;
  code: string;
  discount: number;
}

// ==================== CUSTOMERS ====================
export interface DBCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  role: 'customer' | 'subscriber' | 'administrator';
  
  billing: Address;
  shipping: Address;
  
  isPayingCustomer: boolean;
  avatarUrl?: string;
  
  // Stats
  ordersCount: number;
  totalSpent: number;
  
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
}

// ==================== COUPONS ====================
export interface DBCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed_cart' | 'fixed_product';
  amount: number;
  
  // Usage
  usageCount: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  
  // Restrictions
  minimumAmount?: number;
  maximumAmount?: number;
  productIds?: string[];
  excludedProductIds?: string[];
  categoryIds?: string[];
  excludedCategoryIds?: string[];
  emailRestrictions?: string[];
  
  // Dates
  dateExpires?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== REVIEWS ====================
export interface DBReview {
  id: string;
  productId: string;
  customerId?: string;
  reviewerName: string;
  reviewerEmail: string;
  review: string;
  rating: number;
  verified: boolean;
  status: 'approved' | 'hold' | 'spam' | 'trash';
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== SETTINGS ====================
export interface DBSettings {
  // General
  storeName: string;
  storeAddress: Address;
  storeEmail: string;
  storePhone: string;
  
  // Currency
  currency: string;
  currencyPosition: 'left' | 'right' | 'left_space' | 'right_space';
  thousandSeparator: string;
  decimalSeparator: string;
  numberOfDecimals: number;
  
  // Tax
  taxEnabled: boolean;
  pricesIncludeTax: boolean;
  taxBasedOn: 'shipping' | 'billing' | 'base';
  
  // Shipping
  shippingEnabled: boolean;
  shippingCalculator: boolean;
  
  // Inventory
  manageStock: boolean;
  holdStockMinutes: number;
  notifyLowStock: boolean;
  notifyNoStock: boolean;
  lowStockAmount: number;
}

// ==================== PROMOTIONS ====================
export interface DBPromotion {
  id: string;
  title: string;
  description?: string;
  image: string;
  link: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== BANNERS ====================
export interface DBBanner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== MEDIA LIBRARY ====================
export interface DBMedia {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  folder?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== SHIPPING ====================
export interface DBShippingZone {
  id: string;
  name: string;
  order: number;
  locations: ShippingLocation[];
  methods: DBShippingMethod[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingLocation {
  code: string; // Country/State code
  type: 'country' | 'state' | 'postcode';
}

export interface DBShippingMethod {
  id: string;
  zoneId: string;
  title: string;
  type: 'flat_rate' | 'free_shipping' | 'local_pickup' | 'table_rate';
  enabled: boolean;
  order: number;
  settings: {
    cost?: number;
    minAmount?: number; // For free shipping threshold
    taxable?: boolean;
    requiresCoupon?: boolean;
  };
}

export interface DBShippingClass {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

// ==================== TAX ====================
export interface DBTaxRate {
  id: string;
  country: string;
  state: string;
  postcode: string;
  city: string;
  rate: number;
  name: string;
  priority: number;
  compound: boolean;
  shipping: boolean;
  order: number;
  taxClass: string;
}

export interface DBTaxClass {
  slug: string;
  name: string;
}

// ==================== EMAIL TEMPLATES ====================
export interface DBEmailTemplate {
  id: string;
  type: EmailTemplateType;
  enabled: boolean;
  subject: string;
  heading: string;
  body: string;
  recipients?: string; // For admin emails
  createdAt: string;
  updatedAt: string;
}

export type EmailTemplateType =
  | 'new_order'
  | 'cancelled_order'
  | 'failed_order'
  | 'order_on_hold'
  | 'processing_order'
  | 'completed_order'
  | 'refunded_order'
  | 'customer_note'
  | 'reset_password'
  | 'new_account'
  | 'low_stock'
  | 'no_stock'
  | 'backorder';

// ==================== INVENTORY LOG ====================
export interface DBInventoryLog {
  id: string;
  productId: string;
  variationId?: string;
  type: 'sale' | 'refund' | 'restock' | 'adjustment' | 'return';
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  orderId?: string;
  note?: string;
  userId?: string;
  createdAt: string;
}

// ==================== USERS & ROLES ====================
export interface DBUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  avatar?: string;
  capabilities: string[];
  meta: Record<string, any>;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'administrator'
  | 'shop_manager'
  | 'editor'
  | 'author'
  | 'customer'
  | 'subscriber';

export interface DBRole {
  slug: UserRole;
  name: string;
  capabilities: string[];
}

// ==================== ACTIVITY LOG ====================
export interface DBActivityLog {
  id: string;
  userId?: string;
  action: string;
  objectType: 'product' | 'order' | 'customer' | 'coupon' | 'setting' | 'user';
  objectId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ==================== WEBHOOKS ====================
export interface DBWebhook {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'disabled';
  topic: WebhookTopic;
  deliveryUrl: string;
  secret: string;
  apiVersion: string;
  failureCount: number;
  lastDelivery?: {
    date: string;
    success: boolean;
    responseCode?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type WebhookTopic =
  | 'order.created'
  | 'order.updated'
  | 'order.deleted'
  | 'order.restored'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.restored'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'coupon.created'
  | 'coupon.updated'
  | 'coupon.deleted';

// ==================== REPORTS ====================
export interface DBReportCache {
  id: string;
  type: ReportType;
  period: 'day' | 'week' | 'month' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  data: Record<string, any>;
  generatedAt: string;
  expiresAt: string;
}

export type ReportType =
  | 'sales'
  | 'orders'
  | 'customers'
  | 'products'
  | 'categories'
  | 'coupons'
  | 'taxes'
  | 'shipping'
  | 'stock';

// ==================== PAYMENT GATEWAYS ====================
export interface DBPaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  supports: PaymentGatewaySupport[];
  settings: Record<string, any>;
}

export type PaymentGatewaySupport =
  | 'products'
  | 'subscriptions'
  | 'refunds'
  | 'tokenization'
  | 'add_payment_method';

// ==================== NOTES ====================
export interface DBOrderNote {
  id: string;
  orderId: string;
  content: string;
  isCustomerNote: boolean;
  addedBy?: string;
  createdAt: string;
}

// ==================== TAGS ====================
export interface DBTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== BRANDS ====================
export interface DBBrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== PRODUCT VARIATIONS ====================
export interface DBProductVariation {
  id: string;
  parentId: string;
  sku?: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  onSale: boolean;
  status: 'publish' | 'private';
  stockQuantity?: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  image?: ProductImage;
  attributes: { name: string; option: string }[];
  createdAt: string;
  updatedAt: string;
}

// ==================== WISHLIST ====================
export interface DBWishlist {
  id: string;
  customerId: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== NOTIFICATIONS ====================
export interface DBNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'order'
  | 'product'
  | 'customer'
  | 'review'
  | 'stock'
  | 'system';

// ==================== MENU ====================
export interface DBMenu {
  id: string;
  name: string;
  location: 'primary' | 'footer' | 'mobile' | 'category';
  items: DBMenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DBMenuItem {
  id: string;
  title: string;
  url?: string;
  type: 'custom' | 'page' | 'category' | 'product';
  objectId?: string;
  parentId?: string;
  order: number;
  target?: '_blank' | '_self';
  cssClasses?: string[];
  children?: DBMenuItem[];
}

// ==================== PAGES ====================
export interface DBPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'publish' | 'private';
  template?: string;
  parentId?: string;
  menuOrder: number;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
