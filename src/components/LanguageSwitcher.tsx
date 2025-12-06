"use client";

import { useState, useEffect, useCallback } from "react";
import { Globe } from "lucide-react";
import type { ShopLocale } from "@/lib/i18n/shop-translations";

const languages: { code: ShopLocale; name: string; flag: string }[] = [
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
];

const DEFAULT_LOCALE: ShopLocale = "vi";
const STORAGE_KEY = "shop-locale";

function getClientLocale(): ShopLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === "en" || stored === "ko" || stored === "vi")) {
    return stored;
  }
  return DEFAULT_LOCALE;
}

export default function LanguageSwitcher() {
  const [locale, setLocaleState] = useState<ShopLocale>(DEFAULT_LOCALE);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const clientLocale = getClientLocale();
    setLocaleState(clientLocale);
    setIsHydrated(true);

    // Listen for locale changes from other components
    const handleLocaleChange = (e: CustomEvent<ShopLocale>) => {
      setLocaleState(e.detail);
    };

    window.addEventListener("shopLocaleChange", handleLocaleChange as EventListener);
    return () => window.removeEventListener("shopLocaleChange", handleLocaleChange as EventListener);
  }, []);

  const setLocale = useCallback((newLocale: ShopLocale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLocale);
      setLocaleState(newLocale);
      // Dispatch event for other components to sync
      window.dispatchEvent(new CustomEvent("shopLocaleChange", { detail: newLocale }));
    }
  }, []);

  // Default to Vietnamese for SSR to avoid hydration mismatch
  const currentLang = isHydrated 
    ? (languages.find((l) => l.code === locale) || languages[2])
    : languages[2];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-1 text-white/80 hover:text-white"
        title={`${currentLang.flag} ${currentLang.name}`}
      >
        <Globe size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                  locale === lang.code ? "bg-gray-50 font-medium" : ""
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
