"use client";

import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import Link from "next/link";
import { ChevronRight, RotateCcw, Package, Clock, HelpCircle, Mail, CheckCircle, XCircle } from "lucide-react";

const content = {
  en: {
    title: "Return Policy",
    breadcrumb: "Returns",
    lastUpdated: "Last Updated: December 2024",
    intro: "At Gamigear, we want you to be completely satisfied with your purchase. Please read our return policy carefully to understand your options.",
    faqs: [
      {
        icon: HelpCircle,
        question: "What is your return policy?",
        answer: `Because our products are custom printed and unique to each campaign, they will only qualify for refund if the product itself is flawed, if the quality of the printing is poor, or if the final product is materially different from the product presented on the site.

You must submit a claim within <strong>15 days</strong> of the delivery date. If there's an issue with your product, please submit a claim through our online form. You'll need your order number as well as the email address used to place the order. We will use this information to look into a replacement and prevent future errors.

Any unauthorized returns, or exchanges of items that are washed, worn, or damaged will not be eligible for a refund or replacement, and the item will be forfeited. Please note that customers are responsible for return shipping rates.`
      },
      {
        icon: Package,
        question: "My clothing doesn't fit. What do I do?",
        answer: `You may exchange unworn, unused, and unwashed apparel items for a different size within <strong>15 business days</strong> of the delivery date.

We can only accept apparel exchanges for a different size, in the same style and color that was originally ordered.

Please note that because our items are custom printed, we can only exchange once. Make sure to double check our size chart, which is also linked on the item's page.`
      },
      {
        icon: Clock,
        question: "How long does a replacement, refund, or return take to process?",
        answer: `We review claims within <strong>72 hours</strong>. After determining that your order qualifies for a replacement or exchange:

<ul>
<li><strong>Domestic orders:</strong> Will typically ship 5-10 days from the claim approval date</li>
<li><strong>Alaska, Hawaii, Puerto Rico & International orders:</strong> Please allow an additional 2-3 weeks for delivery</li>
</ul>

Qualified refunds are processed immediately, but it may take <strong>5-10 business days</strong> to appear on your statement depending on your method of payment.

If we request that your item is returned to us, we'll send the exchange or qualified refund your way after receiving your return. Please note that customers are responsible for return shipping rates.`
      }
    ],
    eligible: {
      title: "Eligible for Return",
      items: [
        "Defective or damaged products",
        "Wrong item received",
        "Poor print quality",
        "Product materially different from listing"
      ]
    },
    notEligible: {
      title: "Not Eligible for Return",
      items: [
        "Items that have been washed",
        "Items that have been worn",
        "Items damaged by customer",
        "Unauthorized returns",
        "Items returned after 15 days"
      ]
    },
    contact: {
      title: "Need Help?",
      text: "If you have questions about returns or need to submit a claim, please contact us:",
      email: "admin@gamigear.com"
    }
  },
  ko: {
    title: "반품 정책",
    breadcrumb: "반품",
    lastUpdated: "최종 업데이트: 2024년 12월",
    intro: "Gamigear에서는 고객님이 구매에 완전히 만족하시길 바랍니다. 옵션을 이해하시려면 반품 정책을 주의 깊게 읽어주세요.",
    faqs: [
      {
        icon: HelpCircle,
        question: "반품 정책은 무엇인가요?",
        answer: `저희 제품은 맞춤 인쇄되고 각 캠페인에 고유하기 때문에, 제품 자체에 결함이 있거나, 인쇄 품질이 좋지 않거나, 최종 제품이 사이트에 표시된 제품과 실질적으로 다른 경우에만 환불 자격이 있습니다.

배송일로부터 <strong>15일 이내</strong>에 클레임을 제출해야 합니다. 제품에 문제가 있는 경우 온라인 양식을 통해 클레임을 제출해 주세요. 주문 번호와 주문에 사용된 이메일 주소가 필요합니다. 이 정보를 사용하여 교체를 검토하고 향후 오류를 방지합니다.

승인되지 않은 반품이나 세탁, 착용 또는 손상된 품목의 교환은 환불 또는 교체 대상이 아니며 품목은 몰수됩니다. 고객은 반품 배송비를 부담합니다.`
      },
      {
        icon: Package,
        question: "옷이 맞지 않아요. 어떻게 해야 하나요?",
        answer: `배송일로부터 <strong>15 영업일 이내</strong>에 착용하지 않고, 사용하지 않고, 세탁하지 않은 의류 품목을 다른 사이즈로 교환할 수 있습니다.

원래 주문한 것과 동일한 스타일과 색상의 다른 사이즈로만 의류 교환이 가능합니다.

저희 품목은 맞춤 인쇄되기 때문에 한 번만 교환할 수 있습니다. 품목 페이지에도 링크된 사이즈 차트를 반드시 확인해 주세요.`
      },
      {
        icon: Clock,
        question: "교체, 환불 또는 반품 처리에 얼마나 걸리나요?",
        answer: `<strong>72시간 이내</strong>에 클레임을 검토합니다. 주문이 교체 또는 교환 자격이 있다고 판단되면:

<ul>
<li><strong>국내 주문:</strong> 일반적으로 클레임 승인일로부터 5-10일 후에 배송됩니다</li>
<li><strong>알래스카, 하와이, 푸에르토리코 및 해외 주문:</strong> 추가로 2-3주가 소요될 수 있습니다</li>
</ul>

자격이 있는 환불은 즉시 처리되지만, 결제 방법에 따라 명세서에 표시되기까지 <strong>5-10 영업일</strong>이 소요될 수 있습니다.

품목을 반송해 주시면, 반품 수령 후 교환 또는 자격이 있는 환불을 보내드립니다. 고객은 반품 배송비를 부담합니다.`
      }
    ],
    eligible: {
      title: "반품 가능",
      items: [
        "결함 또는 손상된 제품",
        "잘못된 품목 수령",
        "인쇄 품질 불량",
        "목록과 실질적으로 다른 제품"
      ]
    },
    notEligible: {
      title: "반품 불가",
      items: [
        "세탁한 품목",
        "착용한 품목",
        "고객이 손상시킨 품목",
        "승인되지 않은 반품",
        "15일 이후 반품된 품목"
      ]
    },
    contact: {
      title: "도움이 필요하신가요?",
      text: "반품에 대한 질문이 있거나 클레임을 제출해야 하는 경우 연락해 주세요:",
      email: "admin@gamigear.com"
    }
  },
  vi: {
    title: "Chính Sách Đổi Trả",
    breadcrumb: "Đổi trả",
    lastUpdated: "Cập nhật lần cuối: Tháng 12, 2024",
    intro: "Tại Gamigear, chúng tôi muốn bạn hoàn toàn hài lòng với đơn hàng của mình. Vui lòng đọc kỹ chính sách đổi trả để hiểu các lựa chọn của bạn.",
    faqs: [
      {
        icon: HelpCircle,
        question: "Chính sách đổi trả của bạn là gì?",
        answer: `Vì sản phẩm của chúng tôi được in tùy chỉnh và độc đáo cho mỗi chiến dịch, chúng chỉ đủ điều kiện hoàn tiền nếu sản phẩm bị lỗi, chất lượng in kém, hoặc sản phẩm cuối cùng khác biệt đáng kể so với sản phẩm trình bày trên trang.

Bạn phải gửi khiếu nại trong vòng <strong>15 ngày</strong> kể từ ngày giao hàng. Nếu có vấn đề với sản phẩm, vui lòng gửi khiếu nại qua biểu mẫu trực tuyến. Bạn cần số đơn hàng và email đã dùng để đặt hàng. Chúng tôi sẽ sử dụng thông tin này để xem xét thay thế và ngăn ngừa lỗi trong tương lai.

Bất kỳ trả hàng không được phép, hoặc đổi các mặt hàng đã giặt, đã mặc hoặc hư hỏng sẽ không đủ điều kiện hoàn tiền hoặc thay thế, và mặt hàng sẽ bị tịch thu. Khách hàng chịu trách nhiệm phí vận chuyển trả hàng.`
      },
      {
        icon: Package,
        question: "Quần áo không vừa. Tôi phải làm gì?",
        answer: `Bạn có thể đổi các mặt hàng quần áo chưa mặc, chưa sử dụng và chưa giặt sang size khác trong vòng <strong>15 ngày làm việc</strong> kể từ ngày giao hàng.

Chúng tôi chỉ chấp nhận đổi quần áo sang size khác, cùng kiểu dáng và màu sắc đã đặt ban đầu.

Xin lưu ý rằng vì các mặt hàng của chúng tôi được in tùy chỉnh, chúng tôi chỉ có thể đổi một lần. Hãy kiểm tra kỹ bảng size, cũng được liên kết trên trang sản phẩm.`
      },
      {
        icon: Clock,
        question: "Thay thế, hoàn tiền hoặc trả hàng mất bao lâu để xử lý?",
        answer: `Chúng tôi xem xét khiếu nại trong <strong>72 giờ</strong>. Sau khi xác định đơn hàng đủ điều kiện thay thế hoặc đổi:

<ul>
<li><strong>Đơn hàng nội địa:</strong> Thường được gửi 5-10 ngày từ ngày phê duyệt khiếu nại</li>
<li><strong>Đơn hàng quốc tế:</strong> Vui lòng cho phép thêm 2-3 tuần để giao hàng</li>
</ul>

Hoàn tiền đủ điều kiện được xử lý ngay lập tức, nhưng có thể mất <strong>5-10 ngày làm việc</strong> để hiển thị trên sao kê tùy thuộc vào phương thức thanh toán.

Nếu chúng tôi yêu cầu trả lại mặt hàng, chúng tôi sẽ gửi đổi hoặc hoàn tiền đủ điều kiện sau khi nhận được hàng trả. Khách hàng chịu trách nhiệm phí vận chuyển trả hàng.`
      }
    ],
    eligible: {
      title: "Đủ Điều Kiện Đổi Trả",
      items: [
        "Sản phẩm bị lỗi hoặc hư hỏng",
        "Nhận sai mặt hàng",
        "Chất lượng in kém",
        "Sản phẩm khác biệt đáng kể so với mô tả"
      ]
    },
    notEligible: {
      title: "Không Đủ Điều Kiện Đổi Trả",
      items: [
        "Mặt hàng đã giặt",
        "Mặt hàng đã mặc",
        "Mặt hàng bị khách hàng làm hỏng",
        "Trả hàng không được phép",
        "Mặt hàng trả sau 15 ngày"
      ]
    },
    contact: {
      title: "Cần Trợ Giúp?",
      text: "Nếu bạn có câu hỏi về đổi trả hoặc cần gửi khiếu nại, vui lòng liên hệ:",
      email: "admin@gamigear.com"
    }
  }
};

export default function ReturnPolicyPage() {
  const { locale } = useShopTranslation();
  const t = content[locale] || content.en;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t.breadcrumb}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <RotateCcw className="w-7 h-7" />
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

        {/* Eligible / Not Eligible */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-green-800">{t.eligible.title}</h3>
            </div>
            <ul className="space-y-2">
              {t.eligible.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-800">{t.notEligible.title}</h3>
            </div>
            <ul className="space-y-2">
              {t.notEligible.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-red-700">
                  <XCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          {t.faqs.map((faq, index) => {
            const Icon = faq.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{faq.question}</h2>
                    <div 
                      className="prose prose-gray max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-900 prose-ul:mt-2 whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">{t.contact.title}</h2>
              <p className="text-white/90 mb-4">{t.contact.text}</p>
              <a 
                href={`mailto:${t.contact.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors"
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
