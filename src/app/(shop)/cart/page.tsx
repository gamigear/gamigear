"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, X, ShoppingCart, ChevronLeft, Tag, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Price, { usePrice } from "@/components/Price";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    shipping,
    discount,
    total,
    couponCode,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [selectedIds, setSelectedIds] = useState<string[]>(items.map((item) => item.id));
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const removeSelected = () => {
    selectedIds.forEach((id) => removeItem(id));
    setSelectedIds([]);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setApplyingCoupon(true);
    setCouponError("");
    
    const success = await applyCoupon(couponInput.trim());
    
    if (success) {
      setCouponInput("");
    } else {
      setCouponError("Mã giảm giá không hợp lệ");
    }
    
    setApplyingCoupon(false);
  };

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn sản phẩm để thanh toán");
      return;
    }
    // Store selected items for checkout
    sessionStorage.setItem("checkoutItems", JSON.stringify(selectedIds));
    router.push("/checkout");
  };

  const selectedSubtotal = items
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0);

  const selectedShipping = selectedSubtotal >= 50000 ? 0 : 3000;
  const selectedTotal = Math.max(0, selectedSubtotal + selectedShipping - discount);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingCart size={64} className="text-gray-200 mb-4" />
        <h2 className="text-lg font-bold mb-2">Giỏ hàng trống</h2>
        <p className="text-sm text-gray-500 mb-6">Hãy thêm sản phẩm yêu thích vào giỏ hàng</p>
        <Link
          href="/"
          className="px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-40 pc:pb-10">
      {/* Mobile Header */}
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">Giỏ hàng</h1>
          <button onClick={clearCart} className="p-1 text-gray-500">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-6">
        <div className="hidden pc:flex pc:items-center pc:justify-between pc:mb-6">
          <h1 className="text-2xl font-bold">Giỏ hàng ({items.length})</h1>
          <button
            onClick={clearCart}
            className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
          >
            <Trash2 size={16} />
            Xóa tất cả
          </button>
        </div>

        <div className="pc:grid pc:grid-cols-3 pc:gap-8">
          {/* Cart Items */}
          <div className="pc:col-span-2">
            {/* Select All */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded accent-black"
                />
                <span className="text-sm">
                  Chọn tất cả ({selectedIds.length}/{items.length})
                </span>
              </label>
              <button
                onClick={removeSelected}
                disabled={selectedIds.length === 0}
                className="text-sm text-gray-500 hover:text-red-500 disabled:opacity-50"
              >
                Xóa đã chọn
              </button>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="py-4">
                  <div className="flex gap-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-5 h-5 rounded mt-1 accent-black"
                    />
                    <div className="relative w-20 h-20 pc:w-24 pc:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || "/images/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <Link
                          href={`/goods/detail/${item.productId}`}
                          className="text-sm font-medium line-clamp-2 pr-4 hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      {/* Options */}
                      {item.options && Object.keys(item.options).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Object.entries(item.options)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" / ")}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        {item.salePrice && item.salePrice < item.price ? (
                          <>
                            <Price amount={item.salePrice} className="text-base font-bold text-red-500" />
                            <Price amount={item.price} className="text-sm text-gray-400 line-through" />
                          </>
                        ) : (
                          <Price amount={item.price} className="text-base font-bold" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <Price amount={(item.salePrice || item.price) * item.quantity} className="font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - Desktop */}
          <div className="hidden pc:block">
            <div className="sticky top-24 bg-gray-50 rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h2>
              
              {/* Coupon */}
              <div className="mb-4">
                {couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-700">{couponCode}</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-sm text-gray-500 hover:text-red-500"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-black disabled:opacity-50"
                    >
                      {applyingCoupon ? "..." : "Áp dụng"}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 mt-1">{couponError}</p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính ({selectedIds.length} sản phẩm)</span>
                  <Price amount={selectedSubtotal} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span>{selectedShipping === 0 ? "Miễn phí" : <Price amount={selectedShipping} />}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-<Price amount={discount} /></span>
                  </div>
                )}
                {selectedShipping > 0 && selectedSubtotal > 0 && (
                  <p className="text-xs text-primary">
                    Mua thêm <Price amount={50000 - selectedSubtotal} /> để được miễn phí vận chuyển
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <Price amount={selectedTotal} className="text-red-500" />
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedIds.length === 0}
                className="w-full mt-6 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Thanh toán ({selectedIds.length})
              </button>

              <Link
                href="/"
                className="block text-center mt-3 text-sm text-gray-500 hover:text-black"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom */}
      <div className="pc:hidden fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="p-4">
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Tổng cộng ({selectedIds.length} sản phẩm)</span>
            <Price amount={selectedTotal} className="text-lg font-bold text-red-500" />
          </div>
          <button
            onClick={handleCheckout}
            disabled={selectedIds.length === 0}
            className="w-full py-4 bg-black text-white font-medium rounded-lg disabled:opacity-50"
          >
            Thanh toán ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}
