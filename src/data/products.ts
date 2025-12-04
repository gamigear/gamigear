import { Product, Banner, Review, Promotion } from "@/types";

// Re-export categories from separate file
export { categories, getCategoryBySlug, getCategoryById } from "./categories";

export const products: Product[] = [
  // 베스트 상품들
  {
    id: "prod-001",
    name: "♥단독최저가♥[산리오] 캐릭터즈 손난로 보조배터리 4종",
    price: 19900,
    originalPrice: 29900,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/10/292004be34-03c3-4250-8116-7a6d6108bde8_10.png",
    category: "living",
    categoryId: "cat-5",
    brand: "아이스크림미디어",
    isBest: true,
    rank: 1,
    rating: 4.9,
    reviewCount: 1250,
    badges: ["best"],
    createdAt: "2025-10-29",
  },
  {
    id: "prod-002",
    name: "[경기] 과천 서울랜드 파크이용권(~26년 3월)",
    price: 25000,
    originalPrice: 38000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/11/14a34358b5-5ece-46ee-8a27-a490024c2b2d_10.png",
    category: "tickets",
    categoryId: "cat-2",
    brand: "주식회사 스마트인피니",
    isNew: true,
    isToday: true,
    rank: 2,
    rating: 4.8,
    reviewCount: 890,
    badges: ["new", "today"],
    createdAt: "2025-11-14",
  },
  {
    id: "prod-003",
    name: "★단독초특가★[제니튼] 닥터제니 1450 어린이 고불소치약 럭키박스(딸기향)",
    price: 34900,
    originalPrice: 49900,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/10/304dd64a89-5e58-4996-bfb7-72625ad763a5_10.jpg",
    category: "health",
    categoryId: "cat-6",
    brand: "아이스크림미디어",
    isBest: true,
    isFreeShipping: true,
    rank: 3,
    rating: 4.9,
    reviewCount: 2100,
    badges: ["best", "free-shipping"],
    createdAt: "2025-10-30",
  },
  {
    id: "prod-004",
    name: "♥단독최저가♥[잔망루피] 캐릭터즈 손난로 보조배터리_잔망루피",
    price: 17900,
    originalPrice: 25900,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/10/29cc85640a-a865-463d-a5e0-eba19d1ac68a_10.png",
    category: "living",
    categoryId: "cat-5",
    brand: "아이스크림미디어",
    isBest: true,
    rank: 4,
    rating: 4.8,
    reviewCount: 980,
    badges: ["best"],
    createdAt: "2025-10-29",
  },
  {
    id: "prod-005",
    name: "★단독 최저가 할인★[서울 중구] 점프 JUMP 코믹 마샬아츠 퍼포먼스",
    price: 35000,
    originalPrice: 50000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/11/146e07fc1a-5ae8-4f48-a7ea-220daa45e249_10.jpeg",
    category: "tickets",
    categoryId: "cat-2",
    brand: "주식회사 에이씨피",
    isNew: true,
    rank: 5,
    rating: 4.7,
    reviewCount: 456,
    badges: ["new"],
    createdAt: "2025-11-14",
  },
  {
    id: "prod-006",
    name: "스마일 미니 대용량 핫팩 20개/40개 모음전",
    price: 9900,
    originalPrice: 15900,
    image: "https://cdn.i-screammall.co.kr/files/data/sigong/images/goods/2150/2024/11/_tmp_d41d8cd98f00b204e9800998ecf8427e3619large.jpg",
    category: "living",
    categoryId: "cat-5",
    brand: "주식회사 더좋은친구들",
    isBest: true,
    isFreeShipping: true,
    rank: 6,
    rating: 4.6,
    reviewCount: 3200,
    badges: ["best", "free-shipping"],
    createdAt: "2024-11-15",
  },
  {
    id: "prod-007",
    name: "★온라인최저가★[펌플렉스] 바른자세 독서쿠션 독서대 탭거치대 아이패드거치대 레벨업쿠션130",
    price: 89000,
    originalPrice: 129000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/06/0212d66c5c-8eaf-4cc5-9e65-103db48317ce_10.jpg",
    category: "edu",
    categoryId: "cat-3",
    brand: "펌플렉스 주식회사",
    isBest: true,
    isFreeShipping: true,
    rank: 7,
    rating: 4.8,
    reviewCount: 1560,
    badges: ["best", "free-shipping"],
    createdAt: "2025-06-02",
  },
  {
    id: "prod-008",
    name: "★온라인최저가★ [비움] 에코브리즈 KF 94 마스크 100매 중형/대형 (장당 180원대)",
    price: 18900,
    originalPrice: 29900,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/03/2458863b99-17a1-4bd8-9bc7-226f81b254e7_10.jpg",
    category: "health",
    categoryId: "cat-6",
    brand: "아이스크림미디어",
    isSpecial: true,
    isBest: true,
    isFreeShipping: true,
    rank: 8,
    rating: 4.9,
    reviewCount: 5600,
    badges: ["special", "best", "free-shipping"],
    createdAt: "2025-03-24",
  },
  {
    id: "prod-009",
    name: "[중외제약] 아이키드림 골드 60정",
    price: 49000,
    originalPrice: 69000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/08/21dfd890c1-8709-4c8a-bf02-47768c88e9cb_10.jpg",
    category: "health",
    categoryId: "cat-6",
    brand: "주식회사 혜인건강",
    isSpecial: true,
    isBest: true,
    isFreeShipping: true,
    rank: 9,
    rating: 4.7,
    reviewCount: 890,
    badges: ["special", "best", "free-shipping"],
    createdAt: "2025-08-21",
  },
  {
    id: "prod-010",
    name: "★임박특가★ [아토몽드] 1+1 카밍 키즈 로션 (유통기한: 26년 3월 19일)",
    price: 15900,
    originalPrice: 35900,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/11/13b635f8b5-ebb1-4d22-9fe8-d4fee730437b_10.jpg",
    category: "health",
    categoryId: "cat-6",
    brand: "더코스코리아",
    isNew: true,
    isFreeShipping: true,
    rank: 10,
    rating: 4.6,
    reviewCount: 320,
    badges: ["new", "free-shipping"],
    createdAt: "2025-11-13",
  },
  {
    id: "prod-011",
    name: "★11~12월 특별 할인★ [함께늘봄] 창의 기억법 적용 국립중앙박물관 4회차",
    price: 120000,
    originalPrice: 160000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/04/027156272a-a208-4b58-852a-3cd70df7e97f_10.jpg",
    category: "tickets",
    categoryId: "cat-2",
    brand: "함께늘봄",
    isBest: true,
    rank: 11,
    rating: 4.9,
    reviewCount: 234,
    badges: ["best"],
    createdAt: "2025-04-02",
  },
  {
    id: "prod-012",
    name: "[시디즈] RINGO 링고 2세대 초등학생 어린이의자 (발받침 포함) S51ACF0VG",
    price: 299000,
    originalPrice: 399000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/11/137cd8c66b-eec7-4560-845e-5c2a585ab24d_10.jpg",
    category: "living",
    categoryId: "cat-5",
    brand: "두이커머스(주)",
    isNew: true,
    isFreeShipping: true,
    rank: 12,
    rating: 4.8,
    reviewCount: 567,
    badges: ["new", "free-shipping"],
    createdAt: "2025-11-13",
  },
  // 좋은책방 - Books
  {
    id: "prod-101",
    name: "초등 필수 영단어 무작정 따라하기",
    price: 15300,
    originalPrice: 17000,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    category: "books",
    categoryId: "cat-1",
    brand: "길벗스쿨",
    isNew: true,
    rating: 4.8,
    reviewCount: 127,
    badges: ["new"],
    createdAt: "2025-11-01",
  },
  {
    id: "prod-102",
    name: "어린이 과학동아 정기구독 (12개월)",
    price: 198000,
    originalPrice: 220000,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    category: "books",
    categoryId: "cat-1",
    brand: "동아사이언스",
    isBest: true,
    rating: 4.9,
    reviewCount: 890,
    badges: ["best"],
    createdAt: "2025-10-15",
  },
  {
    id: "prod-103",
    name: "흔한남매 15권 세트",
    price: 135000,
    originalPrice: 150000,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    category: "books",
    categoryId: "cat-1",
    brand: "미래엔아이세움",
    isBest: true,
    isFreeShipping: true,
    rating: 4.9,
    reviewCount: 2340,
    badges: ["best", "free-shipping"],
    createdAt: "2025-09-20",
  },
  {
    id: "prod-104",
    name: "마법천자문 50권 세트",
    price: 450000,
    originalPrice: 550000,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    category: "books",
    categoryId: "cat-1",
    brand: "아울북",
    isFreeShipping: true,
    rating: 4.8,
    reviewCount: 1560,
    badges: ["free-shipping"],
    createdAt: "2025-08-10",
  },

  // 체험티켓 - Tickets
  {
    id: "prod-201",
    name: "[경기 부천] 웅진플레이도시 워터파크",
    price: 29000,
    originalPrice: 42000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/05/138f5bda97-aa1b-4985-867a-1ee5b10aace0_10.jpg",
    category: "tickets",
    categoryId: "cat-2",
    brand: "위더스컴즈 ㈜",
    isBest: true,
    rating: 4.7,
    reviewCount: 1890,
    badges: ["best"],
    createdAt: "2025-05-13",
  },
  {
    id: "prod-202",
    name: "[경기 고양] 일산 아쿠아플라넷(~60일)",
    price: 22000,
    originalPrice: 29000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/06/196817059f-a2de-4acb-9af7-051f327f01ee_10.jpg",
    category: "tickets",
    categoryId: "cat-2",
    brand: "위더스컴즈 ㈜",
    isBest: true,
    rating: 4.8,
    reviewCount: 2340,
    badges: ["best"],
    createdAt: "2025-06-19",
  },
  {
    id: "prod-203",
    name: "[경기 이천] 테르메덴 미들시즌 (25.09.01~11.30)",
    price: 35000,
    originalPrice: 48000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/09/2986d62a6c-2528-49a7-b107-f2577466fa7c_10.jpg",
    category: "tickets",
    categoryId: "cat-2",
    brand: "주식회사 엠에어쿠폰",
    isBest: true,
    isToday: true,
    rating: 4.6,
    reviewCount: 890,
    badges: ["best", "today"],
    createdAt: "2025-09-29",
  },

  // 패션/잡화 - Fashion
  {
    id: "prod-301",
    name: "[크록스] 클래식 라인드 클로그 주니어 아동 털샌들 207010-060",
    price: 54900,
    originalPrice: 74900,
    image: "https://cdn.i-screammall.co.kr/files/data/sigong/images/goods/1578/2023/09/1038825_tmp_d41d8cd98f00b204e9800998ecf8427e3340large.jpg",
    category: "fashion",
    categoryId: "cat-7",
    brand: "티앤씨아이엔티 주식회사",
    isBest: true,
    isFreeShipping: true,
    rating: 4.8,
    reviewCount: 3450,
    badges: ["best", "free-shipping"],
    createdAt: "2023-09-15",
  },
  {
    id: "prod-302",
    name: "[예일키즈] 예일 BULLDOGS 빅로고 셋업 YJCCSUE13222",
    price: 69000,
    originalPrice: 89000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/10/20dbed5767-a513-49d9-845c-564ddd0c2da6_10.jpg",
    category: "fashion",
    categoryId: "cat-7",
    brand: "주식회사 에스원트레이딩",
    isNew: true,
    isFreeShipping: true,
    rating: 4.7,
    reviewCount: 234,
    badges: ["new", "free-shipping"],
    createdAt: "2025-10-20",
  },
  {
    id: "prod-303",
    name: "[하버드키즈] 헤리티지 카라 플리스 셋업 HJCCSUE44258",
    price: 79000,
    originalPrice: 99000,
    image: "https://cdn.i-screammall.co.kr/files/goods/2025/10/21a3511f73-4c21-418f-9b54-3a787799c367_10.jpg",
    category: "fashion",
    categoryId: "cat-7",
    brand: "주식회사 에스원트레이딩",
    isNew: true,
    isFreeShipping: true,
    rating: 4.8,
    reviewCount: 189,
    badges: ["new", "free-shipping"],
    createdAt: "2025-10-21",
  },
  {
    id: "prod-304",
    name: "[페이퍼플레인키즈] 아동 털실내화 PK3316",
    price: 19900,
    originalPrice: 29900,
    image: "https://cdn.i-screammall.co.kr/files/data/sigong/images/goods/2056/2024/10/_tmp_d41d8cd98f00b204e9800998ecf8427e5166large.jpg",
    category: "fashion",
    categoryId: "cat-7",
    brand: "주식회사 페이퍼플레인키즈",
    isBest: true,
    isFreeShipping: true,
    rating: 4.6,
    reviewCount: 1230,
    badges: ["best", "free-shipping"],
    createdAt: "2024-10-15",
  },
];


