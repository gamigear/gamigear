"use client";

import { useCallback, useMemo } from "react";
import { shopTranslations, ShopLocale } from "./shop-translations";

// Default locale - can be changed based on user preference or browser settings
const DEFAULT_LOCALE: ShopLocale = "ko";

// Get locale from localStorage or browser
function getLocale(): ShopLocale {
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
  const locale = useMemo(() => getLocale(), []);
  const t = shopTranslations[locale];

  const setLocale = useCallback((newLocale: ShopLocale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("shop-locale", newLocale);
      window.location.reload();
    }
  }, []);

  return {
    t,
    locale,
    setLocale,
    locales: ["en", "ko", "vi"] as ShopLocale[],
  };
}

// Server-side translation helper
export function getShopTranslation(locale: ShopLocale = DEFAULT_LOCALE) {
  return shopTranslations[locale];
}
