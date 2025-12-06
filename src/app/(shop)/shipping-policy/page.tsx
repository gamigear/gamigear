"use client";

import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import Link from "next/link";
import { ChevronRight, Truck, Globe, Clock, Package, MapPin, Mail } from "lucide-react";

const content = {
  en: {
    title: "Shipping Policy",
    breadcrumb: "Shipping",
    lastUpdated: "Last Updated: December 2024",
    intro: "At Gamigear, we're committed to delivering your gaming gear quickly and safely. Learn about our shipping options and delivery times below.",
    processing: {
      title: "Order Processing",
      text: "All orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed on the next business day. You will receive a confirmation email with tracking information once your order has shipped."
    },
    domestic: {
      title: "Domestic Shipping",
      subtitle: "United States",
      options: [
        { method: "Standard Shipping", time: "5-7 business days", price: "Free on orders over $50" },
        { method: "Express Shipping", time: "2-3 business days", price: "$9.99" },
        { method: "Next Day Delivery", time: "1 business day", price: "$19.99" }
      ]
    },
    international: {
      title: "International Shipping",
      subtitle: "Worldwide Delivery",
      text: "We ship to most countries worldwide. International shipping times and costs vary depending on your location.",
      regions: [
        { region: "Canada & Mexico", time: "7-14 business days" },
        { region: "Europe", time: "10-21 business days" },
        { region: "Asia Pacific", time: "14-28 business days" },
        { region: "Rest of World", time: "14-35 business days" }
      ],
      note: "Please note that international orders may be subject to customs duties and taxes, which are the responsibility of the recipient."
    },
    tracking: {
      title: "Order Tracking",
      text: "Once your order ships, you'll receive an email with a tracking number. You can track your package using the link provided or by visiting our order tracking page."
    },
    issues: {
      title: "Shipping Issues",
      items: [
        "If your package is lost or damaged during shipping, please contact us within 7 days of the expected delivery date.",
        "We are not responsible for delays caused by customs, weather, or carrier issues.",
        "Please ensure your shipping address is correct before placing your order."
      ]
    },
    contact: {
      title: "Shipping Questions?",
      text: "If you have any questions about shipping or need to update your delivery address, please contact us:",
      email: "admin@gamigear.com"
    }
  },
  ko: {
    title: "배송 정책",
    breadcrumb: "배송",
    lastUpdated: "최종 업데이트: 2024년 12월",
    intro: "Gamigear에서는 게이밍 기어를 빠르고 안전하게 배송하기 위해 최선을 다합니다. 아래에서 배송 옵션과 배송 시간에 대해 알아보세요.",
    processing: {
      title: "주문 처리",
      text: "모든 주문은 1-2 영업일 내에 처리됩니다. 주말이나 공휴일에 주문한 경우 다음 영업일에 처리됩니다. 주문이 배송되면 추적 정보가 포함된 확인 이메일을 받으실 수 있습니다."
    },
    domestic: {
      title: "국내 배송",
      subtitle: "대한민국",
      options: [
        { method: "일반 배송", time: "2-3 영업일", price: "5만원 이상 무료" },
        { method: "빠른 배송", time: "1-2 영업일", price: "3,000원" },
        { method: "당일 배송", time: "당일", price: "5,000원" }
      ]
    },
    international: {
      title: "해외 배송",
      subtitle: "전 세계 배송",
      text: "대부분의 국가로 배송합니다. 해외 배송 시간과 비용은 위치에 따라 다릅니다.",
      regions: [
        { region: "일본 & 중국", time: "5-10 영업일" },
        { region: "동남아시아", time: "7-14 영업일" },
        { region: "미국 & 유럽", time: "10-21 영업일" },
        { region: "기타 지역", time: "14-35 영업일" }
      ],
      note: "해외 주문은 관세 및 세금이 부과될 수 있으며, 이는 수령인의 책임입니다."
    },
    tracking: {
      title: "주문 추적",
      text: "주문이 배송되면 추적 번호가 포함된 이메일을 받으실 수 있습니다. 제공된 링크를 사용하거나 주문 추적 페이지를 방문하여 패키지를 추적할 수 있습니다."
    },
    issues: {
      title: "배송 문제",
      items: [
        "배송 중 패키지가 분실되거나 손상된 경우 예상 배송일로부터 7일 이내에 연락해 주세요.",
        "통관, 날씨 또는 운송업체 문제로 인한 지연에 대해서는 책임지지 않습니다.",
        "주문하기 전에 배송 주소가 정확한지 확인해 주세요."
      ]
    },
    contact: {
      title: "배송 관련 질문?",
      text: "배송에 대한 질문이 있거나 배송 주소를 업데이트해야 하는 경우 연락해 주세요:",
      email: "admin@gamigear.com"
    }
  },
  vi: {
    title: "Chính Sách Vận Chuyển",
    breadcrumb: "Vận chuyển",
    lastUpdated: "Cập nhật lần cuối: Tháng 12, 2024",
    intro: "Tại Gamigear, chúng tôi cam kết giao thiết bị gaming của bạn nhanh chóng và an toàn. Tìm hiểu về các tùy chọn vận chuyển và thời gian giao hàng bên dưới.",
    processing: {
      title: "Xử Lý Đơn Hàng",
      text: "Tất cả đơn hàng được xử lý trong 1-2 ngày làm việc. Đơn hàng đặt vào cuối tuần hoặc ngày lễ sẽ được xử lý vào ngày làm việc tiếp theo. Bạn sẽ nhận được email xác nhận với thông tin theo dõi khi đơn hàng đã được gửi."
    },
    domestic: {
      title: "Vận Chuyển Nội Địa",
      subtitle: "Việt Nam",
      options: [
        { method: "Giao hàng tiêu chuẩn", time: "3-5 ngày làm việc", price: "Miễn phí đơn trên 500K" },
        { method: "Giao hàng nhanh", time: "1-2 ngày làm việc", price: "30.000đ" },
        { method: "Giao hàng hỏa tốc", time: "Trong ngày", price: "50.000đ" }
      ]
    },
    international: {
      title: "Vận Chuyển Quốc Tế",
      subtitle: "Giao hàng toàn cầu",
      text: "Chúng tôi giao hàng đến hầu hết các quốc gia trên thế giới. Thời gian và chi phí vận chuyển quốc tế khác nhau tùy thuộc vào vị trí của bạn.",
      regions: [
        { region: "Đông Nam Á", time: "5-10 ngày làm việc" },
        { region: "Đông Á", time: "7-14 ngày làm việc" },
        { region: "Châu Âu & Mỹ", time: "14-28 ngày làm việc" },
        { region: "Các khu vực khác", time: "14-35 ngày làm việc" }
      ],
      note: "Xin lưu ý rằng đơn hàng quốc tế có thể phải chịu thuế hải quan, đây là trách nhiệm của người nhận."
    },
    tracking: {
      title: "Theo Dõi Đơn Hàng",
      text: "Khi đơn hàng được gửi, bạn sẽ nhận được email với mã theo dõi. Bạn có thể theo dõi gói hàng bằng liên kết được cung cấp hoặc truy cập trang theo dõi đơn hàng."
    },
    issues: {
      title: "Vấn Đề Vận Chuyển",
      items: [
        "Nếu gói hàng bị mất hoặc hư hỏng trong quá trình vận chuyển, vui lòng liên hệ trong vòng 7 ngày kể từ ngày giao hàng dự kiến.",
        "Chúng tôi không chịu trách nhiệm về sự chậm trễ do hải quan, thời tiết hoặc vấn đề của đơn vị vận chuyển.",
        "Vui lòng đảm bảo địa chỉ giao hàng chính xác trước khi đặt hàng."
      ]
    },
    contact: {
      title: "Câu Hỏi Về Vận Chuyển?",
      text: "Nếu bạn có câu hỏi về vận chuyển hoặc cần cập nhật địa chỉ giao hàng, vui lòng liên hệ:",
      email: "admin@gamigear.com"
    }
  }
};

