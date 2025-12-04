"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, Truck, MapPin, Tag, Check, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";

// Lazy load payment components
const StripePayment = lazy(() => import("@/components/payment/StripePayment"));
const PayPalPayment = lazy(() => import("@/components/payment/PayPalPayment"));

interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

const paymentMethods = [
  { id: "stripe", name: "Thẻ tín dụng/Ghi nợ (Stripe)", icon: "💳", type: "online" },
  { id: "paypal", name: "PayPal", icon: "🅿️", type: "online" },
  { id: "bank", name: "Chuyển khoản ngân hàng", icon: "🏦", type: "offline" },
  { id: "cod", name: "Thanh toán khi nhận hàng (COD)", icon: "💵", type: "offline" },
  { id: "momo", name: "Ví MoMo", icon: "📱", type: "online" },
  { id: "zalopay", name: "ZaloPay", icon: "📲", type: "online" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, discount, total, couponCode, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [customerNote, setCustomerNote] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    country: "Việt Nam",
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  // Load selected items from session
  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutItems");
    if (stored) {
      setSelectedItemIds(JSON.parse(stored));
    } else {
      // If no items selected, use all cart items
      setSelectedItemIds(items.map((item) => item.id));
    }
  }, [items]);

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user) {
      const userData = user as unknown as Record<string, unknown>;
      setShippingAddress((prev) => ({
        ...prev,
        firstName: (userData.firstName as string) || "",
        lastName: (userData.lastName as string) || "",
        email: (userData.email as string) || "",
        phone: (userData.billingPhone as string) || "",
        address1: (userData.shippingAddress1 as string) || (userData.billingAddress1 as string) || "",
        address2: (userData.shippingAddress2 as string) || (userData.billingAddress2 as string) || "",
        city: (userData.shippingCity as string) || (userData.billingCity as string) || "",
        state: (userData.shippingState as string) || (userData.billingState as string) || "",
        postcode: (userData.shippingPostcode as string) || (userData.billingPostcode as string) || "",
        country: (userData.shippingCountry as string) || (userData.billingCountry as string) || "Việt Nam",
      }));
    }
  }, [user]);

  const checkoutItems = items.filter((item) => selectedItemIds.includes(item.id));
  
  const checkoutSubtotal = checkoutItems.reduce(
    (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
    0
  );
  const checkoutShipping = checkoutSubtotal >= 50000 ? 0 : 3000;
  const checkoutTotal = Math.max(0, checkoutSubtotal + checkoutShipping - discount);

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};
    
    if (!shippingAddress.firstName.trim()) newErrors.firstName = "Vui lòng nhập tên";
    if (!shippingAddress.lastName.trim()) newErrors.lastName = "Vui lòng nhập họ";
    if (!shippingAddress.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!shippingAddress.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!shippingAddress.address1.trim()) newErrors.address1 = "Vui lòng nhập địa chỉ";
    if (!shippingAddress.city.trim()) newErrors.city = "Vui lòng nhập quận/huyện";
    if (!shippingAddress.state.trim()) newErrors.state = "Vui lòng nhập tỉnh/thành phố";
    
    // Validate email format
    if (shippingAddress.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    // Validate phone format
    if (shippingAddress.phone && !/^[0-9]{10,11}$/.test(shippingAddress.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOrder = async () => {
    const orderData = {
      items: checkoutItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.salePrice || item.price,
        sku: item.sku,
        image: item.image,
      })),
      billing: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postcode: shippingAddress.postcode,
        country: shippingAddress.country,
      },
      shipping: sameAsBilling ? null : shippingAddress,
      paymentMethod,
      paymentMethodTitle: paymentMethods.find((m) => m.id === paymentMethod)?.name || paymentMethod,
      customerNote,
      couponCode,
      subtotal: checkoutSubtotal,
      shippingTotal: checkoutShipping,
      discountTotal: discount,
      total: checkoutTotal,
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Đặt hàng thất bại");
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (checkoutItems.length === 0) {
      alert("Không có sản phẩm để thanh toán");
      return;
    }

    // For online payment methods, show payment form first
    if (paymentMethod === "stripe" || paymentMethod === "paypal") {
      setShowPaymentForm(true);
      return;
    }

    setIsLoading(true);

    try {
      const { order } = await createOrder();
      
      // Clear cart items that were ordered
      clearCart();
      sessionStorage.removeItem("checkoutItems");
      
      // Redirect to order confirmation
      router.push(`/order-complete/${order.orderNumber}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    setIsLoading(true);
    try {
      const { order } = await createOrder();
      setPendingOrderId(order.id);
      setPendingOrderNumber(order.orderNumber);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.");
      setShowPaymentForm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    clearCart();
    sessionStorage.removeItem("checkoutItems");
    router.push(`/order-complete/${pendingOrderNumber}`);
  };

  const handlePaymentError = (error: string) => {
    alert(`Thanh toán thất bại: ${error}`);
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-lg font-bold mb-2">Không có sản phẩm để thanh toán</h2>
        <Link
          href="/cart"
          className="px-8 py-3 bg-black text-white font-medium rounded-lg mt-4"
        >
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Mobile Header */}
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/cart" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">Thanh toán</h1>
          <div className="w-8" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-6">
        <h1 className="hidden pc:block text-2xl font-bold mb-6">Thanh toán</h1>

        <div className="pc:grid pc:grid-cols-3 pc:gap-8">
          {/* Left Column - Forms */}
          <div className="pc:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 pc:p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-primary" />
                <h2 className="font-bold">Địa chỉ giao hàng</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Họ *</label>
                  <input
                    type="text"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black ${errors.lastName ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tên *</label>
                  <input
                    type="text"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black ${errors.firstName ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black ${errors.phone ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email *</label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black ${errors.email ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Địa chỉ *</label>
                  <input
                    type="text"
                    value={shippingAddress.address1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                    placeholder="Số nhà, tên đường"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black ${errors.address1 ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.address1 && <p className="text-xs text-red-500 mt-1">{errors.address1}</p>}
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={shippingAddress.address2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                    placeholder="Tòa nhà, căn hộ (tùy chọn)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quận/Huyện *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black ${errors.city ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black ${errors.state ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mã bưu điện</label>
                  <input
                    type="text"
                    value={shippingAddress.postcode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postcode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quốc gia</label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 pc:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-primary" />
                <h2 className="font-bold">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                      paymentMethod === method.id
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setShowPaymentForm(false);
                        setPendingOrderId(null);
                        setPendingOrderNumber(null);
                      }}
                      className="accent-black"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-medium">{method.name}</span>
                    {paymentMethod === method.id && (
                      <Check size={18} className="ml-auto text-green-500" />
                    )}
                  </label>
                ))}
              </div>

              {/* Online Payment Forms */}
              {showPaymentForm && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {!pendingOrderId ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Nhấn nút bên dưới để tiếp tục thanh toán
                      </p>
                      <button
                        type="button"
                        onClick={handleOnlinePayment}
                        disabled={isLoading}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={18} className="animate-spin" />
                            Đang tạo đơn hàng...
                          </span>
                        ) : (
                          "Tiếp tục thanh toán"
                        )}
                      </button>
                    </div>
                  ) : (
                    <Suspense fallback={
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-gray-400" />
                      </div>
                    }>
                      {paymentMethod === "stripe" && (
                        <StripePayment
                          amount={checkoutTotal}
                          currency="vnd"
                          orderId={pendingOrderId}
                          orderNumber={pendingOrderNumber || undefined}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      )}
                      {paymentMethod === "paypal" && (
                        <PayPalPayment
                          amount={checkoutTotal}
                          currency="VND"
                          orderId={pendingOrderId}
                          orderNumber={pendingOrderNumber || undefined}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          onCancel={() => setShowPaymentForm(false)}
                        />
                      )}
                    </Suspense>
                  )}
                </div>
              )}
            </div>

            {/* Order Note */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 pc:p-6">
              <h2 className="font-bold mb-4">Ghi chú đơn hàng</h2>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="mt-6 pc:mt-0">
            <div className="sticky top-24 bg-gray-50 rounded-xl p-4 pc:p-6">
              <h2 className="font-bold text-lg mb-4">Đơn hàng của bạn</h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || "/images/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.salePrice || item.price)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-sm">
                      {formatPrice((item.salePrice || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              {couponCode && (
                <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg mb-4">
                  <Tag size={14} className="text-green-600" />
                  <span className="text-sm text-green-700">{couponCode}</span>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{formatPrice(checkoutSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span>{checkoutShipping === 0 ? "Miễn phí" : formatPrice(checkoutShipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-red-500">{formatPrice(checkoutTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>Đặt hàng</>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Chính sách bảo mật
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
