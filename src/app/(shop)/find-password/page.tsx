"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function FindPasswordPage() {
  const { t, locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || t.auth.networkError);
      }
    } catch (error) {
      setError(t.auth.networkError);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="flex items-center h-12 px-4">
            <Link href="/login" className="p-1">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="flex-1 text-center font-bold">{t.auth.findPassword}</h1>
            <div className="w-8" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-5 pc:px-4 py-20 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-4">{t.auth.checkEmail}</h2>
          <p className="text-gray-600 mb-8">
            {t.auth.resetLinkSent}
            <br />
            {email}
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-black text-white font-medium rounded-lg"
          >
            {t.auth.backToLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/login" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">{t.auth.findPassword}</h1>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pc:px-4 py-10 pc:py-20">
        <div className="text-center mb-10">
          <div className="hidden pc:flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold">{mounted ? t.brand.name : "Gamigear"}</h1>
          </Link>
          <p className="text-sm text-gray-500 mt-2">{t.auth.findPassword}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600">
            {t.auth.sendResetLink}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t.auth.email}</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.email}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                required
                disabled={loading}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              t.auth.sendResetLink
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          {t.auth.hasAccount}{" "}
          <Link href="/login" className="text-black font-medium hover:underline">
            {t.auth.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