// 기획전 데이터
export const promotions: Promotion[] = [
  {
    id: "promo-001",
    title: "겨울필수템! 인기 전기포트 기획전",
    image: "https://cdn.i-screammall.co.kr/files/display/2025/10/305ce58a1a-fef6-4a73-a9fc-8dcddc461402.jpg",
    startDate: "2025-10-31",
    endDate: "2025-12-01",
    link: "/display/plan/10376",
    isActive: true,
  },
  {
    id: "promo-002",
    title: "공부의 시작은 체력! 면역력&집중력 기르기",
    image: "https://cdn.i-screammall.co.kr/files/display/2025/11/2072222a4d-560f-4960-8424-a4947d86731a.jpg",
    startDate: "2025-11-20",
    endDate: "2025-12-31",
    link: "/display/plan/11106",
    isActive: true,
  },
  {
    id: "promo-003",
    title: "교실 밖에서 만나는 체험 학습! 체험/티켓 특가",
    image: "https://cdn.i-screammall.co.kr/files/display/2025/09/304519a76e-5008-4739-ba36-f330f3b22601.jpg",
    startDate: "2025-06-30",
    endDate: "2026-06-30",
    link: "/display/plan/6756",
    isActive: true,
  },
  {
    id: "promo-004",
    title: "☃️예일키즈 겨울 신상 오픈 기념 특가",
    image: "https://cdn.i-screammall.co.kr/files/display/2025/10/31b4491b30-2744-4f37-8113-dfbb7475d0f5.jpg",
    startDate: "2025-10-31",
    endDate: "2025-11-30",
    link: "/display/plan/8676",
    isActive: true,
  },
];

