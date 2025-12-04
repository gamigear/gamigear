"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { shopTranslations, ShopLocale } from "./shop-translations";

// Default locale - can be changed based on user preference or browser settings
const DEFAULT_LOCALE: ShopLocale = "vi";

// Get locale from localStorage or browser (client-side only)
function getClientLocale(): ShopLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  
  const stored = localStorage.getItem("shop-locale");
  if (stored && (stored === "en" || stored === "ko" || stored === "vi")) {
    return stored;
  }
  
  // Try to detect from browser
  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "ko") return "ko";
  if (browserLang === "vi") return "vi";
  if (browserLang === "en") return "en";
  
  return DEFAULT_LOCALE;
}

export function useShopTranslation() {
  // Start with default locale to match server render
  const [locale, setLocaleState] = useState<ShopLocale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  // After hydration, update to client locale
  useEffect(() => {
    const clientLocale = getClientLocale();
    if (clientLocale !== DEFAULT_LOCALE) {
      setLocaleState(clientLocale);
    }
    setIsHydrated(true);
  }, []);

  const t = shopTranslations[locale];

  const setLocale = useCallback((newLocale: ShopLocale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("shop-locale", newLocale);
      setLocaleState(newLocale);
    }
  }, []);

  return {
    t,
    locale,
    setLocale,
    locales: ["en", "ko", "vi"] as ShopLocale[],
    isHydrated,
  };
}

// Server-side translation helper
export function getShopTranslation(locale: ShopLocale = DEFAULT_LOCALE) {
  return shopTranslations[locale];
}
