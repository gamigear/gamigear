// In-memory store (thay thế bằng database thực tế sau)
import {
  DBProduct,
  DBCategory,
  DBOrder,
  DBCustomer,
  DBCoupon,
  DBReview,
  DBSettings,
  DBPromotion,
  DBBanner,
  DBMedia,
  DBShippingZone,
  DBShippingMethod,
  DBTaxRate,
  DBTaxClass,
  DBUser,
  DBRole,
  DBActivityLog,
  DBInventoryLog,
  DBWebhook,
  DBNotification,
  DBTag,
  DBBrand,
} from './schema';

// ==================== MOCK DATA ====================

export const mockCategories: DBCategory[] = [
  {
    id: 'cat-1',
    name: '좋은책방',
    slug: 'books',
    description: '아이들을 위한 좋은 책',
    displayType: 'default',
    menuOrder: 1,
    count: 150,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'cat-2',
    name: '체험티켓',
    slug: 'tickets',
    description: '특별한 경험을 선물하세요',
    displayType: 'default',
    menuOrder: 2,
    count: 85,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'cat-3',
    name: '학습교구',
    slug: 'edu',
    description: '재미있는 학습 교구',
    displayType: 'default',
    menuOrder: 3,
    count: 120,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'cat-4',
    name: '문구/완구',
    slug: 'stationery',
    description: '학교생활 필수품',
    displayType: 'default',
    menuOrder: 4,
    count: 200,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'cat-5',
    name: '생활용품',
    slug: 'living',
    description: '생활에 필요한 용품',
    displayType: 'default',
    menuOrder: 5,
    count: 95,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'cat-6',
    name: '건강/식품',
    slug: 'health',
    description: '건강한 성장을 위한 제품',
    displayType: 'default',
    menuOrder: 6,
    count: 75,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'cat-7',
    name: '패션/잡화',
    slug: 'fashion',
    description: '아동 패션 아이템',
    displayType: 'default',
    menuOrder: 7,
    count: 180,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export const mockProducts: DBProduct[] = [
  {
    id: 'prod-001',
    name: '♥단독최저가♥[산리오] 캐릭터즈 손난로 보조배터리 4종',
    slug: 'sanrio-hand-warmer',
    description: '귀여운 산리오 캐릭터 손난로 보조배터리',
    shortDescription: '손난로 + 보조배터리 2in1',
    sku: 'SANRIO-HW-001',
    price: 19900,
    regularPrice: 29900,
    salePrice: 19900,
    onSale: true,
    status: 'publish',
    featured: true,
    catalogVisibility: 'visible',
    manageStock: true,
    stockQuantity: 500,
    stockStatus: 'instock',
    backorders: 'no',
    soldIndividually: false,
    categoryIds: ['cat-5'],
    tagIds: [],
    brandId: 'brand-1',
    images: [
      { id: 'img-1', src: 'https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png', alt: '산리오 손난로', position: 0 },
    ],
    attributes: [],
    reviewsAllowed: true,
    averageRating: 4.9,
    ratingCount: 1250,
    createdAt: '2025-10-29',
    updatedAt: '2025-10-29',
  },
  {
    id: 'prod-002',
    name: '[베스트셀러] 어린이 동화책 세트 10권',
    slug: 'kids-book-set',
    description: '아이들이 좋아하는 베스트셀러 동화책 세트',
    shortDescription: '인기 동화책 10권 세트',
    sku: 'BOOK-SET-001',
    price: 45000,
    regularPrice: 60000,
    salePrice: 45000,
    onSale: true,
    status: 'publish',
    featured: true,
    catalogVisibility: 'visible',
    manageStock: true,
    stockQuantity: 200,
    stockStatus: 'instock',
    backorders: 'no',
    soldIndividually: false,
    categoryIds: ['cat-1'],
    tagIds: [],
    images: [
      { id: 'img-2', src: 'https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png', alt: '동화책 세트', position: 0 },
    ],
    attributes: [],
    reviewsAllowed: true,
    averageRating: 4.8,
    ratingCount: 856,
    createdAt: '2025-10-15',
    updatedAt: '2025-10-15',
  },
  {
    id: 'prod-003',
    name: '키즈카페 체험권 (2인)',
    slug: 'kids-cafe-ticket',
    description: '전국 키즈카페 이용권',
    shortDescription: '2인 이용 가능',
    sku: 'TICKET-KC-001',
    price: 25000,
    regularPrice: 35000,
    salePrice: 25000,
    onSale: true,
    status: 'publish',
    featured: true,
    catalogVisibility: 'visible',
    manageStock: true,
    stockQuantity: 1000,
    stockStatus: 'instock',
    backorders: 'no',
    soldIndividually: false,
    categoryIds: ['cat-2'],
    tagIds: [],
    images: [
      { id: 'img-3', src: 'https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png', alt: '키즈카페 체험권', position: 0 },
    ],
    attributes: [],
    reviewsAllowed: true,
    averageRating: 4.7,
    ratingCount: 523,
    createdAt: '2025-10-20',
    updatedAt: '2025-10-20',
  },
  {
    id: 'prod-004',
    name: '스마트 학습 태블릿 교구',
    slug: 'smart-learning-tablet',
    description: '아이들을 위한 스마트 학습 교구',
    shortDescription: '재미있는 학습 태블릿',
    sku: 'EDU-TAB-001',
    price: 89000,
    regularPrice: 120000,
    salePrice: 89000,
    onSale: true,
    status: 'publish',
    featured: true,
    catalogVisibility: 'visible',
    manageStock: true,
    stockQuantity: 150,
    stockStatus: 'instock',
    backorders: 'no',
    soldIndividually: false,
    categoryIds: ['cat-3'],
    tagIds: [],
    images: [
      { id: 'img-4', src: 'https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png', alt: '학습 태블릿', position: 0 },
    ],
    attributes: [],
    reviewsAllowed: true,
    averageRating: 4.6,
    ratingCount: 342,
    createdAt: '2025-10-25',
    updatedAt: '2025-10-25',
  },
  {
    id: 'prod-005',
    name: '캐릭터 문구세트 (필통+연필+지우개)',
    slug: 'character-stationery-set',
    description: '귀여운 캐릭터 문구 세트',
    shortDescription: '학교 필수 문구세트',
    sku: 'STAT-SET-001',
    price: 15000,
    regularPrice: 20000,
    salePrice: 15000,
    onSale: true,
    status: 'publish',
    featured: false,
    catalogVisibility: 'visible',
    manageStock: true,
    stockQuantity: 800,
    stockStatus: 'instock',
    backorders: 'no',
    soldIndividually: false,
    categoryIds: ['cat-4'],
    tagIds: [],
    images: [
      { id: 'img-5', src: 'https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png', alt: '문구세트', position: 0 },
    ],
    attributes: [],
    reviewsAllowed: true,
    averageRating: 4.5,
    ratingCount: 678,
    createdAt: '2025-10-18',
    updatedAt: '2025-10-18',
  },
  {
    id: 'prod-006',
    name: '유기농 어린이 간식 세트',
    slug: 'organic-kids-snack',
    description: '건강한 유기농 어린이 간식',
    shortDescription: '무첨가 유기농 간식',
    sku: 'HEALTH-SN-001',
    price: 32000,
    regularPrice: 40000,
    salePrice: 32000,
    onSale: true,
    status: 'publish',
    featured: true,
    catalogVisibility: 'visible',
    manageStock: true,
    stockQuantity: 300,
    stockStatus: 'instock',
    backorders: 'no',
    soldIndividually: false,
    categoryIds: ['cat-6'],
    tagIds: [],
    images: [
      { id: 'img-6', src: 'https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png', alt: '유기농 간식', position: 0 },
    ],
    attributes: [],
    reviewsAllowed: true,
    averageRating: 4.9,
    ratingCount: 445,
    createdAt: '2025-10-22',
    updatedAt: '2025-10-22',
  },
  {
    id: 'prod-007',
    name: '키즈 겨울 패딩 점퍼',
    slug: 'kids-winter-padding',
    description: '따뜻한 겨울 패딩 점퍼',
    shortDescription: '경량 보온 패딩',
    sku: 'FASH-PAD-001',
    price: 59000,
    regularPrice: 89000,
    salePrice: 59000,
    onSale: true,
    status: 'publish',
    featured: true,
    catalogVisibility: 'visible',
    manageStock: true,
    stockQuantity: 250,
    stockStatus: 'instock',
    backorders: 'no',
    soldIndividually: false,
    categoryIds: ['cat-7'],
    tagIds: [],
    images: [
      { id: 'img-7', src: 'https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png', alt: '겨울 패딩', position: 0 },
    ],
    attributes: [
      { id: 'attr-1', name: '사이즈', position: 0, visible: true, variation: true, options: ['100', '110', '120', '130', '140'] },
      { id: 'attr-2', name: '색상', position: 1, visible: true, variation: true, options: ['네이비', '블랙', '베이지'] },
    ],
    reviewsAllowed: true,
    averageRating: 4.8,
    ratingCount: 234,
    createdAt: '2025-11-01',
    updatedAt: '2025-11-01',
  },
  {
    id: 'prod-008',
    name: '레고 클래식 창작 박스',
    slug: 'lego-classic-box',
    description: '창의력을 키워주는 레고 클래식',
    shortDescription: '900피스 대용량',
    sku: 'TOY-LEGO-001',
    price: 45000,
    regularPrice: 55000,
    salePrice: 45000,
    onSale: true,
    status: 'publish',
    featured: false,
    catalogVisibility: 'visible',
    manageStock: true,
    stockQuantity: 180,
    stockStatus: 'instock',
    backorders: 'no',
    soldIndividually: false,
    categoryIds: ['cat-4'],
    tagIds: [],
    images: [
      { id: 'img-8', src: 'https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png', alt: '레고 클래식', position: 0 },
    ],
    attributes: [],
    reviewsAllowed: true,
    averageRating: 4.9,
    ratingCount: 567,
    createdAt: '2025-10-28',
    updatedAt: '2025-10-28',
  },
];

export const mockOrders: DBOrder[] = [
  {
    id: 'order-001',
    orderNumber: '20251130001',
    status: 'processing',
    currency: 'KRW',
    subtotal: 39800,
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 0,
    total: 39800,
    customerId: 'cust-001',
    billing: {
      firstName: '홍',
      lastName: '길동',
      address1: '서울시 강남구',
      city: '서울',
      state: '서울',
      postcode: '06000',
      country: 'KR',
      email: 'hong@example.com',
      phone: '010-1234-5678',
    },
    shipping: {
      firstName: '홍',
      lastName: '길동',
      address1: '서울시 강남구',
      city: '서울',
      state: '서울',
      postcode: '06000',
      country: 'KR',
    },
    lineItems: [
      {
        id: 'item-001',
        productId: 'prod-001',
        name: '♥단독최저가♥[산리오] 캐릭터즈 손난로 보조배터리 4종',
        quantity: 2,
        price: 19900,
        subtotal: 39800,
        total: 39800,
      },
    ],
    shippingLines: [
      {
        id: 'ship-001',
        methodId: 'free_shipping',
        methodTitle: '무료배송',
        total: 0,
      },
    ],
    couponLines: [],
    paymentMethod: 'card',
    paymentMethodTitle: '신용카드',
    createdAt: '2025-11-30',
    updatedAt: '2025-11-30',
  },
];

export const mockCustomers: DBCustomer[] = [
  {
    id: 'cust-001',
    email: 'hong@example.com',
    firstName: '홍',
    lastName: '길동',
    role: 'customer',
    billing: {
      firstName: '홍',
      lastName: '길동',
      address1: '서울시 강남구',
      city: '서울',
      state: '서울',
      postcode: '06000',
      country: 'KR',
      email: 'hong@example.com',
      phone: '010-1234-5678',
    },
    shipping: {
      firstName: '홍',
      lastName: '길동',
      address1: '서울시 강남구',
      city: '서울',
      state: '서울',
      postcode: '06000',
      country: 'KR',
    },
    isPayingCustomer: true,
    ordersCount: 5,
    totalSpent: 250000,
    createdAt: '2024-06-15',
    updatedAt: '2025-11-30',
  },
];

export const mockSettings: DBSettings = {
  storeName: 'Gamigear',
  storeAddress: {
    firstName: '',
    lastName: '',
    address1: '경기도 성남시 분당구 판교역로 225-20',
    city: '성남시',
    state: '경기도',
    postcode: '13494',
    country: 'KR',
  },
  storeEmail: 'help@hi-store.co.kr',
  storePhone: '1544-6040',
  currency: 'KRW',
  currencyPosition: 'right',
  thousandSeparator: ',',
  decimalSeparator: '.',
  numberOfDecimals: 0,
  taxEnabled: true,
  pricesIncludeTax: true,
  taxBasedOn: 'shipping',
  shippingEnabled: true,
  shippingCalculator: true,
  manageStock: true,
  holdStockMinutes: 60,
  notifyLowStock: true,
  notifyNoStock: true,
  lowStockAmount: 10,
};

export const mockReviews: DBReview[] = [
  {
    id: 'review-001',
    productId: 'prod-001',
    customerId: 'cust-001',
    reviewerName: '홍길동',
    reviewerEmail: 'hong@example.com',
    review: '아이가 너무 좋아해요! 디자인도 예쁘고 보조배터리 기능도 좋아요.',
    rating: 5,
    verified: true,
    status: 'approved',
    createdAt: '2025-11-28',
    updatedAt: '2025-11-28',
  },
  {
    id: 'review-002',
    productId: 'prod-002',
    customerId: 'cust-001',
    reviewerName: '김철수',
    reviewerEmail: 'kim@example.com',
    review: '책 내용이 정말 좋아요. 아이가 매일 읽어달라고 해요.',
    rating: 5,
    verified: true,
    status: 'approved',
    createdAt: '2025-11-25',
    updatedAt: '2025-11-25',
  },
];

export const mockCoupons: DBCoupon[] = [
  {
    id: 'coupon-001',
    code: 'WELCOME10',
    description: '신규 회원 10% 할인',
    discountType: 'percent',
    amount: 10,
    usageCount: 156,
    usageLimit: 500,
    minimumAmount: 30000,
    dateExpires: '2025-12-31',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'coupon-002',
    code: 'WINTER5000',
    description: '겨울 시즌 5,000원 할인',
    discountType: 'fixed_cart',
    amount: 5000,
    usageCount: 89,
    usageLimit: 200,
    minimumAmount: 50000,
    dateExpires: '2025-02-28',
    createdAt: '2025-11-01',
    updatedAt: '2025-11-01',
  },
];

// ==================== MOCK ROLES ====================
export const mockRoles: DBRole[] = [
  {
    slug: 'administrator',
    name: 'Administrator',
    capabilities: ['manage_options', 'manage_products', 'manage_orders', 'manage_customers', 'manage_coupons', 'manage_reviews', 'manage_users', 'view_reports'],
  },
  {
    slug: 'shop_manager',
    name: 'Shop Manager',
    capabilities: ['manage_products', 'manage_orders', 'manage_customers', 'manage_coupons', 'manage_reviews', 'view_reports'],
  },
  {
    slug: 'editor',
    name: 'Editor',
    capabilities: ['manage_products', 'manage_reviews'],
  },
  {
    slug: 'customer',
    name: 'Customer',
    capabilities: ['read', 'edit_account'],
  },
];

// ==================== MOCK SHIPPING ZONES ====================
export const mockShippingZones: DBShippingZone[] = [
  {
    id: 'zone-1',
    name: '서울/경기',
    order: 1,
    locations: [
      { code: 'KR:11', type: 'state' },
      { code: 'KR:41', type: 'state' },
    ],
    methods: [
      { id: 'method-1', zoneId: 'zone-1', title: '무료배송', type: 'free_shipping', enabled: true, order: 1, settings: { minAmount: 50000 } },
      { id: 'method-2', zoneId: 'zone-1', title: '일반배송', type: 'flat_rate', enabled: true, order: 2, settings: { cost: 3000 } },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'zone-2',
    name: '전국',
    order: 2,
    locations: [{ code: 'KR', type: 'country' }],
    methods: [
      { id: 'method-3', zoneId: 'zone-2', title: '무료배송', type: 'free_shipping', enabled: true, order: 1, settings: { minAmount: 70000 } },
      { id: 'method-4', zoneId: 'zone-2', title: '일반배송', type: 'flat_rate', enabled: true, order: 2, settings: { cost: 3500 } },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

// ==================== MOCK TAX ====================
export const mockTaxRates: DBTaxRate[] = [
  {
    id: 'tax-1',
    country: 'KR',
    state: '*',
    postcode: '*',
    city: '*',
    rate: 10,
    name: '부가가치세',
    priority: 1,
    compound: false,
    shipping: true,
    order: 1,
    taxClass: 'standard',
  },
];

export const mockTaxClasses: DBTaxClass[] = [
  { slug: 'standard', name: '표준세율' },
  { slug: 'reduced', name: '경감세율' },
  { slug: 'zero', name: '영세율' },
];

// ==================== MOCK MEDIA ====================
export const mockMedia: DBMedia[] = [
  {
    id: 'media-001',
    filename: 'sanrio-handwarmer.png',
    originalName: '산리오 손난로.png',
    mimeType: 'image/png',
    size: 245000,
    url: 'https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png',
    alt: '산리오 손난로 보조배터리',
    title: '산리오 손난로 보조배터리',
    folder: 'products',
    createdAt: '2025-10-29',
    updatedAt: '2025-10-29',
  },
  {
    id: 'media-002',
    filename: 'book-set.jpg',
    originalName: '동화책 세트.jpg',
    mimeType: 'image/jpeg',
    size: 180000,
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    alt: '어린이 동화책 세트',
    title: '어린이 동화책 세트',
    folder: 'products',
    createdAt: '2025-10-15',
    updatedAt: '2025-10-15',
  },
  {
    id: 'media-003',
    filename: 'kids-cafe.jpg',
    originalName: '키즈카페.jpg',
    mimeType: 'image/jpeg',
    size: 220000,
    url: 'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400',
    alt: '키즈카페 체험권',
    title: '키즈카페 체험권',
    folder: 'products',
    createdAt: '2025-10-20',
    updatedAt: '2025-10-20',
  },
  {
    id: 'media-004',
    filename: 'learning-tablet.jpg',
    originalName: '학습 태블릿.jpg',
    mimeType: 'image/jpeg',
    size: 195000,
    url: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400',
    alt: '스마트 학습 태블릿',
    title: '스마트 학습 태블릿',
    folder: 'products',
    createdAt: '2025-10-25',
    updatedAt: '2025-10-25',
  },
  {
    id: 'media-005',
    filename: 'stationery-set.jpg',
    originalName: '문구세트.jpg',
    mimeType: 'image/jpeg',
    size: 150000,
    url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400',
    alt: '캐릭터 문구세트',
    title: '캐릭터 문구세트',
    folder: 'products',
    createdAt: '2025-10-18',
    updatedAt: '2025-10-18',
  },
  {
    id: 'media-006',
    filename: 'organic-snack.jpg',
    originalName: '유기농 간식.jpg',
    mimeType: 'image/jpeg',
    size: 175000,
    url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
    alt: '유기농 어린이 간식',
    title: '유기농 어린이 간식',
    folder: 'products',
    createdAt: '2025-10-22',
    updatedAt: '2025-10-22',
  },
  {
    id: 'media-007',
    filename: 'winter-padding.jpg',
    originalName: '겨울 패딩.jpg',
    mimeType: 'image/jpeg',
    size: 210000,
    url: 'https://images.unsplash.com/photo-1544923246-77307dd628b5?w=400',
    alt: '키즈 겨울 패딩',
    title: '키즈 겨울 패딩',
    folder: 'products',
    createdAt: '2025-11-01',
    updatedAt: '2025-11-01',
  },
  {
    id: 'media-008',
    filename: 'lego-classic.jpg',
    originalName: '레고 클래식.jpg',
    mimeType: 'image/jpeg',
    size: 185000,
    url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400',
    alt: '레고 클래식 창작 박스',
    title: '레고 클래식 창작 박스',
    folder: 'products',
    createdAt: '2025-10-28',
    updatedAt: '2025-10-28',
  },
  {
    id: 'media-009',
    filename: 'banner-winter.jpg',
    originalName: '겨울 배너.jpg',
    mimeType: 'image/jpeg',
    size: 320000,
    url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800',
    alt: '겨울 시즌 배너',
    title: '겨울 시즌 배너',
    folder: 'banners',
    createdAt: '2025-11-15',
    updatedAt: '2025-11-15',
  },
  {
    id: 'media-010',
    filename: 'banner-sale.jpg',
    originalName: '세일 배너.jpg',
    mimeType: 'image/jpeg',
    size: 280000,
    url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800',
    alt: '세일 이벤트 배너',
    title: '세일 이벤트 배너',
    folder: 'banners',
    createdAt: '2025-11-20',
    updatedAt: '2025-11-20',
  },
];

// ==================== STORE CLASS ====================
class Store {
  private categories: DBCategory[] = mockCategories;
  private products: DBProduct[] = mockProducts;
  private orders: DBOrder[] = mockOrders;
  private customers: DBCustomer[] = mockCustomers;
  private coupons: DBCoupon[] = mockCoupons;
  private reviews: DBReview[] = mockReviews;
  private settings: DBSettings = mockSettings;
  private promotions: DBPromotion[] = [];
  private banners: DBBanner[] = [];
  
  // New collections
  private media: DBMedia[] = mockMedia;
  private shippingZones: DBShippingZone[] = mockShippingZones;
  private taxRates: DBTaxRate[] = mockTaxRates;
  private taxClasses: DBTaxClass[] = mockTaxClasses;
  private users: DBUser[] = [];
  private roles: DBRole[] = mockRoles;
  private activityLogs: DBActivityLog[] = [];
  private inventoryLogs: DBInventoryLog[] = [];
  private webhooks: DBWebhook[] = [];
  private notifications: DBNotification[] = [];
  private tags: DBTag[] = [];
  private brands: DBBrand[] = [];

  // Categories
  getCategories() { return this.categories; }
  getCategoryById(id: string) { return this.categories.find(c => c.id === id); }
  getCategoryBySlug(slug: string) { return this.categories.find(c => c.slug === slug); }
  createCategory(data: Omit<DBCategory, 'id' | 'createdAt' | 'updatedAt'>) {
    const category: DBCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.categories.push(category);
    return category;
  }
  updateCategory(id: string, data: Partial<DBCategory>) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories[index] = { ...this.categories[index], ...data, updatedAt: new Date().toISOString() };
      return this.categories[index];
    }
    return null;
  }
  deleteCategory(id: string) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories.splice(index, 1);
      return true;
    }
    return false;
  }

  // Products
  getProducts(filters?: { categoryId?: string; status?: string; featured?: boolean }) {
    let result = this.products;
    if (filters?.categoryId) {
      result = result.filter(p => p.categoryIds.includes(filters.categoryId!));
    }
    if (filters?.status) {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters?.featured !== undefined) {
      result = result.filter(p => p.featured === filters.featured);
    }
    return result;
  }
  getProductById(id: string) { return this.products.find(p => p.id === id); }
  getProductBySlug(slug: string) { return this.products.find(p => p.slug === slug); }
  createProduct(data: Omit<DBProduct, 'id' | 'createdAt' | 'updatedAt'>) {
    const product: DBProduct = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.push(product);
    return product;
  }
  updateProduct(id: string, data: Partial<DBProduct>) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...data, updatedAt: new Date().toISOString() };
      return this.products[index];
    }
    return null;
  }
  deleteProduct(id: string) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      return true;
    }
    return false;
  }

  // Orders
  getOrders(filters?: { status?: string; customerId?: string }) {
    let result = this.orders;
    if (filters?.status) {
      result = result.filter(o => o.status === filters.status);
    }
    if (filters?.customerId) {
      result = result.filter(o => o.customerId === filters.customerId);
    }
    return result;
  }
  getOrderById(id: string) { return this.orders.find(o => o.id === id); }
  createOrder(data: Omit<DBOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) {
    const order: DBOrder = {
      ...data,
      id: `order-${Date.now()}`,
      orderNumber: `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(this.orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.push(order);
    return order;
  }
  updateOrder(id: string, data: Partial<DBOrder>) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...data, updatedAt: new Date().toISOString() };
      return this.orders[index];
    }
    return null;
  }

  // Customers
  getCustomers() { return this.customers; }
  getCustomerById(id: string) { return this.customers.find(c => c.id === id); }
  getCustomerByEmail(email: string) { return this.customers.find(c => c.email === email); }
  createCustomer(data: Omit<DBCustomer, 'id' | 'createdAt' | 'updatedAt' | 'ordersCount' | 'totalSpent'>) {
    const customer: DBCustomer = {
      ...data,
      id: `cust-${Date.now()}`,
      ordersCount: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.customers.push(customer);
    return customer;
  }
  updateCustomer(id: string, data: Partial<DBCustomer>) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...data, updatedAt: new Date().toISOString() };
      return this.customers[index];
    }
    return null;
  }

  // Coupons
  getCoupons() { return this.coupons; }
  getCouponById(id: string) { return this.coupons.find(c => c.id === id); }
  getCouponByCode(code: string) { return this.coupons.find(c => c.code === code); }
  createCoupon(data: Omit<DBCoupon, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) {
    const coupon: DBCoupon = {
      ...data,
      id: `coupon-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.coupons.push(coupon);
    return coupon;
  }
  updateCoupon(id: string, data: Partial<DBCoupon>) {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index !== -1) {
      this.coupons[index] = { ...this.coupons[index], ...data, updatedAt: new Date().toISOString() };
      return this.coupons[index];
    }
    return null;
  }
  deleteCoupon(id: string) {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index !== -1) {
      this.coupons.splice(index, 1);
      return true;
    }
    return false;
  }

  // Reviews
  getReviews(filters?: { productId?: string; status?: string }) {
    let result = this.reviews;
    if (filters?.productId) {
      result = result.filter(r => r.productId === filters.productId);
    }
    if (filters?.status) {
      result = result.filter(r => r.status === filters.status);
    }
    return result;
  }
  getReviewById(id: string) { return this.reviews.find(r => r.id === id); }
  createReview(data: Omit<DBReview, 'id' | 'createdAt' | 'updatedAt'>) {
    const review: DBReview = {
      ...data,
      id: `review-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.reviews.push(review);
    return review;
  }
  updateReview(id: string, data: Partial<DBReview>) {
    const index = this.reviews.findIndex(r => r.id === id);
    if (index !== -1) {
      this.reviews[index] = { ...this.reviews[index], ...data, updatedAt: new Date().toISOString() };
      return this.reviews[index];
    }
    return null;
  }
  deleteReview(id: string) {
    const index = this.reviews.findIndex(r => r.id === id);
    if (index !== -1) {
      this.reviews.splice(index, 1);
      return true;
    }
    return false;
  }

  // Settings
  getSettings() { return this.settings; }
  updateSettings(data: Partial<DBSettings>) {
    this.settings = { ...this.settings, ...data };
    return this.settings;
  }

  // Banners
  getBanners() { return this.banners; }
  getBannerById(id: string) { return this.banners.find(b => b.id === id); }
  createBanner(data: Omit<DBBanner, 'id' | 'createdAt' | 'updatedAt'>) {
    const banner: DBBanner = {
      ...data,
      id: `banner-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.banners.push(banner);
    return banner;
  }
  updateBanner(id: string, data: Partial<DBBanner>) {
    const index = this.banners.findIndex(b => b.id === id);
    if (index !== -1) {
      this.banners[index] = { ...this.banners[index], ...data, updatedAt: new Date().toISOString() };
      return this.banners[index];
    }
    return null;
  }
  deleteBanner(id: string) {
    const index = this.banners.findIndex(b => b.id === id);
    if (index !== -1) {
      this.banners.splice(index, 1);
      return true;
    }
    return false;
  }

  // Promotions
  getPromotions() { return this.promotions; }
  getPromotionById(id: string) { return this.promotions.find(p => p.id === id); }
  createPromotion(data: Omit<DBPromotion, 'id' | 'createdAt' | 'updatedAt'>) {
    const promotion: DBPromotion = {
      ...data,
      id: `promo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.promotions.push(promotion);
    return promotion;
  }
  updatePromotion(id: string, data: Partial<DBPromotion>) {
    const index = this.promotions.findIndex(p => p.id === id);
    if (index !== -1) {
      this.promotions[index] = { ...this.promotions[index], ...data, updatedAt: new Date().toISOString() };
      return this.promotions[index];
    }
    return null;
  }
  deletePromotion(id: string) {
    const index = this.promotions.findIndex(p => p.id === id);
    if (index !== -1) {
      this.promotions.splice(index, 1);
      return true;
    }
    return false;
  }

  // Stats
  getStats() {
    const totalRevenue = this.orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
    
    const totalOrders = this.orders.length;
    const totalCustomers = this.customers.length;
    const totalProducts = this.products.length;
    
    const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
    const processingOrders = this.orders.filter(o => o.status === 'processing').length;
    
    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      processingOrders,
    };
  }

  // ==================== MEDIA ====================
  getMedia() { return this.media; }
  getMediaById(id: string) { return this.media.find(m => m.id === id); }
  createMedia(data: Omit<DBMedia, 'id' | 'createdAt' | 'updatedAt'>) {
    const media: DBMedia = {
      ...data,
      id: `media-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.media.push(media);
    return media;
  }
  updateMedia(id: string, data: Partial<DBMedia>) {
    const index = this.media.findIndex(m => m.id === id);
    if (index !== -1) {
      this.media[index] = { ...this.media[index], ...data, updatedAt: new Date().toISOString() };
      return this.media[index];
    }
    return null;
  }
  deleteMedia(id: string) {
    const index = this.media.findIndex(m => m.id === id);
    if (index !== -1) {
      this.media.splice(index, 1);
      return true;
    }
    return false;
  }

  // ==================== SHIPPING ====================
  getShippingZones() { return this.shippingZones; }
  getShippingZoneById(id: string) { return this.shippingZones.find(z => z.id === id); }
  createShippingZone(data: Omit<DBShippingZone, 'id' | 'createdAt' | 'updatedAt'>) {
    const zone: DBShippingZone = {
      ...data,
      id: `zone-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.shippingZones.push(zone);
    return zone;
  }
  updateShippingZone(id: string, data: Partial<DBShippingZone>) {
    const index = this.shippingZones.findIndex(z => z.id === id);
    if (index !== -1) {
      this.shippingZones[index] = { ...this.shippingZones[index], ...data, updatedAt: new Date().toISOString() };
      return this.shippingZones[index];
    }
    return null;
  }
  deleteShippingZone(id: string) {
    const index = this.shippingZones.findIndex(z => z.id === id);
    if (index !== -1) {
      this.shippingZones.splice(index, 1);
      return true;
    }
    return false;
  }
  getShippingMethods() {
    return this.shippingZones.flatMap(z => z.methods);
  }
  createShippingMethod(data: Omit<DBShippingMethod, 'id'>) {
    const method: DBShippingMethod = { ...data, id: `method-${Date.now()}` };
    const zone = this.shippingZones.find(z => z.id === data.zoneId);
    if (zone) {
      zone.methods.push(method);
      return method;
    }
    return null;
  }

  // ==================== TAX ====================
  getTaxRates() { return this.taxRates; }
  getTaxClasses() { return this.taxClasses; }
  createTaxRate(data: Omit<DBTaxRate, 'id'>) {
    const rate: DBTaxRate = { ...data, id: `tax-${Date.now()}` };
    this.taxRates.push(rate);
    return rate;
  }
  updateTaxRate(id: string, data: Partial<DBTaxRate>) {
    const index = this.taxRates.findIndex(r => r.id === id);
    if (index !== -1) {
      this.taxRates[index] = { ...this.taxRates[index], ...data };
      return this.taxRates[index];
    }
    return null;
  }
  deleteTaxRate(id: string) {
    const index = this.taxRates.findIndex(r => r.id === id);
    if (index !== -1) {
      this.taxRates.splice(index, 1);
      return true;
    }
    return false;
  }

  // ==================== USERS ====================
  getUsers() { return this.users; }
  getUserById(id: string) { return this.users.find(u => u.id === id); }
  getUserByEmail(email: string) { return this.users.find(u => u.email === email); }
  getUserByUsername(username: string) { return this.users.find(u => u.username === username); }
  createUser(data: Omit<DBUser, 'id' | 'createdAt' | 'updatedAt'>) {
    const user: DBUser = {
      ...data,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }
  updateUser(id: string, data: Partial<DBUser>) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...data, updatedAt: new Date().toISOString() };
      return this.users[index];
    }
    return null;
  }
  deleteUser(id: string) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  // ==================== ROLES ====================
  getRoles() { return this.roles; }
  getRoleBySlug(slug: string) { return this.roles.find(r => r.slug === slug); }

  // ==================== ACTIVITY LOGS ====================
  getActivityLogs() { return this.activityLogs; }
  createActivityLog(data: Omit<DBActivityLog, 'id' | 'createdAt'>) {
    const log: DBActivityLog = {
      ...data,
      id: `activity-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.activityLogs.push(log);
    return log;
  }

  // ==================== INVENTORY LOGS ====================
  getInventoryLogs() { return this.inventoryLogs; }
  createInventoryLog(data: Omit<DBInventoryLog, 'id' | 'createdAt'>) {
    const log: DBInventoryLog = {
      ...data,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.inventoryLogs.push(log);
    return log;
  }

  // ==================== WEBHOOKS ====================
  getWebhooks() { return this.webhooks; }
  getWebhookById(id: string) { return this.webhooks.find(w => w.id === id); }
  createWebhook(data: Omit<DBWebhook, 'id' | 'createdAt' | 'updatedAt'>) {
    const webhook: DBWebhook = {
      ...data,
      id: `webhook-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.webhooks.push(webhook);
    return webhook;
  }
  updateWebhook(id: string, data: Partial<DBWebhook>) {
    const index = this.webhooks.findIndex(w => w.id === id);
    if (index !== -1) {
      this.webhooks[index] = { ...this.webhooks[index], ...data, updatedAt: new Date().toISOString() };
      return this.webhooks[index];
    }
    return null;
  }
  deleteWebhook(id: string) {
    const index = this.webhooks.findIndex(w => w.id === id);
    if (index !== -1) {
      this.webhooks.splice(index, 1);
      return true;
    }
    return false;
  }

  // ==================== NOTIFICATIONS ====================
  getNotifications(userId?: string) {
    if (userId) return this.notifications.filter(n => n.userId === userId);
    return this.notifications;
  }
  createNotification(data: Omit<DBNotification, 'id' | 'createdAt'>) {
    const notification: DBNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.notifications.push(notification);
    return notification;
  }
  markNotificationRead(id: string) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index].isRead = true;
      return this.notifications[index];
    }
    return null;
  }

  // ==================== TAGS ====================
  getTags() { return this.tags; }
  getTagById(id: string) { return this.tags.find(t => t.id === id); }
  createTag(data: Omit<DBTag, 'id' | 'createdAt' | 'updatedAt' | 'count'>) {
    const tag: DBTag = {
      ...data,
      id: `tag-${Date.now()}`,
      count: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tags.push(tag);
    return tag;
  }

  // ==================== BRANDS ====================
  getBrands() { return this.brands; }
  getBrandById(id: string) { return this.brands.find(b => b.id === id); }
  createBrand(data: Omit<DBBrand, 'id' | 'createdAt' | 'updatedAt' | 'count'>) {
    const brand: DBBrand = {
      ...data,
      id: `brand-${Date.now()}`,
      count: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.brands.push(brand);
    return brand;
  }
}

export const store = new Store();
