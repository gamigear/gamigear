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
