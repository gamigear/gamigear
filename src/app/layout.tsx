import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/contexts/AuthContext";
import SessionProvider from "@/components/providers/SessionProvider";
import PageLoader from "@/components/PageLoader";
import NewsletterPopup from "@/components/NewsletterPopup";
import DynamicFavicon from "@/components/DynamicFavicon";
import "./globals.css";

const BackToTop = dynamic(() => import("@/components/BackToTop"), { ssr: false });

export const metadata: Metadata = {
  title: "Gamigear - Thiết bị gaming cho nhà vô địch",
  description: "Gaming gear for champions - Thiết bị gaming chất lượng cao",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <SessionProvider>
          <AuthProvider>
            <DynamicFavicon />
            <PageLoader />
            {children}
            <NewsletterPopup />
            <BackToTop />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
