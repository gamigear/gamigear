// Admin Dashboard Data
import { products } from './products';

export interface AdminProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  sales: number;
  rating: number;
  status: 'published' | 'draft' | 'scheduled';
  date: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  purchases: number;
  totalSpent: number;
  lastOrder: string;
  status: 'active' | 'inactive';
}

export interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: 'completed' | 'processing' | 'pending';
  date: string;
}

// Convert products to admin format
export const adminProducts: AdminProduct[] = products.slice(0, 20).map((p, index) => ({
  id: p.id,
  name: p.name,
  image: p.image,
  price: p.price,
  sales: Math.floor(Math.random() * 500) + 50,
  rating: p.rating || 4.5,
  status: index < 15 ? 'published' : index < 18 ? 'draft' : 'scheduled',
  date: p.createdAt || '2025-11-01',
}));

export const adminCustomers: AdminCustomer[] = [
  {
    id: 'cust-001',
    name: '김민지',
    email: 'minji.kim@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    purchases: 23,
    totalSpent: 1250000,
    lastOrder: '2025-11-30',
    status: 'active',
  },
  {
    id: 'cust-002',
    name: '이준호',
    email: 'junho.lee@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    purchases: 18,
    totalSpent: 890000,
    lastOrder: '2025-11-28',
    status: 'active',
  },
  {
    id: 'cust-003',
    name: '박서연',
    email: 'seoyeon.park@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    purchases: 31,
    totalSpent: 2340000,
    lastOrder: '2025-11-29',
    status: 'active',
  },
  {
    id: 'cust-004',
    name: '최현우',
    email: 'hyunwoo.choi@example.com',
    avatar: 'https://i.pravatar.cc/150?img=4',
    purchases: 12,
    totalSpent: 567000,
    lastOrder: '2025-11-25',
    status: 'active',
  },
  {
    id: 'cust-005',
    name: '정수아',
    email: 'sua.jung@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    purchases: 45,
    totalSpent: 3890000,
    lastOrder: '2025-11-30',
    status: 'active',
  },
  {
    id: 'cust-006',
    name: '강도윤',
    email: 'doyun.kang@example.com',
    avatar: 'https://i.pravatar.cc/150?img=6',
    purchases: 8,
    totalSpent: 234000,
    lastOrder: '2025-11-15',
    status: 'inactive',
  },
  {
    id: 'cust-007',
    name: '윤지우',
    email: 'jiwoo.yoon@example.com',
    avatar: 'https://i.pravatar.cc/150?img=7',
    purchases: 27,
    totalSpent: 1560000,
    lastOrder: '2025-11-27',
    status: 'active',
  },
  {
    id: 'cust-008',
    name: '임하은',
    email: 'haeun.lim@example.com',
    avatar: 'https://i.pravatar.cc/150?img=8',
    purchases: 15,
    totalSpent: 780000,
    lastOrder: '2025-11-22',
    status: 'active',
  },
];

export const recentOrders: RecentOrder[] = [
  { id: '#ORD-2025113001', customer: '김민지', amount: 89000, status: 'completed', date: '2025-11-30' },
  { id: '#ORD-2025113002', customer: '이준호', amount: 156000, status: 'processing', date: '2025-11-30' },
  { id: '#ORD-2025112901', customer: '박서연', amount: 234500, status: 'completed', date: '2025-11-29' },
  { id: '#ORD-2025112902', customer: '최현우', amount: 45000, status: 'pending', date: '2025-11-29' },
  { id: '#ORD-2025112801', customer: '정수아', amount: 178000, status: 'completed', date: '2025-11-28' },
];

export const dashboardStats = {
  totalRevenue: 15680000,
  totalOrders: 342,
  totalCustomers: 1256,
  conversionRate: 3.2,
  pendingOrders: 12,
  processingOrders: 28,
};


export interface RefundRequest {
  id: string;
  customer: string;
  product: string;
  amount: number;
  reason: string;
  date: string;
  status?: 'approved' | 'rejected';
}

export const refundRequests: RefundRequest[] = [
  { id: 'REF-001', customer: '김민지', product: '산리오 캐릭터즈 손난로', amount: 19900, reason: '상품 불량', date: '2025-11-30' },
  { id: 'REF-002', customer: '이준호', product: '어린이 동화책 세트', amount: 45000, reason: '단순 변심', date: '2025-11-29' },
];
