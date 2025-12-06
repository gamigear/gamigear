"use client";

import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import Link from "next/link";
import { ChevronRight, Shield, Eye, Lock, Cookie, Users, Bell, Mail } from "lucide-react";

const content = {
  en: {
    title: "Privacy Policy",
    breadcrumb: "Privacy",
    lastUpdated: "Last Updated: December 2024",
    intro: "We take seriously the privacy of our website Members and Visitors. Please read this privacy policy to learn more about how we treat information, including personally identifiable information, in connection with your use of the Gamigear.com website and online service.",
    sections: [
      {
        icon: Eye,
        title: "What Information We Collect",
        content: `<p>When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as your name, address and email address.</p>
        <p>When you browse our store, we also automatically receive your computer's internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system.</p>
        <p><strong>Email marketing:</strong> With your permission, we may send you emails about our store, new products and other updates.</p>`
      },
      {
        icon: Shield,
        title: "Consent",
        content: `<p><strong>How do you get my consent?</strong></p>
        <p>When you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange for a delivery or return a purchase, we imply that you consent to our collecting it and using it for that specific reason only.</p>
        <p>If we ask for your personal information for a secondary reason, like marketing, we will either ask you directly for your expressed consent, or provide you with an opportunity to say no.</p>
        <p><strong>How do I withdraw my consent?</strong></p>
        <p>If after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued collection, use or disclosure of your information, at anytime, by contacting us at admin@gamigear.com</p>`
      },
      {
        icon: Users,
        title: "Disclosure",
        content: `<p>We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.</p>`
      },
      {
        icon: Lock,
        title: "Third-Party Services",
        content: `<p>In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us.</p>
        <p>However, certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies in respect to the information we are required to provide to them for your purchase-related transactions.</p>
        <p>For these providers, we recommend that you read their privacy policies so you can understand the manner in which your personal information will be handled by these providers.</p>
        <p>Once you leave our store's website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy or our website's Terms of Service.</p>`
      },
      {
        icon: Shield,
        title: "Security",
        content: `<p>To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.</p>
        <p>If you provide us with your credit card information, the information is encrypted using secure socket layer technology (SSL) and stored with AES-256 encryption.</p>
        <p>Although no method of transmission over the Internet or electronic storage is 100% secure, we follow all PCI-DSS requirements and implement additional generally accepted industry standards.</p>`
      },
      {
        icon: Cookie,
        title: "Cookies",
        content: `<p>We use cookies to maintain your session, remember your preferences, and analyze site traffic. Here are the cookies we use:</p>
        <ul>
          <li><strong>_session_id:</strong> Unique token, sessional - Stores information about your session</li>
          <li><strong>_visit:</strong> Persistent for 30 minutes - Records the number of visits</li>
          <li><strong>cart:</strong> Persistent for 2 weeks - Stores information about your cart contents</li>
          <li><strong>_secure_session_id:</strong> Unique token, sessional - Secure session identifier</li>
        </ul>`
      },
      {
        icon: Users,
        title: "Age of Consent",
        content: `<p>By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>`
      },
      {
        icon: Bell,
        title: "Changes to This Policy",
        content: `<p>We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website.</p>
        <p>If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.</p>`
      }
    ],
    contact: {
      title: "Questions and Contact Information",
      text: "If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information, contact our Privacy Compliance Officer at:",
      email: "admin@gamigear.com"
    }
  },
  ko: {
    title: "개인정보처리방침",
    breadcrumb: "개인정보",
    lastUpdated: "최종 업데이트: 2024년 12월",
    intro: "저희는 웹사이트 회원 및 방문자의 개인정보를 중요하게 생각합니다. Gamigear.com 웹사이트 및 온라인 서비스 이용과 관련하여 개인 식별 정보를 포함한 정보를 어떻게 처리하는지 자세히 알아보려면 이 개인정보처리방침을 읽어주세요.",
    sections: [
      {
        icon: Eye,
        title: "수집하는 정보",
        content: `<p>저희 스토어에서 구매하실 때, 구매 및 판매 과정의 일부로 이름, 주소, 이메일 주소와 같은 개인정보를 수집합니다.</p>
        <p>저희 스토어를 탐색하실 때, 브라우저와 운영 체제에 대한 정보를 제공하기 위해 컴퓨터의 인터넷 프로토콜(IP) 주소를 자동으로 수신합니다.</p>
        <p><strong>이메일 마케팅:</strong> 귀하의 허락 하에 스토어, 신제품 및 기타 업데이트에 대한 이메일을 보낼 수 있습니다.</p>`
      },
      {
        icon: Shield,
        title: "동의",
        content: `<p><strong>어떻게 동의를 받나요?</strong></p>
        <p>거래 완료, 신용카드 확인, 주문, 배송 준비 또는 구매 반품을 위해 개인정보를 제공하시면, 해당 특정 목적으로만 수집하고 사용하는 것에 동의하신 것으로 간주합니다.</p>
        <p>마케팅과 같은 부차적인 이유로 개인정보를 요청하는 경우, 직접 명시적 동의를 요청하거나 거부할 기회를 제공합니다.</p>
        <p><strong>동의를 철회하려면?</strong></p>
        <p>동의 후 마음이 바뀌시면 admin@gamigear.com으로 연락하여 언제든지 연락, 정보의 지속적인 수집, 사용 또는 공개에 대한 동의를 철회할 수 있습니다.</p>`
      },
      {
        icon: Users,
        title: "공개",
        content: `<p>법률에 의해 요구되거나 서비스 약관을 위반하는 경우 개인정보를 공개할 수 있습니다.</p>`
      },
      {
        icon: Lock,
        title: "제3자 서비스",
        content: `<p>일반적으로 저희가 사용하는 제3자 제공업체는 서비스를 수행하는 데 필요한 범위 내에서만 귀하의 정보를 수집, 사용 및 공개합니다.</p>
        <p>그러나 결제 게이트웨이 및 기타 결제 거래 처리업체와 같은 특정 제3자 서비스 제공업체는 구매 관련 거래를 위해 제공해야 하는 정보에 대해 자체 개인정보 보호정책을 가지고 있습니다.</p>
        <p>이러한 제공업체의 경우, 개인정보가 어떻게 처리되는지 이해할 수 있도록 해당 개인정보 보호정책을 읽어보시기 바랍니다.</p>`
      },
      {
        icon: Shield,
        title: "보안",
        content: `<p>개인정보를 보호하기 위해 합리적인 예방 조치를 취하고 업계 모범 사례를 따라 부적절하게 분실, 오용, 접근, 공개, 변경 또는 파기되지 않도록 합니다.</p>
        <p>신용카드 정보를 제공하시면 SSL(Secure Socket Layer) 기술을 사용하여 암호화하고 AES-256 암호화로 저장합니다.</p>
        <p>인터넷을 통한 전송이나 전자 저장 방법이 100% 안전하지는 않지만, 모든 PCI-DSS 요구 사항을 준수하고 일반적으로 인정되는 추가 업계 표준을 구현합니다.</p>`
      },
      {
        icon: Cookie,
        title: "쿠키",
        content: `<p>세션 유지, 기본 설정 기억, 사이트 트래픽 분석을 위해 쿠키를 사용합니다. 사용하는 쿠키:</p>
        <ul>
          <li><strong>_session_id:</strong> 고유 토큰, 세션 - 세션 정보 저장</li>
          <li><strong>_visit:</strong> 30분간 지속 - 방문 횟수 기록</li>
          <li><strong>cart:</strong> 2주간 지속 - 장바구니 내용 저장</li>
          <li><strong>_secure_session_id:</strong> 고유 토큰, 세션 - 보안 세션 식별자</li>
        </ul>`
      },
      {
        icon: Users,
        title: "동의 연령",
        content: `<p>이 사이트를 사용함으로써 귀하는 거주하는 주 또는 지방에서 성년 이상이거나, 성년이며 미성년 피부양자가 이 사이트를 사용하도록 동의했음을 나타냅니다.</p>`
      },
      {
        icon: Bell,
        title: "정책 변경",
        content: `<p>이 개인정보처리방침은 언제든지 수정할 권리가 있으므로 자주 검토해 주세요. 변경 및 명확화는 웹사이트에 게시되는 즉시 효력이 발생합니다.</p>
        <p>이 정책에 중요한 변경을 하는 경우, 수집하는 정보, 사용 방법 및 공개 상황을 알 수 있도록 업데이트되었음을 여기에서 알려드립니다.</p>`
      }
    ],
    contact: {
      title: "문의 및 연락처",
      text: "개인정보에 대한 접근, 수정, 삭제, 불만 제기 또는 추가 정보가 필요하시면 개인정보 보호 담당자에게 연락해 주세요:",
      email: "admin@gamigear.com"
    }
  },
  vi: {
    title: "Chính Sách Bảo Mật",
    breadcrumb: "Bảo mật",
    lastUpdated: "Cập nhật lần cuối: Tháng 12, 2024",
    intro: "Chúng tôi coi trọng quyền riêng tư của Thành viên và Khách truy cập website. Vui lòng đọc chính sách bảo mật này để tìm hiểu thêm về cách chúng tôi xử lý thông tin, bao gồm thông tin nhận dạng cá nhân, liên quan đến việc sử dụng website và dịch vụ trực tuyến Gamigear.com.",
    sections: [
      {
        icon: Eye,
        title: "Thông Tin Chúng Tôi Thu Thập",
        content: `<p>Khi bạn mua hàng từ cửa hàng của chúng tôi, như một phần của quy trình mua bán, chúng tôi thu thập thông tin cá nhân bạn cung cấp như tên, địa chỉ và email.</p>
        <p>Khi bạn duyệt cửa hàng, chúng tôi cũng tự động nhận địa chỉ IP của máy tính để cung cấp thông tin giúp chúng tôi tìm hiểu về trình duyệt và hệ điều hành của bạn.</p>
        <p><strong>Email marketing:</strong> Với sự cho phép của bạn, chúng tôi có thể gửi email về cửa hàng, sản phẩm mới và các cập nhật khác.</p>`
      },
      {
        icon: Shield,
        title: "Sự Đồng Ý",
        content: `<p><strong>Làm thế nào để có được sự đồng ý của tôi?</strong></p>
        <p>Khi bạn cung cấp thông tin cá nhân để hoàn tất giao dịch, xác minh thẻ tín dụng, đặt hàng, sắp xếp giao hàng hoặc trả hàng, chúng tôi ngụ ý rằng bạn đồng ý cho chúng tôi thu thập và sử dụng cho mục đích cụ thể đó.</p>
        <p>Nếu chúng tôi yêu cầu thông tin cá nhân cho lý do phụ như marketing, chúng tôi sẽ trực tiếp yêu cầu sự đồng ý rõ ràng hoặc cung cấp cơ hội để từ chối.</p>
        <p><strong>Làm thế nào để rút lại sự đồng ý?</strong></p>
        <p>Nếu sau khi đồng ý, bạn đổi ý, bạn có thể rút lại sự đồng ý bất cứ lúc nào bằng cách liên hệ admin@gamigear.com</p>`
      },
      {
        icon: Users,
        title: "Tiết Lộ",
        content: `<p>Chúng tôi có thể tiết lộ thông tin cá nhân nếu pháp luật yêu cầu hoặc nếu bạn vi phạm Điều khoản Dịch vụ.</p>`
      },
      {
        icon: Lock,
        title: "Dịch Vụ Bên Thứ Ba",
        content: `<p>Nói chung, các nhà cung cấp bên thứ ba chúng tôi sử dụng chỉ thu thập, sử dụng và tiết lộ thông tin trong phạm vi cần thiết để thực hiện dịch vụ.</p>
        <p>Tuy nhiên, một số nhà cung cấp như cổng thanh toán có chính sách bảo mật riêng về thông tin chúng tôi cần cung cấp cho giao dịch mua hàng.</p>
        <p>Đối với các nhà cung cấp này, chúng tôi khuyên bạn đọc chính sách bảo mật của họ để hiểu cách thông tin cá nhân được xử lý.</p>`
      },
      {
        icon: Shield,
        title: "Bảo Mật",
        content: `<p>Để bảo vệ thông tin cá nhân, chúng tôi thực hiện các biện pháp phòng ngừa hợp lý và tuân theo các thực tiễn tốt nhất trong ngành để đảm bảo không bị mất, lạm dụng, truy cập, tiết lộ, thay đổi hoặc phá hủy không phù hợp.</p>
        <p>Nếu bạn cung cấp thông tin thẻ tín dụng, thông tin được mã hóa bằng công nghệ SSL và lưu trữ với mã hóa AES-256.</p>
        <p>Mặc dù không có phương thức truyền qua Internet nào an toàn 100%, chúng tôi tuân thủ tất cả yêu cầu PCI-DSS và triển khai các tiêu chuẩn ngành bổ sung.</p>`
      },
      {
        icon: Cookie,
        title: "Cookie",
        content: `<p>Chúng tôi sử dụng cookie để duy trì phiên, ghi nhớ tùy chọn và phân tích lưu lượng. Các cookie chúng tôi sử dụng:</p>
        <ul>
          <li><strong>_session_id:</strong> Token duy nhất, phiên - Lưu thông tin phiên</li>
          <li><strong>_visit:</strong> Tồn tại 30 phút - Ghi số lượt truy cập</li>
          <li><strong>cart:</strong> Tồn tại 2 tuần - Lưu nội dung giỏ hàng</li>
          <li><strong>_secure_session_id:</strong> Token duy nhất, phiên - Định danh phiên bảo mật</li>
        </ul>`
      },
      {
        icon: Users,
        title: "Độ Tuổi Đồng Ý",
        content: `<p>Bằng việc sử dụng trang này, bạn xác nhận rằng bạn ít nhất đủ tuổi trưởng thành tại nơi cư trú, hoặc bạn đủ tuổi trưởng thành và đã cho phép người phụ thuộc chưa thành niên sử dụng trang này.</p>`
      },
      {
        icon: Bell,
        title: "Thay Đổi Chính Sách",
        content: `<p>Chúng tôi có quyền sửa đổi chính sách bảo mật này bất cứ lúc nào, vì vậy vui lòng xem xét thường xuyên. Các thay đổi sẽ có hiệu lực ngay khi đăng trên website.</p>
        <p>Nếu chúng tôi thực hiện thay đổi quan trọng, chúng tôi sẽ thông báo tại đây để bạn biết thông tin chúng tôi thu thập, cách sử dụng và trong trường hợp nào chúng tôi tiết lộ.</p>`
      }
    ],
    contact: {
      title: "Câu Hỏi và Thông Tin Liên Hệ",
      text: "Nếu bạn muốn: truy cập, sửa, xóa thông tin cá nhân, đăng ký khiếu nại hoặc cần thêm thông tin, vui lòng liên hệ Nhân viên Tuân thủ Bảo mật:",
      email: "admin@gamigear.com"
    }
  }
};

export default function PrivacyPage() {
  const { locale } = useShopTranslation();
  const t = content[locale] || content.en;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t.breadcrumb}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7" />
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
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <div 
                      className="prose prose-gray max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-900 prose-ul:mt-2"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">{t.contact.title}</h2>
              <p className="text-white/90 mb-4">{t.contact.text}</p>
              <a 
                href={`mailto:${t.contact.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
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
