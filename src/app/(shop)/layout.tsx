"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import GoogleOneTap from "@/components/GoogleOneTap";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  
  // Không hiển thị One Tap trên trang login/register
  const hideOneTapPaths = ["/login", "/register", "/auth"];
  const showOneTap = !hideOneTapPaths.some(path => pathname.startsWith(path));

  return (
    <CurrencyProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          {/* Google One Tap - hiển thị popup đăng nhập tự động */}
          {showOneTap && <GoogleOneTap />}
          {/* Hide default header on homepage - HeaderWithHero is rendered in DynamicHomepage */}
          {!isHomepage && <Header />}
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileTabBar />
        </div>
      </CartProvider>
    </CurrencyProvider>
  );
}
