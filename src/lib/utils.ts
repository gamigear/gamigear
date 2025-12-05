import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "₫"): string {
  // Use a fixed format to avoid hydration mismatch between server and client
  // Use dot as thousand separator for VND (Vietnamese standard)
  const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return formatted + currency;
}

export function formatPriceVND(price: number): string {
  const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return formatted + "₫";
}

export function removeVietnameseTones(str: string): string {
  // Normalize to NFD (decomposed form) first
  let normalized = str.normalize('NFD');
  
  // Remove combining diacritical marks
  normalized = normalized.replace(/[\u0300-\u036f]/g, '');
  
  // Handle special Vietnamese characters that don't decompose properly
  normalized = normalized
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/ư/g, 'u')
    .replace(/Ư/g, 'U')
    .replace(/ơ/g, 'o')
    .replace(/Ơ/g, 'O')
    .replace(/ă/g, 'a')
    .replace(/Ă/g, 'A')
    .replace(/â/g, 'a')
    .replace(/Â/g, 'A')
    .replace(/ê/g, 'e')
    .replace(/Ê/g, 'E')
    .replace(/ô/g, 'o')
    .replace(/Ô/g, 'O');
  
  return normalized;
}

export function generateSlug(text: string): string {
  return removeVietnameseTones(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