// 배너 데이터
export const banners: Banner[] = [
  {
    id: "banner-001",
    title: "💣 단 3일! 블프 한정 파격가 2개월분 49,000원 바로 구매!",
    subtitle: "🔥 블프 특가 터졌다! 이건 놓치면 진짜 후회! 🔥",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1280&h=520&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=750&h=812&fit=crop&q=80",
    link: "/goods/detail/10867495",
  },
  {
    id: "banner-002",
    title: "이번 주말에는 어디로?🍂체험학습 베스트 초특가🍂",
    subtitle: "찐 후기가 증명하는 추천 체험/티켓",
    image: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=1280&h=520&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=750&h=812&fit=crop&q=80",
    link: "/category/tickets",
  },
  {
    id: "banner-003",
    title: "[제니튼] 단독 럭키박스🎉34,900원 역대급구성🎉",
    subtitle: "치약 6개+어린이 칫솔 4개+가글 1개+사은품치약 4개 증정",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1280&h=520&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=750&h=812&fit=crop&q=80",
    link: "/promotions/new-semester",
  },
  {
    id: "banner-004",
    title: "[비움] KF94 마스크100매 18,900원+무배",
    subtitle: "😷바이러스&미세먼지으로부터 우리 가족 지켜요!😷",
    image: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=1280&h=520&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=750&h=812&fit=crop&q=80",
    link: "/goods/detail/10068131",
  },
];

