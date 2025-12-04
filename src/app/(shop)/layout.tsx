"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <CurrencyProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
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
