"use client";

import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import Link from "next/link";
import { ChevronRight, Sparkles, Lightbulb, Heart, BookOpen, Users, Award } from "lucide-react";

const content = {
  en: {
    title: "About Us",
    breadcrumb: "About",
    welcome: "Welcome",
    historyTitle: "The Gamigear History",
    historyText: "Started the idea of creating premium gaming gear and accessories that positively impact gamers and the gaming community. In 2015, friends and family members joined forces to spread good vibes and deliver the best gaming experience.",
    valuesTitle: "The Gamigear® Brand Values",
    values: [
      {
        icon: Lightbulb,
        title: "Imagination",
        text: "Free play is how gamers develop their imagination – the foundation for creativity. Curiosity asks WHY and imagines possible explanations. Playfulness asks WHAT IF and imagines how the ordinary becomes extraordinary. Dreaming it is a first step towards doing it."
      },
      {
        icon: Sparkles,
        title: "Creativity",
        text: "Creativity is the ability to come up with ideas that are new, surprising and valuable – and it's an essential 21st century skill. Systematic creativity is a particular form of creativity that combines logic and reasoning with playfulness and imagination."
      },
      {
        icon: Heart,
        title: "Fun",
        text: "Fun is being active together, the thrill of an adventure, the joyful enthusiasm of gamers and the delight in surprising both yourself and others in what you can do or create. Fun is the happiness we experience when we are fully engaged."
      },
      {
        icon: BookOpen,
        title: "Learning",
        text: "Learning is about being curious, experimenting and collaborating – expanding our thinking and doing, helping us develop new insights and new skills. We learn through play by putting things together, taking them apart and putting them together in different ways."
      },
      {
        icon: Users,
        title: "Caring",
        text: "Caring is about our desire to make a positive difference in the lives of gamers, for our colleagues, our partners, and the world we live in. Doing that little extra, not because we have to – but because it feels right and because we care."
      },
      {
        icon: Award,
        title: "Quality",
        text: "For us quality means the challenge of continuous improvement to provide the best gaming gear, the best for gamers and their experience and the best to our community and partners. We believe in quality that speaks for itself."
      }
    ]
  },
  ko: {
    title: "회사 소개",
    breadcrumb: "소개",
    welcome: "환영합니다",
    historyTitle: "Gamigear의 역사",
    historyText: "게이머와 게이밍 커뮤니티에 긍정적인 영향을 미치는 프리미엄 게이밍 기어와 액세서리를 만들겠다는 아이디어로 시작했습니다. 2015년, 친구들과 가족들이 힘을 합쳐 좋은 분위기를 전파하고 최고의 게이밍 경험을 제공하기 시작했습니다.",
    valuesTitle: "Gamigear® 브랜드 가치",
    values: [
      {
        icon: Lightbulb,
        title: "상상력",
        text: "자유로운 플레이는 게이머가 상상력을 발전시키는 방법입니다 – 창의성의 기초입니다. 호기심은 '왜'를 묻고 가능한 설명을 상상합니다. 장난기는 '만약에'를 묻고 평범한 것이 어떻게 특별해지는지 상상합니다."
      },
      {
        icon: Sparkles,
        title: "창의성",
        text: "창의성은 새롭고, 놀랍고, 가치 있는 아이디어를 생각해내는 능력입니다 – 21세기 필수 기술입니다. 체계적인 창의성은 논리와 추론을 장난기와 상상력과 결합하는 특별한 형태의 창의성입니다."
      },
      {
        icon: Heart,
        title: "재미",
        text: "재미는 함께 활동하는 것, 모험의 스릴, 게이머의 즐거운 열정, 그리고 자신과 다른 사람들을 놀라게 하는 기쁨입니다. 재미는 우리가 완전히 몰입했을 때 경험하는 행복입니다."
      },
      {
        icon: BookOpen,
        title: "학습",
        text: "학습은 호기심을 갖고, 실험하고, 협력하는 것입니다 – 우리의 생각과 행동을 확장하고, 새로운 통찰력과 기술을 개발하는 데 도움이 됩니다. 우리는 놀이를 통해 배웁니다."
      },
      {
        icon: Users,
        title: "배려",
        text: "배려는 게이머의 삶, 동료, 파트너, 그리고 우리가 사는 세상에 긍정적인 변화를 만들고자 하는 우리의 열망입니다. 해야 해서가 아니라 옳다고 느끼고 관심이 있기 때문에 조금 더 하는 것입니다."
      },
      {
        icon: Award,
        title: "품질",
        text: "우리에게 품질은 최고의 게이밍 기어, 게이머와 그들의 경험을 위한 최고, 커뮤니티와 파트너를 위한 최고를 제공하기 위한 지속적인 개선의 도전을 의미합니다. 우리는 스스로 말하는 품질을 믿습니다."
      }
    ]
  },
  vi: {
    title: "Về Chúng Tôi",
    breadcrumb: "Giới thiệu",
    welcome: "Chào mừng",
    historyTitle: "Lịch Sử Gamigear",
    historyText: "Bắt đầu với ý tưởng tạo ra các thiết bị và phụ kiện gaming cao cấp có tác động tích cực đến game thủ và cộng đồng gaming. Năm 2015, bạn bè và gia đình đã cùng nhau lan tỏa năng lượng tích cực và mang đến trải nghiệm gaming tốt nhất.",
    valuesTitle: "Giá Trị Thương Hiệu Gamigear®",
    values: [
      {
        icon: Lightbulb,
        title: "Trí Tưởng Tượng",
        text: "Chơi tự do là cách game thủ phát triển trí tưởng tượng – nền tảng của sự sáng tạo. Sự tò mò hỏi TẠI SAO và tưởng tượng các giải thích có thể. Sự vui tươi hỏi NẾU NHƯ và tưởng tượng điều bình thường trở nên phi thường."
      },
      {
        icon: Sparkles,
        title: "Sáng Tạo",
        text: "Sáng tạo là khả năng đưa ra những ý tưởng mới, bất ngờ và có giá trị – đó là kỹ năng thiết yếu của thế kỷ 21. Sáng tạo có hệ thống là hình thức đặc biệt kết hợp logic và lý luận với sự vui tươi và trí tưởng tượng."
      },
      {
        icon: Heart,
        title: "Niềm Vui",
        text: "Niềm vui là cùng nhau hoạt động, cảm giác hồi hộp của cuộc phiêu lưu, sự nhiệt tình vui vẻ của game thủ và niềm vui khi làm bất ngờ cả bản thân và người khác. Niềm vui là hạnh phúc khi chúng ta hoàn toàn đắm chìm."
      },
      {
        icon: BookOpen,
        title: "Học Hỏi",
        text: "Học hỏi là tò mò, thử nghiệm và hợp tác – mở rộng suy nghĩ và hành động, giúp chúng ta phát triển những hiểu biết và kỹ năng mới. Chúng ta học qua việc chơi bằng cách ghép các thứ lại với nhau theo nhiều cách khác nhau."
      },
      {
        icon: Users,
        title: "Quan Tâm",
        text: "Quan tâm là mong muốn tạo ra sự khác biệt tích cực trong cuộc sống của game thủ, đồng nghiệp, đối tác và thế giới chúng ta sống. Làm thêm một chút, không phải vì phải làm – mà vì cảm thấy đúng và vì chúng tôi quan tâm."
      },
      {
        icon: Award,
        title: "Chất Lượng",
        text: "Với chúng tôi, chất lượng có nghĩa là thách thức cải tiến liên tục để cung cấp thiết bị gaming tốt nhất, tốt nhất cho game thủ và trải nghiệm của họ, tốt nhất cho cộng đồng và đối tác. Chúng tôi tin vào chất lượng tự nói lên."
      }
    ]
  }
};

