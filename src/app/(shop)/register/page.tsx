"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function RegisterPage() {
  const router = useRouter();
  const { t, locale } = useShopTranslation();
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.passwordMismatch);
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t.auth.passwordTooShort);
      setLoading(false);
      return;
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      setError(t.auth.pleaseAgreeTerms);
      setLoading(false);
      return;
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
    });
    
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || t.auth.registerFailed);
    }
    
    setLoading(false);
  };

  const handleAgreeAll = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
    }));
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
          <h1 className="flex-1 text-center font-bold">{t.auth.register}</h1>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pc:px-4 py-10 pc:py-16">
        {/* Logo - Desktop only */}
        <div className="hidden pc:block text-center mb-10">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold">{mounted ? t.brand.name : "Gamigear"}</h1>
          </Link>
          <p className="text-sm text-gray-500 mt-2">{t.auth.register}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">{t.auth.lastName} *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.auth.firstName} *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.auth.email} *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.auth.phone}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              placeholder="010-0000-0000"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.auth.password} *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">{t.auth.passwordTooShort}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.auth.confirmPassword} *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              required
              disabled={loading}
            />
          </div>

          {/* Agreements */}
          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={formData.agreeTerms && formData.agreePrivacy && formData.agreeMarketing}
                onChange={(e) => handleAgreeAll(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="font-medium">{t.auth.agreeAll}</span>
            </label>
            
            <div className="space-y-3 pl-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600">
                  <Link href="/terms" className="underline">{t.auth.agreeTerms}</Link>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600">
                  <Link href="/privacy" className="underline">{t.auth.agreePrivacy}</Link>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeMarketing"
                  checked={formData.agreeMarketing}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600">{t.auth.agreeMarketing}</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.auth.registering}
              </>
            ) : (
              t.auth.createAccount
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          {t.auth.hasAccount}{" "}
          <Link href="/login" className="text-black font-medium hover:underline">
            {t.auth.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
