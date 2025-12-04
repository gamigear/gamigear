// Currency utility functions

export interface CurrencyConfig {
  code: string;
  symbol: string;
  symbolPosition: "before" | "after";
  decimalPlaces: number;
  thousandSep: string;
  decimalSep: string;
  exchangeRate: number;
}

// Default VND config
export const VND_CONFIG: CurrencyConfig = {
  code: "VND",
  symbol: "₫",
  symbolPosition: "after",
  decimalPlaces: 0,
  thousandSep: ".",
  decimalSep: ",",
  exchangeRate: 1,
};

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  config: Partial<CurrencyConfig> = {}
): string {
  const cfg = { ...VND_CONFIG, ...config };
  
  const fixed = amount.toFixed(cfg.decimalPlaces);
  const [intPart, decPart] = fixed.split(".");
  
  // Add thousand separators
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, cfg.thousandSep);
  const formattedAmount = decPart 
    ? `${formattedInt}${cfg.decimalSep}${decPart}` 
    : formattedInt;
  
  return cfg.symbolPosition === "before" 
    ? `${cfg.symbol}${formattedAmount}`
    : `${formattedAmount}${cfg.symbol}`;
}

/**
 * Convert amount from one currency to another (via VND base)
 */
export function convertCurrency(
  amount: number,
  fromRate: number, // Rate to VND
  toRate: number    // Rate to VND
): number {
  const amountInVND = amount * fromRate;
  return amountInVND / toRate;
}

/**
 * Format price in VND (shorthand)
 */
export function formatVND(amount: number): string {
  return formatCurrency(amount, VND_CONFIG);
}

/**
 * Format price in USD
 */
export function formatUSD(amount: number): string {
  return formatCurrency(amount, {
    code: "USD",
    symbol: "$",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandSep: ",",
    decimalSep: ".",
    exchangeRate: 25400,
  });
}

/**
 * Format price in KRW
 */
export function formatKRW(amount: number): string {
  return formatCurrency(amount, {
    code: "KRW",
    symbol: "₩",
    symbolPosition: "before",
    decimalPlaces: 0,
    thousandSep: ",",
    decimalSep: ".",
    exchangeRate: 18.5,
  });
}

/**
 * Parse formatted currency string back to number
 */
export function parseCurrency(
  formatted: string,
  config: Partial<CurrencyConfig> = {}
): number {
  const cfg = { ...VND_CONFIG, ...config };
  
  // Remove symbol and separators
  let cleaned = formatted
    .replace(cfg.symbol, "")
    .replace(new RegExp(`\\${cfg.thousandSep}`, "g"), "")
    .replace(cfg.decimalSep, ".")
    .trim();
  
  return parseFloat(cleaned) || 0;
}
