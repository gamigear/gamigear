"use client";

import { useState, useEffect } from "react";

interface Currency {
  code: string;
  symbol: string;
  symbolPosition: string;
  exchangeRate: number;
  decimalPlaces: number;
  thousandSep: string;
  decimalSep: string;
  isBase: boolean;
}

interface PriceProps {
  amount: number; // Price in VND (base currency)
  className?: string;
  showOriginal?: boolean; // Show original VND price when converted
}

// Default VND currency
const DEFAULT_CURRENCY: Currency = {
  code: "VND",
  symbol: "₫",
  symbolPosition: "after",
  exchangeRate: 1,
  decimalPlaces: 0,
  thousandSep: ".",
  decimalSep: ",",
  isBase: true,
};

export default function Price({ amount, className = "", showOriginal = false }: PriceProps) {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load saved currency
    const loadCurrency = async () => {
      try {
        const savedCode = localStorage.getItem("currency") || "VND";
        const res = await fetch("/api/currencies?active=true");
        const data = await res.json();
        if (data.data) {
          const found = data.data.find((c: Currency) => c.code === savedCode);
          if (found) setCurrency(found);
        }
      } catch (error) {
        console.error("Failed to load currency:", error);
      }
    };
    loadCurrency();

    // Listen for currency changes
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail);
    };
    window.addEventListener("currencyChange", handleCurrencyChange as EventListener);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange as EventListener);
  }, []);

  const formatPrice = (amt: number, curr: Currency): string => {
    // Convert from VND to target currency
    const converted = curr.isBase ? amt : amt / curr.exchangeRate;
    
    const fixed = converted.toFixed(curr.decimalPlaces);
    const [intPart, decPart] = fixed.split(".");
    
    // Add thousand separators
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, curr.thousandSep);
    const formattedAmount = decPart 
      ? `${formattedInt}${curr.decimalSep}${decPart}` 
      : formattedInt;
    
    return curr.symbolPosition === "before" 
      ? `${curr.symbol}${formattedAmount}`
      : `${formattedAmount}${curr.symbol}`;
  };

  // SSR fallback - show VND
  if (!mounted) {
    return (
      <span className={className}>
        {amount.toLocaleString("vi-VN")}₫
      </span>
    );
  }

  const formattedPrice = formatPrice(amount, currency);
  const isConverted = !currency.isBase;

  return (
    <span className={className}>
      {formattedPrice}
      {showOriginal && isConverted && (
        <span className="text-gray-400 text-xs ml-1">
          ({amount.toLocaleString("vi-VN")}₫)
        </span>
      )}
    </span>
  );
}

// Hook for using currency formatting in other components
export function usePrice() {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCode = localStorage.getItem("currency") || "VND";
        const res = await fetch("/api/currencies?active=true");
        const data = await res.json();
        if (data.data) {
          const found = data.data.find((c: Currency) => c.code === savedCode);
          if (found) setCurrency(found);
        }
      } catch (error) {
        console.error("Failed to load currency:", error);
      }
    };
    loadCurrency();

    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail);
    };
    window.addEventListener("currencyChange", handleCurrencyChange as EventListener);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange as EventListener);
  }, []);

  const formatPrice = (amount: number): string => {
    const converted = currency.isBase ? amount : amount / currency.exchangeRate;
    
    const fixed = converted.toFixed(currency.decimalPlaces);
    const [intPart, decPart] = fixed.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSep);
    const formattedAmount = decPart 
      ? `${formattedInt}${currency.decimalSep}${decPart}` 
      : formattedInt;
    
    return currency.symbolPosition === "before" 
      ? `${currency.symbol}${formattedAmount}`
      : `${formattedAmount}${currency.symbol}`;
  };

  return { currency, formatPrice };
}