// 리뷰 데이터
export const reviews: Review[] = [
  {
    id: "review-001",
    productId: "prod-001",
    userId: "user-001",
    userName: "김**",
    rating: 5,
    content: "아이가 정말 좋아해요! 손난로 기능도 좋고 보조배터리로도 유용해요.",
    images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200"],
    createdAt: "2025-11-28",
  },
  {
    id: "review-002",
    productId: "prod-002",
    userId: "user-002",
    userName: "이**",
    rating: 5,
    content: "서울랜드 가족 나들이 다녀왔어요~ 아이들이 너무 좋아했습니다!",
    createdAt: "2025-11-25",
  },
  {
    id: "review-003",
    productId: "prod-003",
    userId: "user-003",
    userName: "박**",
    rating: 5,
    content: "치약 구성이 정말 알차요. 아이가 양치질을 좋아하게 됐어요!",
    images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200"],
    createdAt: "2025-11-20",
  },
];

// Helper functions
export const getBestProducts = (limit?: number): Product[] => {
  const bestProducts = products
    .filter((p) => p.isBest)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999));
  return limit ? bestProducts.slice(0, limit) : bestProducts;
};

export const getNewProducts = (limit?: number): Product[] => {
  const newProducts = products
    .filter((p) => p.isNew)
    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
  return limit ? newProducts.slice(0, limit) : newProducts;
};

