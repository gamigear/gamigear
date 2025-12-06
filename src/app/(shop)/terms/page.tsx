"use client";

import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import Link from "next/link";
import { ChevronRight, FileText, CreditCard, Truck, RotateCcw, AlertCircle, Mail } from "lucide-react";

const content = {
  en: {
    title: "Terms of Service",
    breadcrumb: "Terms",
    lastUpdated: "Last Updated: December 2024",
    intro: "Welcome to Gamigear! These terms and conditions outline the rules and regulations for the use of Gamigear's Website. By accessing this website, we assume you accept these terms and conditions in full.",
    sections: [
      {
        icon: CreditCard,
        title: "Payment Methods",
        content: `<p>We accept MasterCard, Discover, Visa, American Express and PayPal for payment. You can shop with confidence from Gamigear.com, knowing that transactions are protected by the highest level of security via SSL encryption.</p>
        <p>Your credit card will not be charged until your order is shipped. We apologize, but Gamigear® does not accept checks, money orders or purchase orders.</p>
        <p><strong>Please note:</strong> We will authorize your credit card at the time of your order. As part of this authorization process, your bank will place a hold on your account for the purchase amount of your order. The hold will be removed after a number of days determined by your banking institution – check with your bank for details.</p>
        <p>The credit card used for payment must be registered to the billing address in the order. The delivery address can be different from the billing address.</p>`
      },
      {
        icon: Truck,
        title: "Shipping Policy",
        content: `<p>We offer worldwide shipping to most countries. Shipping times and costs vary depending on your location and the shipping method selected.</p>
        <p><strong>Domestic Orders:</strong> Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business day delivery.</p>
        <p><strong>International Orders:</strong> Please allow 7-21 business days for delivery depending on your location and customs processing.</p>
        <p>All orders are processed within 1-2 business days. You will receive a tracking number via email once your order has shipped.</p>`
      },
      {
        icon: RotateCcw,
        title: "Return Policy",
        content: `<p>Because our products are custom printed and unique to each campaign, they will only qualify for refund if the product itself is flawed, if the quality of the printing is poor, or if the final product is materially different from the product presented on the site.</p>
        <p>You must submit a claim within <strong>15 days</strong> of the delivery date. If there's an issue with your product, please submit a claim through our online form. You'll need your order number as well as the email address used to place the order.</p>
        <p>Any unauthorized returns, or exchanges of items that are washed, worn, or damaged will not be eligible for a refund or replacement, and the item will be forfeited. Please note that customers are responsible for return shipping rates.</p>
        <h4>Size Exchange</h4>
        <p>You may exchange unworn, unused, and unwashed apparel items for a different size within 15 business days of the delivery date. We can only accept apparel exchanges for a different size, in the same style and color that was originally ordered.</p>
        <h4>Processing Time</h4>
        <p>We review claims within 72 hours. After determining that your order qualifies for a replacement or exchange, domestic orders will typically ship 5-10 days from the claim approval date. For Alaska, Hawaii, Puerto Rico & International orders please allow an additional 2-3 weeks for delivery.</p>
        <p>Qualified refunds are processed immediately, but it may take 5-10 business days to appear on your statement depending on your method of payment.</p>`
      },
      {
        icon: AlertCircle,
        title: "Limitation of Liability",
        content: `<p>In no event shall Gamigear, nor any of its officers, directors and employees, be liable to you for anything arising out of or in any way connected with your use of this Website, whether such liability is under contract, tort or otherwise.</p>
        <p>Gamigear, including its officers, directors and employees shall not be liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.</p>`
      }
    ],
    contact: {
      title: "Questions?",
      text: "If you have any questions about these Terms of Service, please contact us:",
      email: "admin@gamigear.com"
    }
  },
  ko: {
    title: "이용약관",
    breadcrumb: "이용약관",
    lastUpdated: "최종 업데이트: 2024년 12월",
    intro: "Gamigear에 오신 것을 환영합니다! 이 이용약관은 Gamigear 웹사이트 사용에 대한 규칙과 규정을 설명합니다. 이 웹사이트에 접속함으로써 이 이용약관을 전적으로 수락하는 것으로 간주합니다.",
    sections: [
      {
        icon: CreditCard,
        title: "결제 방법",
        content: `<p>MasterCard, Discover, Visa, American Express 및 PayPal 결제를 지원합니다. Gamigear.com에서 SSL 암호화를 통한 최고 수준의 보안으로 거래가 보호되므로 안심하고 쇼핑하실 수 있습니다.</p>
        <p>주문이 배송될 때까지 신용카드에 청구되지 않습니다. 죄송하지만 Gamigear®는 수표, 우편환 또는 구매 주문서를 받지 않습니다.</p>
        <p><strong>참고:</strong> 주문 시 신용카드 승인을 받습니다. 이 승인 과정의 일부로 은행에서 주문 금액에 대해 계정에 보류를 설정합니다. 보류는 은행 기관에서 결정한 일수 후에 해제됩니다.</p>
        <p>결제에 사용된 신용카드는 주문의 청구 주소로 등록되어 있어야 합니다. 배송 주소는 청구 주소와 다를 수 있습니다.</p>`
      },
      {
        icon: Truck,
        title: "배송 정책",
        content: `<p>대부분의 국가로 전 세계 배송을 제공합니다. 배송 시간과 비용은 위치와 선택한 배송 방법에 따라 다릅니다.</p>
        <p><strong>국내 주문:</strong> 표준 배송은 일반적으로 5-7 영업일이 소요됩니다. 2-3 영업일 배송을 위한 빠른 배송이 가능합니다.</p>
        <p><strong>해외 주문:</strong> 위치와 통관 처리에 따라 7-21 영업일이 소요될 수 있습니다.</p>
        <p>모든 주문은 1-2 영업일 내에 처리됩니다. 주문이 배송되면 이메일로 추적 번호를 받으실 수 있습니다.</p>`
      },
      {
        icon: RotateCcw,
        title: "반품 정책",
        content: `<p>저희 제품은 맞춤 인쇄되고 각 캠페인에 고유하기 때문에, 제품 자체에 결함이 있거나, 인쇄 품질이 좋지 않거나, 최종 제품이 사이트에 표시된 제품과 실질적으로 다른 경우에만 환불 자격이 있습니다.</p>
        <p>배송일로부터 <strong>15일 이내</strong>에 클레임을 제출해야 합니다. 제품에 문제가 있는 경우 온라인 양식을 통해 클레임을 제출해 주세요. 주문 번호와 주문에 사용된 이메일 주소가 필요합니다.</p>
        <p>승인되지 않은 반품이나 세탁, 착용 또는 손상된 품목의 교환은 환불 또는 교체 대상이 아니며 품목은 몰수됩니다. 고객은 반품 배송비를 부담합니다.</p>
        <h4>사이즈 교환</h4>
        <p>배송일로부터 15 영업일 이내에 착용하지 않고, 사용하지 않고, 세탁하지 않은 의류 품목을 다른 사이즈로 교환할 수 있습니다. 원래 주문한 것과 동일한 스타일과 색상의 다른 사이즈로만 의류 교환이 가능합니다.</p>
        <h4>처리 시간</h4>
        <p>72시간 이내에 클레임을 검토합니다. 주문이 교체 또는 교환 자격이 있다고 판단되면, 국내 주문은 일반적으로 클레임 승인일로부터 5-10일 후에 배송됩니다. 알래스카, 하와이, 푸에르토리코 및 해외 주문의 경우 추가로 2-3주가 소요될 수 있습니다.</p>
        <p>자격이 있는 환불은 즉시 처리되지만, 결제 방법에 따라 명세서에 표시되기까지 5-10 영업일이 소요될 수 있습니다.</p>`
      },
      {
        icon: AlertCircle,
        title: "책임 제한",
        content: `<p>어떠한 경우에도 Gamigear 및 그 임원, 이사, 직원은 이 웹사이트 사용과 관련하여 발생하는 어떠한 것에 대해서도 계약, 불법 행위 또는 기타 여부에 관계없이 귀하에게 책임을 지지 않습니다.</p>
        <p>Gamigear 및 그 임원, 이사, 직원은 이 웹사이트 사용과 관련된 간접적, 결과적 또는 특별한 책임에 대해 책임을 지지 않습니다.</p>`
      }
    ],
    contact: {
      title: "질문이 있으신가요?",
      text: "이 이용약관에 대해 질문이 있으시면 연락해 주세요:",
      email: "admin@gamigear.com"
    }
  },
  vi: {
    title: "Điều Khoản Dịch Vụ",
    breadcrumb: "Điều khoản",
    lastUpdated: "Cập nhật lần cuối: Tháng 12, 2024",
    intro: "Chào mừng đến với Gamigear! Các điều khoản và điều kiện này nêu rõ các quy tắc và quy định cho việc sử dụng Website của Gamigear. Bằng việc truy cập website này, chúng tôi cho rằng bạn chấp nhận đầy đủ các điều khoản và điều kiện này.",
    sections: [
      {
        icon: CreditCard,
        title: "Phương Thức Thanh Toán",
        content: `<p>Chúng tôi chấp nhận thanh toán bằng MasterCard, Discover, Visa, American Express và PayPal. Bạn có thể mua sắm tự tin tại Gamigear.com, biết rằng các giao dịch được bảo vệ bởi mức độ bảo mật cao nhất qua mã hóa SSL.</p>
        <p>Thẻ tín dụng của bạn sẽ không bị tính phí cho đến khi đơn hàng được giao. Xin lỗi, Gamigear® không chấp nhận séc, lệnh chuyển tiền hoặc đơn đặt hàng mua.</p>
        <p><strong>Lưu ý:</strong> Chúng tôi sẽ ủy quyền thẻ tín dụng của bạn tại thời điểm đặt hàng. Như một phần của quy trình ủy quyền này, ngân hàng sẽ giữ số tiền mua hàng trong tài khoản của bạn. Việc giữ sẽ được gỡ bỏ sau một số ngày do ngân hàng quyết định.</p>
        <p>Thẻ tín dụng dùng để thanh toán phải được đăng ký với địa chỉ thanh toán trong đơn hàng. Địa chỉ giao hàng có thể khác với địa chỉ thanh toán.</p>`
      },
      {
        icon: Truck,
        title: "Chính Sách Vận Chuyển",
        content: `<p>Chúng tôi cung cấp vận chuyển toàn cầu đến hầu hết các quốc gia. Thời gian và chi phí vận chuyển khác nhau tùy thuộc vào vị trí và phương thức vận chuyển được chọn.</p>
        <p><strong>Đơn hàng nội địa:</strong> Vận chuyển tiêu chuẩn thường mất 5-7 ngày làm việc. Vận chuyển nhanh có sẵn cho giao hàng 2-3 ngày làm việc.</p>
        <p><strong>Đơn hàng quốc tế:</strong> Vui lòng cho phép 7-21 ngày làm việc để giao hàng tùy thuộc vào vị trí và xử lý hải quan.</p>
        <p>Tất cả đơn hàng được xử lý trong 1-2 ngày làm việc. Bạn sẽ nhận được mã theo dõi qua email khi đơn hàng đã được gửi.</p>`
      },
      {
        icon: RotateCcw,
        title: "Chính Sách Đổi Trả",
        content: `<p>Vì sản phẩm của chúng tôi được in tùy chỉnh và độc đáo cho mỗi chiến dịch, chúng chỉ đủ điều kiện hoàn tiền nếu sản phẩm bị lỗi, chất lượng in kém, hoặc sản phẩm cuối cùng khác biệt đáng kể so với sản phẩm trình bày trên trang.</p>
        <p>Bạn phải gửi khiếu nại trong vòng <strong>15 ngày</strong> kể từ ngày giao hàng. Nếu có vấn đề với sản phẩm, vui lòng gửi khiếu nại qua biểu mẫu trực tuyến. Bạn cần số đơn hàng và email đã dùng để đặt hàng.</p>
        <p>Bất kỳ trả hàng không được phép, hoặc đổi các mặt hàng đã giặt, đã mặc hoặc hư hỏng sẽ không đủ điều kiện hoàn tiền hoặc thay thế. Khách hàng chịu trách nhiệm phí vận chuyển trả hàng.</p>
        <h4>Đổi Size</h4>
        <p>Bạn có thể đổi các mặt hàng quần áo chưa mặc, chưa sử dụng và chưa giặt sang size khác trong vòng 15 ngày làm việc kể từ ngày giao hàng. Chúng tôi chỉ chấp nhận đổi quần áo sang size khác, cùng kiểu dáng và màu sắc đã đặt ban đầu.</p>
        <h4>Thời Gian Xử Lý</h4>
        <p>Chúng tôi xem xét khiếu nại trong 72 giờ. Sau khi xác định đơn hàng đủ điều kiện thay thế hoặc đổi, đơn hàng nội địa thường được gửi 5-10 ngày từ ngày phê duyệt. Đối với đơn hàng quốc tế, vui lòng cho phép thêm 2-3 tuần.</p>
        <p>Hoàn tiền đủ điều kiện được xử lý ngay lập tức, nhưng có thể mất 5-10 ngày làm việc để hiển thị trên sao kê tùy thuộc vào phương thức thanh toán.</p>`
      },
      {
        icon: AlertCircle,
        title: "Giới Hạn Trách Nhiệm",
        content: `<p>Trong mọi trường hợp, Gamigear cũng như bất kỳ cán bộ, giám đốc và nhân viên nào của họ, sẽ không chịu trách nhiệm với bạn về bất cứ điều gì phát sinh từ hoặc liên quan đến việc sử dụng Website này, dù trách nhiệm đó theo hợp đồng, sai phạm hay cách khác.</p>
        <p>Gamigear, bao gồm các cán bộ, giám đốc và nhân viên sẽ không chịu trách nhiệm về bất kỳ trách nhiệm gián tiếp, hậu quả hoặc đặc biệt nào phát sinh từ việc sử dụng Website này.</p>`
      }
    ],
    contact: {
      title: "Có Câu Hỏi?",
      text: "Nếu bạn có bất kỳ câu hỏi nào về Điều khoản Dịch vụ này, vui lòng liên hệ:",
      email: "admin@gamigear.com"
    }
  }
};

export default function TermsPage() {
  const { locale } = useShopTranslation();
  const t = content[locale] || content.en;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t.breadcrumb}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7" />
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
          <p className="text-gray-600 leading-relaxed">{t.intro}</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {t.sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <div 
                      className="prose prose-gray max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-h4:text-base prose-h4:font-semibold prose-h4:text-gray-900 prose-h4:mt-4 prose-h4:mb-2 prose-strong:text-gray-900"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">{t.contact.title}</h2>
              <p className="text-white/90 mb-4">{t.contact.text}</p>
              <a 
                href={`mailto:${t.contact.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
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
