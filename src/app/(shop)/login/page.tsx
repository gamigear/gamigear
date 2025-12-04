"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useShopTranslation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam && mounted) {
      setError(t.auth.loginFailed);
    }
  }, [searchParams, t.auth.loginFailed, mounted]);

  // Get redirect URL from query params
  const redirectUrl = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, authLoading, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);
    
    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.error || t.auth.loginFailed);
    }
    
    setLoading(false);
  };

  const handleOAuthLogin = async (provider: string) => {
    setOauthLoading(provider);
    setError("");
    
    try {
      // Store redirect URL in session for OAuth callback
      if (redirectUrl !== "/") {
        sessionStorage.setItem("auth_redirect", redirectUrl);
      }
      await signIn(provider, {
        callbackUrl: "/auth/callback",
        redirect: true,
      });
    } catch (error) {
      console.error("OAuth error:", error);
      setError(t.auth.loginFailed);
      setOauthLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">{t.auth.login}</h1>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pc:px-4 py-10 pc:py-20">
        {/* Logo & Language Switcher */}
        <div className="text-center mb-10">
          <div className="hidden pc:flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold">{mounted ? t.brand.name : "Gamigear"}</h1>
          </Link>
          <p className="text-sm text-gray-500 mt-2">{mounted ? t.brand.slogan : "2040 학부모님들의 합리적인 선택"}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.email}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              required
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.password}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-gray-600">{t.auth.rememberMe}</span>
            </label>
            <Link href="/find-password" className="text-gray-500 hover:text-black">
              {t.auth.forgotPassword}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !!oauthLoading}
            className="w-full py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.auth.loggingIn}
              </>
            ) : (
              t.auth.login
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-sm text-gray-500">{t.auth.orLoginWith}</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <button 
            onClick={() => handleOAuthLogin("kakao")}
            disabled={!!oauthLoading}
            className="w-full py-3 bg-[#FEE500] text-black font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {oauthLoading === "kakao" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 2C5.58172 2 2 4.90264 2 8.5C2 10.7675 3.46928 12.7659 5.71194 13.9297L4.87596 17.1289C4.79534 17.4295 5.13772 17.6693 5.39775 17.4969L9.27387 14.9329C9.51213 14.9773 9.75389 15 10 15C14.4183 15 18 12.0974 18 8.5C18 4.90264 14.4183 2 10 2Z" fill="black"/>
              </svg>
            )}
            {t.auth.kakaoLogin}
          </button>

          <button 
            onClick={() => handleOAuthLogin("naver")}
            disabled={!!oauthLoading}
            className="w-full py-3 bg-[#03C75A] text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {oauthLoading === "naver" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="font-bold text-lg">N</span>
            )}
            {t.auth.naverLogin}
          </button>

          <button 
            onClick={() => handleOAuthLogin("google")}
            disabled={!!oauthLoading}
            className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            {oauthLoading === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path fill="#4285F4" d="M17.05 10.19c0-.61-.05-1.19-.15-1.74H10v3.29h3.96c-.17.92-.69 1.7-1.47 2.22v1.85h2.38c1.39-1.28 2.18-3.17 2.18-5.62z"/>
                <path fill="#34A853" d="M10 18c1.98 0 3.64-.66 4.85-1.77l-2.38-1.85c-.66.44-1.5.7-2.47.7-1.9 0-3.51-1.28-4.08-3.01H3.46v1.91C4.66 16.26 7.13 18 10 18z"/>
                <path fill="#FBBC05" d="M5.92 12.07c-.15-.44-.23-.91-.23-1.41s.08-.97.23-1.41V7.34H3.46C2.93 8.39 2.63 9.56 2.63 10.83s.3 2.44.83 3.49l2.46-1.91z"/>
                <path fill="#EA4335" d="M10 5.58c1.07 0 2.03.37 2.79 1.1l2.09-2.09C13.64 3.36 11.98 2.63 10 2.63c-2.87 0-5.34 1.74-6.54 4.21l2.46 1.91c.57-1.73 2.18-3.01 4.08-3.01z"/>
              </svg>
            )}
            {t.auth.googleLogin}
          </button>

          <button 
            onClick={() => handleOAuthLogin("facebook")}
            disabled={!!oauthLoading}
            className="w-full py-3 bg-[#1877F2] text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {oauthLoading === "facebook" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M18.896 0H1.104C.494 0 0 .494 0 1.104v17.792C0 19.506.494 20 1.104 20h9.58v-7.745H8.076V9.237h2.606V7.01c0-2.583 1.578-3.99 3.883-3.99 1.104 0 2.052.082 2.329.119v2.7h-1.598c-1.254 0-1.496.596-1.496 1.47v1.928h2.989l-.39 3.018h-2.6V20h5.098c.608 0 1.102-.494 1.102-1.104V1.104C20 .494 19.506 0 18.896 0z"/>
              </svg>
            )}
            {t.auth.facebookLogin}
          </button>

          <button 
            onClick={() => handleOAuthLogin("apple")}
            disabled={!!oauthLoading}
            className="w-full py-3 bg-black text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {oauthLoading === "apple" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15.182 10.622c-.023-2.42 1.973-3.58 2.063-3.644-1.123-1.643-2.873-1.868-3.496-1.894-1.488-.151-2.905.877-3.66.877-.754 0-1.922-.855-3.16-.832-1.627.024-3.127.946-3.965 2.404-1.69 2.934-.433 7.283 1.215 9.666.805 1.165 1.765 2.473 3.025 2.426 1.213-.049 1.672-.785 3.14-.785 1.467 0 1.879.785 3.163.76 1.307-.022 2.135-1.187 2.935-2.357.925-1.352 1.306-2.662 1.329-2.73-.029-.013-2.55-.979-2.575-3.891h-.014zM12.73 3.41c.669-.812 1.12-1.938.997-3.062-1.003.041-2.218.668-2.938 1.511-.646.748-1.212 1.943-1.06 3.09 1.12.087 2.263-.568 3.001-1.539z"/>
              </svg>
            )}
            {t.auth.appleLogin}
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center mt-8 text-sm text-gray-500">
          {t.auth.noAccount}{" "}
          <Link href="/register" className="text-black font-medium hover:underline">
            {t.auth.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
