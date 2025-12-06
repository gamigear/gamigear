"use client";

import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import Link from "next/link";
import { ChevronRight, CreditCard, Shield, AlertCircle, Mail, CheckCircle } from "lucide-react";

const content = {
  en: {
    title: "Payment Methods",
    breadcrumb: "Payment",
    lastUpdated: "Last Updated: December 2024",
    intro: "Shop with confidence at Gamigear.com. We offer multiple secure payment options to make your shopping experience convenient and safe.",
    acceptedTitle: "Accepted Payment Methods",
    cards: [
      { name: "Visa", color: "from-blue-600 to-blue-700" },
      { name: "MasterCard", color: "from-red-500 to-orange-500" },
      { name: "American Express", color: "from-blue-400 to-blue-500" },
      { name: "Discover", color: "from-orange-400 to-orange-500" },
      { name: "PayPal", color: "from-blue-500 to-indigo-600" }
    ],
    security: {
      title: "Shopping Security",
      text: "You can shop with confidence from Gamigear.com, knowing that transactions are protected by the highest level of security via SSL encryption. Your credit card will not be charged until your order is shipped."
    },
    notAccepted: {
      title: "Not Accepted",
      text: "We apologize, but Gamigear® does not accept checks, money orders or purchase orders."
    },
    authorization: {
      title: "Credit Card Authorization",
      text: "Please note: we will authorize your credit card at the time of your order. As part of this authorization process, your bank will place a hold on your account for the purchase amount of your order. The hold will be removed after a number of days determined by your banking institution – check with your bank for details."
    },
    billing: {
      title: "Billing & Delivery Address",
      text: "The credit card used for payment must be registered to the billing address in the order. The delivery address can be different from the billing address."
    },
    features: [
      "SSL Encrypted Transactions",
      "PCI-DSS Compliant",
      "Secure Payment Gateway",
      "No Hidden Fees",
      "Instant Payment Confirmation"
    ],
    contact: {
      title: "Payment Questions?",
      text: "If you have any questions about payment methods or need assistance, please contact us:",
      email: "admin@gamigear.com"
    }
  },
  ko: {
    title: "결제 방법",
    breadcrumb: "결제",
    lastUpdated: "최종 업데이트: 2024년 12월",
    intro: "Gamigear.com에서 안심하고 쇼핑하세요. 편리하고 안전한 쇼핑 경험을 위해 다양한 보안 결제 옵션을 제공합니다.",
    acceptedTitle: "지원 결제 수단",
    cards: [
      { name: "Visa", color: "from-blue-600 to-blue-700" },
      { name: "MasterCard", color: "from-red-500 to-orange-500" },
      { name: "American Express", color: "from-blue-400 to-blue-500" },
      { name: "Discover", color: "from-orange-400 to-orange-500" },
      { name: "PayPal", color: "from-blue-500 to-indigo-600" }
    ],
    security: {
      title: "쇼핑 보안",
      text: "Gamigear.com에서 SSL 암호화를 통한 최고 수준의 보안으로 거래가 보호되므로 안심하고 쇼핑하실 수 있습니다. 주문이 배송될 때까지 신용카드에 청구되지 않습니다."
    },
    notAccepted: {
      title: "지원하지 않는 결제 수단",
      text: "죄송하지만 Gamigear®는 수표, 우편환 또는 구매 주문서를 받지 않습니다."
    },
    authorization: {
      title: "신용카드 승인",
      text: "참고: 주문 시 신용카드 승인을 받습니다. 이 승인 과정의 일부로 은행에서 주문 금액에 대해 계정에 보류를 설정합니다. 보류는 은행 기관에서 결정한 일수 후에 해제됩니다 – 자세한 내용은 은행에 문의하세요."
    },
    billing: {
      title: "청구 및 배송 주소",
      text: "결제에 사용된 신용카드는 주문의 청구 주소로 등록되어 있어야 합니다. 배송 주소는 청구 주소와 다를 수 있습니다."
    },
    features: [
      "SSL 암호화 거래",
      "PCI-DSS 준수",
      "보안 결제 게이트웨이",
      "숨겨진 수수료 없음",
      "즉시 결제 확인"
    ],
    contact: {
      title: "결제 관련 질문?",
      text: "결제 방법에 대한 질문이 있거나 도움이 필요하시면 연락해 주세요:",
      email: "admin@gamigear.com"
    }
  },
  vi: {
    title: "Phương Thức Thanh Toán",
    breadcrumb: "Thanh toán",
    lastUpdated: "Cập nhật lần cuối: Tháng 12, 2024",
    intro: "Mua sắm tự tin tại Gamigear.com. Chúng tôi cung cấp nhiều tùy chọn thanh toán an toàn để trải nghiệm mua sắm của bạn thuận tiện và an toàn.",
    acceptedTitle: "Phương Thức Thanh Toán Được Chấp Nhận",
    cards: [
      { name: "Visa", color: "from-blue-600 to-blue-700" },
      { name: "MasterCard", color: "from-red-500 to-orange-500" },
      { name: "American Express", color: "from-blue-400 to-blue-500" },
      { name: "Discover", color: "from-orange-400 to-orange-500" },
      { name: "PayPal", color: "from-blue-500 to-indigo-600" }
    ],
    security: {
      title: "Bảo Mật Mua Sắm",
      text: "Bạn có thể mua sắm tự tin tại Gamigear.com, biết rằng các giao dịch được bảo vệ bởi mức độ bảo mật cao nhất qua mã hóa SSL. Thẻ tín dụng của bạn sẽ không bị tính phí cho đến khi đơn hàng được giao."
    },
    notAccepted: {
      title: "Không Chấp Nhận",
      text: "Xin lỗi, Gamigear® không chấp nhận séc, lệnh chuyển tiền hoặc đơn đặt hàng mua."
    },
    authorization: {
      title: "Ủy Quyền Thẻ Tín Dụng",
      text: "Lưu ý: chúng tôi sẽ ủy quyền thẻ tín dụng của bạn tại thời điểm đặt hàng. Như một phần của quy trình ủy quyền này, ngân hàng sẽ giữ số tiền mua hàng trong tài khoản của bạn. Việc giữ sẽ được gỡ bỏ sau một số ngày do ngân hàng quyết định – liên hệ ngân hàng để biết chi tiết."
    },
    billing: {
      title: "Địa Chỉ Thanh Toán & Giao Hàng",
      text: "Thẻ tín dụng dùng để thanh toán phải được đăng ký với địa chỉ thanh toán trong đơn hàng. Địa chỉ giao hàng có thể khác với địa chỉ thanh toán."
    },
    features: [
      "Giao dịch mã hóa SSL",
      "Tuân thủ PCI-DSS",
      "Cổng thanh toán bảo mật",
      "Không phí ẩn",
      "Xác nhận thanh toán tức thì"
    ],
    contact: {
      title: "Câu Hỏi Về Thanh Toán?",
      text: "Nếu bạn có câu hỏi về phương thức thanh toán hoặc cần hỗ trợ, vui lòng liên hệ:",
      email: "admin@gamigear.com"
    }
  }
};