export default function AboutPage() {
  const { locale } = useShopTranslation();
  const t = content[locale] || content.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto w-full max-w-[1280px] px-4 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t.breadcrumb}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl text-white/90">{t.welcome}</p>
        </div>
      </div>

      {/* History Section */}
      <div className="mx-auto w-full max-w-[1280px] px-4 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 -mt-12 relative z-10 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{t.historyTitle}</h2>
          <p className="text-gray-600 leading-relaxed text-lg">{t.historyText}</p>
        </div>
      </div>

      {/* Values Section */}
      <div className="mx-auto w-full max-w-[1280px] px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">{t.valuesTitle}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="mx-auto w-full max-w-[1280px] px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {locale === 'ko' ? '함께 게이밍의 미래를 만들어갑니다' : 
             locale === 'vi' ? 'Cùng nhau xây dựng tương lai gaming' :
             'Building the Future of Gaming Together'}
          </h2>
          <p className="text-gray-400 mb-8">
            {locale === 'ko' ? '최고의 게이밍 경험을 위한 여정에 함께하세요' :
             locale === 'vi' ? 'Tham gia cùng chúng tôi trong hành trình mang đến trải nghiệm gaming tốt nhất' :
             'Join us on our journey to deliver the best gaming experience'}
          </p>
          <Link 
            href="/contact"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            {locale === 'ko' ? '문의하기' : locale === 'vi' ? 'Liên hệ' : 'Contact Us'}
          </Link>
        </div>
      </div>
    </div>
  );
}
