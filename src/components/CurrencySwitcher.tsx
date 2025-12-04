"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

interface CurrencySwitcherProps {
  variant?: "light" | "dark"; // light = white text, dark = black text
}

// Default currency
const DEFAULT_CURRENCY: Currency = {
  id: "default",
  code: "VND",
  name: "Việt Nam Đồng",
  symbol: "₫",
  isActive: true,
};

export default function CurrencySwitcher({ variant = "light" }: CurrencySwitcherProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([DEFAULT_CURRENCY]);
  const [selected, setSelected] = useState<Currency>(DEFAULT_CURRENCY);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/currencies?active=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setCurrencies(data.data);
          const savedCode = typeof window !== "undefined" ? localStorage.getItem("currency") : null;
          const savedCurrency = data.data.find((c: Currency) => c.code === savedCode);
          setSelected(savedCurrency || data.data[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (currency: Currency) => {
    setSelected(currency);
    localStorage.setItem("currency", currency.code);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("currencyChange", { detail: currency }));
  };

  const textClass = variant === "light" 
    ? "text-white/80 hover:text-white" 
    : "text-gray-600 hover:text-gray-900";

  if (!mounted) {
    return (
      <span className={`flex items-center gap-1 text-xs ${textClass}`}>
        <span className="font-medium">₫</span>
        <span>VND</span>
      </span>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 text-xs transition-colors ${textClass}`}
      >
        <span className="font-medium">{selected.symbol}</span>
        <span>{selected.code}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && currencies.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
          {currencies.map((currency) => (
            <button
              key={currency.id}
              onClick={() => handleSelect(currency)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                selected.code === currency.code ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
              }`}
            >
              <span className="w-6 text-center font-medium">{currency.symbol}</span>
              <span>{currency.code}</span>
              <span className="text-gray-400 text-xs ml-auto">{currency.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