export const getProductsByCategory = (categorySlug: string, limit?: number): Product[] => {
  const categoryProducts = products.filter((p) => p.category === categorySlug);
  return limit ? categoryProducts.slice(0, limit) : categoryProducts;
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getActivePromotions = (): Promotion[] => {
  const now = new Date();
  return promotions.filter((p) => {
    const endDate = new Date(p.endDate);
    return p.isActive && endDate >= now;
  });
};


// Additional products with local images
export const additionalProducts: Product[] = [
  // 학습교구 - Educational
  {
    id: "prod-401",
    name: "[펌플렉스] 바른자세 독서쿠션 레벨업쿠션130",
    price: 89000,
    originalPrice: 129000,
    image: "/extracted_site/cdn.i-screammall.co.kr/files/goods/2025/10/21268caa90-7838-4db7-96a2-0b2bac0c3ade_10.jpg",
    category: "edu",
    categoryId: "cat-3",
    brand: "펌플렉스",
    isBest: true,
    isFreeShipping: true,
    rating: 4.8,
    reviewCount: 1560,
    badges: ["best", "free-shipping"],
    createdAt: "2025-10-21",
  },
  {
    id: "prod-402",
    name: "[스마트학습] 초등 수학 교구 세트",
    price: 45000,
    originalPrice: 59000,
    image: "/extracted_site/cdn.i-screammall.co.kr/files/goods/2025/10/21b36ce34a-d59a-45d7-9db7-3550f66b1bfe_10.jpg",
    category: "edu",
    categoryId: "cat-3",
    brand: "스마트학습",
    isNew: true,
    rating: 4.7,
    reviewCount: 234,
    badges: ["new"],
    createdAt: "2025-10-21",
  },
  
  // 문구/완구 - Stationery/Toys
  {
    id: "prod-501",
    name: "[레고] 클래식 창작 박스 900피스",
    price: 45000,
    originalPrice: 55000,
    image: "/extracted_site/cdn.i-screammall.co.kr/files/goods/2025/10/22937c783e-7e11-4308-a4ca-58fbcacdd497_10.jpg",
    category: "stationery",
    categoryId: "cat-4",
    brand: "레고코리아",
    isBest: true,
    isFreeShipping: true,
    rating: 4.9,
    reviewCount: 567,
    badges: ["best", "free-shipping"],
    createdAt: "2025-10-22",
  },
  {
    id: "prod-502",
    name: "[캐릭터] 산리오 문구세트 (필통+연필+지우개)",
    price: 15000,
    originalPrice: 20000,
    image: "/extracted_site/cdn.i-screammall.co.kr/files/goods/2025/10/23078bc1a6-88e7-4458-9315-b77dc834f753_10.jpg",
    category: "stationery",
    categoryId: "cat-4",
    brand: "산리오코리아",
    isNew: true,
    rating: 4.5,
    reviewCount: 678,
    badges: ["new"],
    createdAt: "2025-10-23",
  },
  
  // 건강/식품 - Health/Food
  {
    id: "prod-601",
    name: "[중외제약] 아이키드림 골드 60정",
    price: 49000,
    originalPrice: 69000,
    image: "/extracted_site/cdn.i-screammall.co.kr/files/goods/2025/11/04356c0b33-fd40-4fad-9624-efd0b97b5409_10.jpg",
    category: "health",
    categoryId: "cat-6",
    brand: "중외제약",
    isBest: true,
    isFreeShipping: true,
    rating: 4.7,
    reviewCount: 890,
    badges: ["best", "free-shipping"],
    createdAt: "2025-11-04",
  },
  {
    id: "prod-602",
    name: "[유기농] 어린이 간식 세트 10종",
    price: 32000,
    originalPrice: 40000,
    image: "/extracted_site/cdn.i-screammall.co.kr/files/goods/2025/11/0469cec70b-0013-488d-9ddc-e8713dc4a3b3_10.jpg",
    category: "health",
    categoryId: "cat-6",
    brand: "유기농마켓",
    isNew: true,
    rating: 4.9,
    reviewCount: 445,
    badges: ["new"],
    createdAt: "2025-11-04",
  },
  
  // 생활용품 - Living
  {
    id: "prod-701",
    name: "[시디즈] RINGO 링고 2세대 어린이의자",
    price: 299000,
    originalPrice: 399000,
    image: "/extracted_site/cdn.i-screammall.co.kr/files/goods/2025/11/137cd8c66b-eec7-4560-845e-5c2a585ab24d_10.jpg",
    category: "living",
    categoryId: "cat-5",
    brand: "시디즈",
    isNew: true,
    isFreeShipping: true,
    rating: 4.8,
    reviewCount: 567,
    badges: ["new", "free-shipping"],
    createdAt: "2025-11-13",
  },
  {
    id: "prod-702",
    name: "[스마일] 미니 대용량 핫팩 40개",
    price: 9900,
    originalPrice: 15900,
    image: "/extracted_site/cdn.i-screammall.co.kr/files/goods/2025/11/171a19903d-7154-47b1-9991-53e7787b9a56_10.jpg",
    category: "living",
    categoryId: "cat-5",
    brand: "스마일",
    isBest: true,
    isFreeShipping: true,
    rating: 4.6,
    reviewCount: 3200,
    badges: ["best", "free-shipping"],
    createdAt: "2025-11-17",
  },
];

// Merge all products
export const allProducts = [...products, ...additionalProducts];

// Get all products
export const getAllProducts = (): Product[] => allProducts;

// Get products count by category
export const getProductCountByCategory = (categorySlug: string): number => {
  return allProducts.filter(p => p.category === categorySlug).length;
};

// Search products
export const searchProducts = (query: string, limit?: number): Product[] => {
  const lowerQuery = query.toLowerCase();
  const results = allProducts.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.brand?.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
  return limit ? results.slice(0, limit) : results;
};

// Get featured products
export const getFeaturedProducts = (limit?: number): Product[] => {
  const featured = allProducts.filter(p => p.isBest || p.isNew);
  return limit ? featured.slice(0, limit) : featured;
};

// Get products by price range
export const getProductsByPriceRange = (min: number, max: number): Product[] => {
  return allProducts.filter(p => p.price >= min && p.price <= max);
};

// Get top rated products
export const getTopRatedProducts = (limit?: number): Product[] => {
  const sorted = [...allProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return limit ? sorted.slice(0, limit) : sorted;
};
