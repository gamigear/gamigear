"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, ExternalLink, Star, Package, TrendingUp, Loader2 } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  onSale: boolean;
  status: string;
  featured: boolean;
  categories: { id: string; name: string; slug: string }[];
  stockQuantity: number;
  stockStatus: string;
  averageRating: number;
  ratingCount: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: string;
  rating: number;
  content: string;
  authorName: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}&limit=3`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
        <Link href="/admin/products" className="text-blue-600 hover:underline mt-2 inline-block">
          상품 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // Stats (mock for now - could be fetched from analytics API)
  const stats = {
    totalSales: 156,
    revenue: product.price * 156,
    views: 12500,
    conversionRate: 1.25,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">상품 상세</h1>
            <p className="text-sm text-gray-500">ID: {productId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/goods/detail/${product?.slug || productId}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <ExternalLink size={16} />
            스토어에서 보기
          </Link>
          <Link
            href={`/admin/products/${productId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Edit size={16} />
            수정
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="총 판매량"
          value={stats.totalSales.toString()}
          change={12.5}
          icon={<Package size={24} className="text-blue-600" />}
        />
        <StatCard
          title="매출"
          value={formatPrice(stats.revenue)}
          change={8.2}
          icon={<TrendingUp size={24} className="text-green-600" />}
        />
        <StatCard
          title="페이지 조회수"
          value={stats.views.toLocaleString()}
          change={15.3}
          icon={<ExternalLink size={24} className="text-purple-600" />}
        />
        <StatCard
          title="전환율"
          value={`${stats.conversionRate}%`}
          change={-2.1}
          icon={<TrendingUp size={24} className="text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex gap-6">
                {/* Images */}
                <div className="w-1/3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  {product.images && product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.map((img, i) => (
                        <div key={i} className="aspect-square rounded overflow-hidden bg-gray-100">
                          <Image src={img} alt="" width={60} height={60} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === "publish" || product.status === "published" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {product.status === "publish" || product.status === "published" ? "발행됨" : "임시저장"}
                    </span>
                    {product.featured && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">추천</span>
                    )}
                    {product.onSale && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">할인중</span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                  <p className="text-gray-500 text-sm mb-4">{product.shortDescription || '-'}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{product.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-500">{product.ratingCount || 0} 리뷰</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold">{formatPrice(product.salePrice || product.price)}</span>
                    {product.onSale && product.regularPrice && (
                      <span className="text-gray-400 line-through">{formatPrice(product.regularPrice)}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">SKU:</span>
                      <span className="ml-2 font-medium">{product.sku || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">재고:</span>
                      <span className="ml-2 font-medium">{product.stockQuantity ?? '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">카테고리:</span>
                      <span className="ml-2 font-medium">
                        {product.categories?.map(c => c.name).join(", ") || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">재고 상태:</span>
                      <span className={`ml-2 font-medium ${
                        product.stockStatus === "instock" ? "text-green-600" : "text-red-600"
                      }`}>
                        {product.stockStatus === "instock" ? "재고 있음" : "품절"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card title="상품 설명">
            <div className="p-6">
              <p className="text-gray-600 whitespace-pre-wrap">{product.description || '설명이 없습니다.'}</p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Reviews */}
          <Card
            title="최근 리뷰"
            headerAction={
              <Link href={`/admin/reviews?productId=${productId}`} className="text-sm text-blue-600 hover:underline">
                전체 보기
              </Link>
            }
          >
            <div className="p-4 space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{review.authorName}</span>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1 line-clamp-2">{review.content}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">리뷰가 없습니다.</p>
              )}
            </div>
          </Card>

          {/* Activity */}
          <Card title="활동">
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">생성일</span>
                <span>{new Date(product.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">최종 수정</span>
                <span>{new Date(product.updatedAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