export default function ShippingPolicyPage() {
  const { locale } = useShopTranslation();
  const t = content[locale] || content.en;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t.breadcrumb}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck className="w-7 h-7" />
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

        {/* Processing */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t.processing.title}</h2>
              <p className="text-gray-600 leading-relaxed">{t.processing.text}</p>
            </div>
          </div>
        </div>

        {/* Domestic Shipping */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.domestic.title}</h2>
              <p className="text-gray-500">{t.domestic.subtitle}</p>
            </div>
          </div>
          <div className="space-y-3">
            {t.domestic.options.map((option, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{option.method}</p>
                  <p className="text-sm text-gray-500">{option.time}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {option.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* International Shipping */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.international.title}</h2>
              <p className="text-gray-500">{t.international.subtitle}</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{t.international.text}</p>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {t.international.regions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{item.region}</span>
                <span className="text-sm text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-700 text-sm">{t.international.note}</p>
          </div>
        </div>

        {/* Tracking */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t.tracking.title}</h2>
              <p className="text-gray-600 leading-relaxed">{t.tracking.text}</p>
            </div>
          </div>
        </div>

        {/* Issues */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t.issues.title}</h2>
              <ul className="space-y-3">
                {t.issues.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">{t.contact.title}</h2>
              <p className="text-white/90 mb-4">{t.contact.text}</p>
              <a 
                href={`mailto:${t.contact.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-cyan-600 rounded-lg font-medium hover:bg-cyan-50 transition-colors"
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
