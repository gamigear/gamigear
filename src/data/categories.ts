import { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "좋은책방",
    slug: "books",
    icon: "BookOpen",
    description: "아이들을 위한 좋은 책",
    isActive: true,
    sortOrder: 1,
    productCount: 150,
  },
  {
    id: "cat-2",
    name: "체험티켓",
    slug: "tickets",
    icon: "Ticket",
    description: "특별한 경험을 선물하세요",
    isActive: true,
    sortOrder: 2,
    productCount: 85,
  },
  {
    id: "cat-3",
    name: "학습교구",
    slug: "edu",
    icon: "GraduationCap",
    description: "재미있는 학습 교구",
    isActive: true,
    sortOrder: 3,
    productCount: 120,
  },
  {
    id: "cat-4",
    name: "문구/완구",
    slug: "stationery",
    icon: "Pencil",
    description: "학교생활 필수품",
    isActive: true,
    sortOrder: 4,
    productCount: 200,
  },
  {
    id: "cat-5",
    name: "생활용품",
    slug: "living",
    icon: "Home",
    description: "생활에 필요한 용품",
    isActive: true,
    sortOrder: 5,
    productCount: 95,
  },
  {
    id: "cat-6",
    name: "건강/식품",
    slug: "health",
    icon: "Heart",
    description: "건강한 성장을 위한 제품",
    isActive: true,
    sortOrder: 6,
    productCount: 75,
  },
  {
    id: "cat-7",
    name: "패션/잡화",
    slug: "fashion",
    icon: "Shirt",
    description: "아동 패션 아이템",
    isActive: true,
    sortOrder: 7,
    productCount: 180,
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find((cat) => cat.slug === slug);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((cat) => cat.id === id);
};
