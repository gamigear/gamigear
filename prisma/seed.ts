import { PrismaClient } from '@prisma/client';
import { products, categories } from '../src/data/products';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.orderNote.deleteMany();
  await prisma.orderCoupon.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.shippingLocation.deleteMany();
  await prisma.shippingMethod.deleteMany();
  await prisma.shippingZone.deleteMany();
  await prisma.taxRate.deleteMany();
  await prisma.activityLog.deleteMany();

  // Create categories
  console.log('📁 Creating categories...');
  for (const cat of categories) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        count: 0,
      },
    });
  }

  // Create brands
  console.log('🏷️ Creating brands...');
  const brands = [
    { id: 'brand-1', name: '산리오코리아', slug: 'sanrio-korea' },
    { id: 'brand-2', name: '레고코리아', slug: 'lego-korea' },
    { id: 'brand-3', name: '펌플렉스', slug: 'pumplex' },
    { id: 'brand-4', name: '스마트학습', slug: 'smart-learning' },
    { id: 'brand-5', name: '중외제약', slug: 'jungwoe' },
    { id: 'brand-6', name: '시디즈', slug: 'sidiz' },
  ];

  for (const brand of brands) {
    await prisma.brand.create({ data: brand });
  }

  // Create tags
  console.log('🏷️ Creating tags...');
  const tags = [
    { id: 'tag-1', name: '베스트', slug: 'best' },
    { id: 'tag-2', name: '신상품', slug: 'new' },
    { id: 'tag-3', name: '무료배송', slug: 'free-shipping' },
    { id: 'tag-4', name: '할인', slug: 'sale' },
    { id: 'tag-5', name: '인기', slug: 'popular' },
  ];

  for (const tag of tags) {
    await prisma.tag.create({ data: tag });
  }

  // Create products
  console.log('📦 Creating products...');
  for (const prod of products.slice(0, 20)) {
    const product = await prisma.product.create({
      data: {
        id: prod.id,
        name: prod.name,
        slug: prod.id,
        description: `${prod.name}에 대한 상세 설명입니다.`,
        shortDescription: prod.name.substring(0, 50),
        sku: `SKU-${prod.id}`,
        price: prod.price,
        regularPrice: prod.originalPrice || prod.price,
        salePrice: prod.originalPrice ? prod.price : null,
        onSale: !!prod.originalPrice,
        status: 'publish',
        featured: prod.isBest || false,
        manageStock: true,
        stockQuantity: Math.floor(Math.random() * 500) + 50,
        stockStatus: 'instock',
        averageRating: prod.rating || 4.5,
        ratingCount: prod.reviewCount || Math.floor(Math.random() * 1000) + 100,
        brandId: brands[Math.floor(Math.random() * brands.length)].id,
      },
    });

    // Add product image
    await prisma.productImage.create({
      data: {
        src: prod.image,
        alt: prod.name,
        position: 0,
        productId: product.id,
      },
    });

    // Add to category
    if (prod.categoryId) {
      await prisma.productCategory.create({
        data: {
          productId: product.id,
          categoryId: prod.categoryId,
        },
      });
    }

    // Add tags
    if (prod.isBest) {
      await prisma.productTag.create({
        data: { productId: product.id, tagId: 'tag-1' },
      });
    }
    if (prod.isNew) {
      await prisma.productTag.create({
        data: { productId: product.id, tagId: 'tag-2' },
      });
    }
    if (prod.isFreeShipping) {
      await prisma.productTag.create({
        data: { productId: product.id, tagId: 'tag-3' },
      });
    }
  }

  // Create customers
  console.log('👥 Creating customers...');
  const customers = [
    { id: 'cust-001', email: 'minji.kim@example.com', firstName: '민지', lastName: '김', username: 'minji_kim', isPayingCustomer: true, ordersCount: 23, totalSpent: 1250000 },
    { id: 'cust-002', email: 'junho.lee@example.com', firstName: '준호', lastName: '이', username: 'junho_lee', isPayingCustomer: true, ordersCount: 18, totalSpent: 890000 },
    { id: 'cust-003', email: 'seoyeon.park@example.com', firstName: '서연', lastName: '박', username: 'seoyeon_park', isPayingCustomer: true, ordersCount: 31, totalSpent: 2340000 },
  ];

  for (const customer of customers) {
    await prisma.customer.create({ data: customer });
  }

  // Create coupons
  console.log('🎫 Creating coupons...');
  await prisma.coupon.create({
    data: {
      id: 'coupon-001',
      code: 'WELCOME10',
      description: '신규 회원 10% 할인',
      discountType: 'percent',
      amount: 10,
      usageCount: 156,
      usageLimit: 500,
      minimumAmount: 30000,
      dateExpires: new Date('2025-12-31'),
    },
  });

  await prisma.coupon.create({
    data: {
      id: 'coupon-002',
      code: 'WINTER5000',
      description: '겨울 시즌 5,000원 할인',
      discountType: 'fixed_cart',
      amount: 5000,
      usageCount: 89,
      usageLimit: 200,
      minimumAmount: 50000,
      dateExpires: new Date('2025-02-28'),
    },
  });

  // Create admin users
  console.log('👤 Creating admin users...');
  const bcrypt = await import('bcryptjs');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const managerPassword = await bcrypt.hash('manager123', 12);
  const editorPassword = await bcrypt.hash('editor123', 12);

  // Super Admin
  await prisma.user.create({
    data: {
      id: 'user-admin',
      email: 'admin@hi-store.co.kr',
      username: 'admin',
      passwordHash: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      displayName: 'Super Admin',
      role: 'administrator',
      isActive: true,
    },
  });

  // Shop Manager
  await prisma.user.create({
    data: {
      id: 'user-manager',
      email: 'manager@hi-store.co.kr',
      username: 'manager',
      passwordHash: managerPassword,
      firstName: 'Shop',
      lastName: 'Manager',
      displayName: 'Shop Manager',
      role: 'shop_manager',
      isActive: true,
    },
  });

  // Editor
  await prisma.user.create({
    data: {
      id: 'user-editor',
      email: 'editor@hi-store.co.kr',
      username: 'editor',
      passwordHash: editorPassword,
      firstName: 'Content',
      lastName: 'Editor',
      displayName: 'Content Editor',
      role: 'editor',
      isActive: true,
    },
  });

  // Create shipping zones
  console.log('🚚 Creating shipping zones...');
  const urbanZone = await prisma.shippingZone.create({
    data: { 
      id: 'zone-1', 
      name: 'Việt Nam - Nội thành (HCM, Hà Nội)', 
      slug: 'vietnam-urban',
      type: 'vietnam_urban',
      description: 'Giao hàng nội thành TP.HCM và Hà Nội',
      priority: 0 
    },
  });

  await prisma.shippingLocation.create({
    data: { zoneId: urbanZone.id, code: 'HCM', type: 'city', name: 'TP. Hồ Chí Minh', nameEn: 'Ho Chi Minh City' },
  });

  await prisma.shippingLocation.create({
    data: { zoneId: urbanZone.id, code: 'HN', type: 'city', name: 'Hà Nội', nameEn: 'Hanoi' },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: urbanZone.id,
      name: 'Giao hàng tiêu chuẩn',
      nameEn: 'Standard Shipping',
      nameKo: '표준 배송',
      type: 'flat_rate',
      isActive: true,
      position: 0,
      cost: 25000,
      minAmount: 500000,
      estimatedDays: '1-2',
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: urbanZone.id,
      name: 'Giao hàng nhanh',
      nameEn: 'Express Shipping',
      nameKo: '빠른 배송',
      type: 'express',
      isActive: true,
      position: 1,
      cost: 45000,
      estimatedDays: 'Trong ngày',
    },
  });

  const provinceZone = await prisma.shippingZone.create({
    data: { 
      id: 'zone-2', 
      name: 'Việt Nam - Tỉnh lẻ', 
      slug: 'vietnam-province',
      type: 'vietnam_province',
      description: 'Giao hàng các tỉnh thành khác',
      priority: 1 
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: provinceZone.id,
      name: 'Giao hàng tiêu chuẩn',
      nameEn: 'Standard Shipping',
      nameKo: '표준 배송',
      type: 'flat_rate',
      isActive: true,
      position: 0,
      cost: 35000,
      minAmount: 800000,
      estimatedDays: '2-4',
    },
  });

  const asiaZone = await prisma.shippingZone.create({
    data: { 
      id: 'zone-3', 
      name: 'Quốc tế - Châu Á', 
      slug: 'international-asia',
      type: 'international',
      description: 'Giao hàng các nước châu Á',
      priority: 2 
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: asiaZone.id,
      name: 'Giao hàng quốc tế',
      nameEn: 'International Shipping',
      nameKo: '국제 배송',
      type: 'flat_rate',
      isActive: true,
      position: 0,
      cost: 150000,
      estimatedDays: '5-7',
    },
  });

  const globalZone = await prisma.shippingZone.create({
    data: { 
      id: 'zone-4', 
      name: 'Quốc tế - Toàn cầu', 
      slug: 'international-global',
      type: 'global',
      description: 'Giao hàng tất cả các nước khác',
      priority: 3 
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: globalZone.id,
      name: 'Giao hàng quốc tế',
      nameEn: 'International Shipping',
      nameKo: '국제 배송',
      type: 'flat_rate',
      isActive: true,
      position: 0,
      cost: 250000,
      estimatedDays: '7-14',
    },
  });

  // Create currencies
  console.log('💱 Creating currencies...');
  await prisma.currency.createMany({
    data: [
      { code: 'VND', name: 'Việt Nam Đồng', symbol: '₫', symbolPosition: 'after', exchangeRate: 1, decimalPlaces: 0, thousandSep: '.', decimalSep: ',', isBase: true, isActive: true, position: 0 },
      { code: 'USD', name: 'US Dollar', symbol: '$', symbolPosition: 'before', exchangeRate: 25400, decimalPlaces: 2, thousandSep: ',', decimalSep: '.', isBase: false, isActive: true, position: 1 },
      { code: 'KRW', name: 'Korean Won', symbol: '₩', symbolPosition: 'before', exchangeRate: 18.5, decimalPlaces: 0, thousandSep: ',', decimalSep: '.', isBase: false, isActive: true, position: 2 },
      { code: 'EUR', name: 'Euro', symbol: '€', symbolPosition: 'before', exchangeRate: 27500, decimalPlaces: 2, thousandSep: '.', decimalSep: ',', isBase: false, isActive: true, position: 3 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', symbolPosition: 'before', exchangeRate: 168, decimalPlaces: 0, thousandSep: ',', decimalSep: '.', isBase: false, isActive: true, position: 4 },
    ],
  });

  // Create tax rates
  console.log('💰 Creating tax rates...');
  await prisma.taxRate.create({
    data: {
      id: 'tax-1',
      country: 'VN',
      state: '*',
      postcode: '*',
      city: '*',
      rate: 10,
      name: 'VAT',
      priority: 1,
      compound: false,
      shipping: true,
      order: 1,
      taxClass: 'standard',
    },
  });

  // Create settings
  console.log('⚙️ Creating settings...');
  const settings = [
    { key: 'store_name', value: 'Gamigear', group: 'general' },
    { key: 'store_description', value: '아이들을 위한 특별한 쇼핑몰', group: 'general' },
    { key: 'currency', value: 'KRW', group: 'currency' },
    { key: 'currency_symbol', value: '₩', group: 'currency' },
    { key: 'tax_enabled', value: 'true', group: 'tax' },
    { key: 'free_shipping_threshold', value: '50000', group: 'shipping' },
  ];

  for (const setting of settings) {
    await prisma.setting.create({ data: setting });
  }

  // Update category counts
  console.log('📊 Updating category counts...');
  for (const cat of categories) {
    const count = await prisma.productCategory.count({
      where: { categoryId: cat.id },
    });
    await prisma.category.update({
      where: { id: cat.id },
      data: { count },
    });
  }

  // Create banners
  console.log('🖼️ Creating banners...');
  await prisma.banner.deleteMany();
  const banners = [
    {
      title: '겨울 시즌 세일',
      subtitle: '최대 50% 할인',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1280&h=520&fit=crop&q=80',
      link: '/category/sale',
      position: 0,
      isActive: true,
    },
    {
      title: '신상품 입고',
      subtitle: '새로운 상품들을 확인해보세요',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1280&h=520&fit=crop&q=80',
      link: '/category/new',
      position: 1,
      isActive: true,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }

  // Create promotions
  console.log('🎉 Creating promotions...');
  await prisma.promotion.deleteMany();
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const promotions = [
    {
      title: '겨울 특가',
      description: '따뜻한 겨울 아이템 특가',
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=300&fit=crop&q=80',
      link: '/category/winter',
      startDate: now,
      endDate: nextMonth,
      position: 0,
      isActive: true,
    },
    {
      title: '베스트셀러',
      description: '가장 인기있는 상품',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80',
      link: '/category/best',
      startDate: now,
      endDate: nextMonth,
      position: 1,
      isActive: true,
    },
    {
      title: '신규 회원 혜택',
      description: '첫 구매 3,000원 할인',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop&q=80',
      link: '/coupons',
      startDate: now,
      endDate: nextMonth,
      position: 2,
      isActive: true,
    },
    {
      title: '무료배송',
      description: '5만원 이상 무료배송',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop&q=80',
      link: '/shipping',
      startDate: now,
      endDate: nextMonth,
      position: 3,
      isActive: true,
    },
  ];

  for (const promo of promotions) {
    await prisma.promotion.create({ data: promo });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
