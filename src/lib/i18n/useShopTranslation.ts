"use client";

import { useContext } from "react";
import { shopTranslations, ShopLocale } from "./shop-translations";

// Re-export useShopLanguage as useShopTranslation for backward compatibility
// This hook now requires ShopLanguageProvider to be in the component tree
export function useShopTranslation() {
  // Try to use context if available, otherwise fallback to localStorage-based approach
  // This allows the hook to work both inside and outside the provider
  const [locale, setLocaleState, isHydrated] = useShopLocaleState();
  
  const t = shopTranslations[locale];

  const setLocale = (newLocale: ShopLocale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("shop-locale", newLocale);
      setLocaleState(newLocale);
      // Dispatch event for other components to sync
      window.dispatchEvent(new CustomEvent("shopLocaleChange", { detail: newLocale }));
    }
  };

  return {
    t,
    locale,
    setLocale,
    locales: ["en", "ko", "vi"] as ShopLocale[],
    isHydrated,
  };
}

// Internal hook for locale state management
import { useState, useEffect, useCallback } from "react";

const DEFAULT_LOCALE: ShopLocale = "vi";

function getClientLocale(): ShopLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  
  const stored = localStorage.getItem("shop-locale");
  if (stored && (stored === "en" || stored === "ko" || stored === "vi")) {
    return stored;
  }
  
  return DEFAULT_LOCALE;
}

function useShopLocaleState(): [ShopLocale, (locale: ShopLocale) => void, boolean] {
  const [locale, setLocale] = useState<ShopLocale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const clientLocale = getClientLocale();
    setLocale(clientLocale);
    setIsHydrated(true);

    // Listen for locale changes from other components
    const handleLocaleChange = (e: CustomEvent<ShopLocale>) => {
      setLocale(e.detail);
    };

    window.addEventListener("shopLocaleChange", handleLocaleChange as EventListener);
    return () => window.removeEventListener("shopLocaleChange", handleLocaleChange as EventListener);
  }, []);

  return [locale, setLocale, isHydrated];
}

// Server-side translation helper
export function getShopTranslation(locale: ShopLocale = DEFAULT_LOCALE) {
  return shopTranslations[locale];
}
