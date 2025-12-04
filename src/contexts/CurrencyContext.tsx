"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  symbolPosition: string;
  exchangeRate: number;
  decimalPlaces: number;
  thousandSep: string;
  decimalSep: string;
  isBase: boolean;
}

interface CurrencyContextType {
  currency: Currency | null;
  currencies: Currency[];
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number) => string;
  convertPrice: (amountInVND: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currency, setCurrentCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    // Fetch currencies
    fetch("/api/currencies?active=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setCurrencies(data.data);
          // Get saved currency from localStorage or use base currency
          const savedCode = localStorage.getItem("currency");
          const savedCurrency = data.data.find((c: Currency) => c.code === savedCode);
          const baseCurrency = data.data.find((c: Currency) => c.isBase);
          setCurrentCurrency(savedCurrency || baseCurrency || data.data[0]);
        }
      })
      .catch(console.error);

    // Listen for currency change events
    const handleCurrencyChange = (event: CustomEvent<Currency>) => {
      setCurrentCurrency(event.detail);
    };
    window.addEventListener("currencyChange", handleCurrencyChange as EventListener);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange as EventListener);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrentCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency.code);
    window.dispatchEvent(new CustomEvent("currencyChange", { detail: newCurrency }));
  };

  const convertPrice = (amountInVND: number): number => {
    if (!currency || currency.isBase) return amountInVND;
    return amountInVND / currency.exchangeRate;
  };

  const formatPrice = (amountInVND: number): string => {
    if (!currency) {
      // Default VND format
      return amountInVND.toLocaleString("vi-VN") + "₫";
    }

    const converted = convertPrice(amountInVND);
    const fixed = converted.toFixed(currency.decimalPlaces);
    const [intPart, decPart] = fixed.split(".");
    
    // Add thousand separators
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSep);
    const formattedAmount = decPart 
      ? `${formattedInt}${currency.decimalSep}${decPart}` 
      : formattedInt;
    
    return currency.symbolPosition === "before" 
      ? `${currency.symbol}${formattedAmount}`
      : `${formattedAmount}${currency.symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencies, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