export default function PaymentMethodsPage() {
  const { locale } = useShopTranslation();
  const t = content[locale] || content.en;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t.breadcrumb}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{t.title}</h1>
              <p className="text-white/80 mt-1">{t.lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:py-12">
        {/* Intro */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-8">
          <p className="text-gray-600 leading-relaxed text-lg">{t.intro}</p>
        </div>

        {/* Accepted Payment Methods */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t.acceptedTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {t.cards.map((card, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-r ${card.color} rounded-lg p-4 text-white text-center font-bold shadow-md`}
              >
                {card.name}
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800 mb-3">{t.security.title}</h2>
              <p className="text-green-700 leading-relaxed mb-4">{t.security.text}</p>
              <div className="flex flex-wrap gap-2">
                {t.features.map((feature, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    <CheckCircle size={14} />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Not Accepted */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-800 mb-2">{t.notAccepted.title}</h2>
              <p className="text-amber-700">{t.notAccepted.text}</p>
            </div>
          </div>
        </div>

        {/* Authorization */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t.authorization.title}</h2>
              <p className="text-gray-600 leading-relaxed">{t.authorization.text}</p>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t.billing.title}</h2>
              <p className="text-gray-600 leading-relaxed">{t.billing.text}</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">{t.contact.title}</h2>
              <p className="text-white/90 mb-4">{t.contact.text}</p>
              <a 
                href={`mailto:${t.contact.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                <Mail size={18} />
                {t.contact.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
