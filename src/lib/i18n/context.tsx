"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Locale, TranslationKeys } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const defaultLocale: Locale = 'vi';

const I18nContext = createContext<I18nContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: translations[defaultLocale],
});

const LOCALE_STORAGE_KEY = 'admin-locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Force Vietnamese as default - reset any old Korean locale
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
    const resetKey = 'admin-locale-reset-v2';
    const hasReset = localStorage.getItem(resetKey);
    
    if (!hasReset) {
      // One-time reset to Vietnamese
      localStorage.setItem(LOCALE_STORAGE_KEY, 'vi');
      localStorage.setItem(resetKey, 'true');
      setLocaleState('vi');
    } else if (savedLocale && ['en', 'ko', 'vi'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'vi');
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  // Always use default locale for SSR, then switch to saved locale after mount
  const t = translations[mounted ? locale : defaultLocale];

  return (
    <I18nContext.Provider value={{ locale: mounted ? locale : defaultLocale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  return context;
}

// Hook to get translations directly
export function useTranslations() {
  const { t } = useI18n();
  return t;
}
