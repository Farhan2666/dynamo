export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function passesWCAG(hex1: string, hex2: string, level: "AA" | "AAA" = "AA"): boolean {
  const ratio = contrastRatio(hex1, hex2);
  return level === "AA" ? ratio >= 4.5 : ratio >= 7;
}

export function suggestTextColor(bgHex: string): string {
  return contrastRatio(bgHex, "#1A1A2E") >= 4.5 ? "#1A1A2E" : "#FFFFFF";
}

export function adjustForContrast(bgHex: string, textHex: string): string {
  const ratio = contrastRatio(bgHex, textHex);
  if (ratio >= 4.5) return textHex;
  const bgLum = getLuminance(bgHex);
  return bgLum > 0.5 ? "#1A1A2E" : "#FFFFFF";
}

export const COLOR_PSYCHOLOGY: Record<string, { meaning: string; emotion: string; bestFor: string }> = {
  "#6E56CF": { meaning: "Wisdom & creativity", emotion: "Trustworthy, innovative", bestFor: "Tech, SaaS, creative agencies" },
  "#00C4B4": { meaning: "Clarity & growth", emotion: "Fresh, energetic", bestFor: "Health, wellness, startups" },
  "#FF7E33": { meaning: "Confidence & action", emotion: "Warm, urgent", bestFor: "CTAs, e-commerce, fitness" },
  "#1A1A2E": { meaning: "Authority & depth", emotion: "Premium, serious", bestFor: "Luxury, legal, finance" },
  "#F5F5FF": { meaning: "Purity & openness", emotion: "Clean, approachable", bestFor: "Backgrounds, wellness, education" },
  "#E74C3C": { meaning: "Passion & urgency", emotion: "Bold, exciting", bestFor: "Sales, entertainment, food" },
  "#2ECC71": { meaning: "Balance & harmony", emotion: "Natural, stable", bestFor: "Eco, finance, health" },
  "#3498DB": { meaning: "Trust & stability", emotion: "Professional, calm", bestFor: "Corporate, tech, banking" },
  "#F39C12": { meaning: "Optimism & warmth", emotion: "Friendly, inviting", bestFor: "Education, lifestyle, hospitality" },
  "#9B59B6": { meaning: "Luxury & magic", emotion: "Creative, premium", bestFor: "Beauty, entertainment, fashion" },
};
