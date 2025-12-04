import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import SessionProvider from "@/components/providers/SessionProvider";
import PageLoader from "@/components/PageLoader";
import NewsletterPopup from "@/components/NewsletterPopup";
import BackToTop from "@/components/BackToTop";
import "./globals.css";

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
