const isServer = typeof window === "undefined";

function parseCSV(text: string): string[][] {
  const lines = text.trim().split("\n");
  return lines.map((line) => {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { row.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    row.push(current.trim());
    return row;
  });
}

function loadCSV(filename: string): string[][] {
  if (!isServer) return [];
  try {
    const fs = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    const filePath = path.join(process.cwd(), "src/lib/skill-data", filename);
    if (!fs.existsSync(filePath)) return [];
    return parseCSV(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function rowsToObjects<T>(rows: string[][]): T[] {
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h.trim()] = (row[i] || "").trim(); });
    return obj as unknown as T;
  });
}

export interface ProductRecord {
  "Product Type": string;
  Keywords: string;
  "Primary Style Recommendation": string;
  "Secondary Styles": string;
  "Landing Page Pattern": string;
  "Color Palette Focus": string;
  "Key Considerations": string;
}

export interface StyleRecord {
  Style: string;
  "Style Category": string;
  Type: string;
  Keywords: string;
  "Primary Colors": string;
  "Secondary Colors": string;
  "Best For": string;
  "Do Not Use For": string;
  "CSS/Technical Keywords": string;
  "Implementation Checklist": string;
  "Design System Variables": string;
}

export interface ColorRecord {
  "Product Type": string;
  "Primary (Hex)": string;
  "Secondary (Hex)": string;
  "CTA (Hex)": string;
  "Background (Hex)": string;
  "Text (Hex)": string;
  "Border (Hex)": string;
  Notes: string;
}

export interface TypographyRecord {
  "Font Pairing Name": string;
  Category: string;
  "Heading Font": string;
  "Body Font": string;
  "Best For": string;
  "Google Fonts URL": string;
  "CSS Import": string;
  "Tailwind Config": string;
}

export interface ReasoningRecord {
  UI_Category: string;
  Recommended_Pattern: string;
  Style_Priority: string;
  Color_Mood: string;
  Typography_Mood: string;
  Key_Effects: string;
  Decision_Rules: string;
  Anti_Patterns: string;
  Severity: string;
}

export interface UXGuidelineRecord {
  Category: string;
  Issue: string;
  Description: string;
  Do: string;
  "Don't": string;
  Severity: string;
}

export function loadProducts(): ProductRecord[] {
  return rowsToObjects<ProductRecord>(loadCSV("products.csv"));
}
export function loadStyles(): StyleRecord[] {
  return rowsToObjects<StyleRecord>(loadCSV("styles.csv"));
}
export function loadColors(): ColorRecord[] {
  return rowsToObjects<ColorRecord>(loadCSV("colors.csv"));
}
export function loadTypography(): TypographyRecord[] {
  return rowsToObjects<TypographyRecord>(loadCSV("typography.csv"));
}
export function loadReasoning(): ReasoningRecord[] {
  return rowsToObjects<ReasoningRecord>(loadCSV("ui-reasoning.csv"));
}
export function loadUXGuidelines(): UXGuidelineRecord[] {
  return rowsToObjects<UXGuidelineRecord>(loadCSV("ux-guidelines.csv"));
}

const STYLES_CACHE = { loaded: false, value: "" };
const COLORS_CACHE = { loaded: false, value: "" };
const FONTS_CACHE = { loaded: false, value: "" };
const PRODUCTS_CACHE = { loaded: false, value: "" };
const REASONING_CACHE = { loaded: false, value: "" };

export function getStylesBlock(limit = 67): string {
  if (!isServer) return "";
  const key = `sty_${limit}`;
  if (STYLES_CACHE.value && STYLES_CACHE.value.startsWith(key)) return STYLES_CACHE.value;
  const styles = loadStyles();
  STYLES_CACHE.value = key + "\n" + styles.slice(0, limit).map((s, i) => {
    const name = s["Style Category"] || s.Style || "Unknown";
    const kw = s.Keywords.split(",").slice(0, 5).map(k => k.trim()).join(", ");
    return `${i + 1}. ${name}: ${kw}`;
  }).join("\n");
  STYLES_CACHE.loaded = true;
  return STYLES_CACHE.value;
}

export function getColorsBlock(limit = 97): string {
  if (!isServer) return "";
  const key = `col_${limit}`;
  if (COLORS_CACHE.value && COLORS_CACHE.value.startsWith(key)) return COLORS_CACHE.value;
  const colors = loadColors();
  COLORS_CACHE.value = key + "\n" + colors.slice(0, limit).map((c) =>
    `[${c["Product Type"]}] P=${c["Primary (Hex)"]} S=${c["Secondary (Hex)"]} C=${c["CTA (Hex)"]} Bg=${c["Background (Hex)"]} T=${c["Text (Hex)"]}`
  ).join("\n");
  COLORS_CACHE.loaded = true;
  return COLORS_CACHE.value;
}

export function getTypographyBlock(limit = 58): string {
  if (!isServer) return "";
  const key = `fnt_${limit}`;
  if (FONTS_CACHE.value && FONTS_CACHE.value.startsWith(key)) return FONTS_CACHE.value;
  const fonts = loadTypography();
  FONTS_CACHE.value = key + "\n" + fonts.slice(0, limit).map((f) =>
    `#${fonts.indexOf(f) + 1} ${f["Font Pairing Name"]}: H="${f["Heading Font"]}" B="${f["Body Font"]}" — ${f["Best For"].slice(0, 40)}`
  ).join("\n");
  FONTS_CACHE.loaded = true;
  return FONTS_CACHE.value;
}

export function getProductsBlock(limit = 97): string {
  if (!isServer) return "";
  const key = `prd_${limit}`;
  if (PRODUCTS_CACHE.value && PRODUCTS_CACHE.value.startsWith(key)) return PRODUCTS_CACHE.value;
  const products = loadProducts();
  PRODUCTS_CACHE.value = key + "\n" + products.slice(0, limit).map((p) =>
    `#${products.indexOf(p) + 1} ${p["Product Type"]}: style="${p["Primary Style Recommendation"]}" pattern="${p["Landing Page Pattern"]}"`
  ).join("\n");
  PRODUCTS_CACHE.loaded = true;
  return PRODUCTS_CACHE.value;
}

export function getReasoningBlock(limit = 101): string {
  if (!isServer) return "";
  const key = `rsn_${limit}`;
  if (REASONING_CACHE.value && REASONING_CACHE.value.startsWith(key)) return REASONING_CACHE.value;
  const rules = loadReasoning();
  REASONING_CACHE.value = key + "\n" + rules.slice(0, limit).map((r) =>
    `[${r.UI_Category}] pattern=${r.Recommended_Pattern} | anti=${r.Anti_Patterns}`
  ).join("\n");
  REASONING_CACHE.loaded = true;
  return REASONING_CACHE.value;
}

export function getUXGuidelinesBlock(): string {
  if (!isServer) return "";
  const guidelines = loadUXGuidelines();
  return guidelines.slice(0, 100).map((g) =>
    `[${g.Severity}] ${g.Issue}: ${g.Description} | DO: ${g.Do} | DON'T: ${g["Don't"]}`
  ).join("\n");
}

export function getAntiSlopRules(): string {
  return `ANTI-SLOP DESIGN RULES (must check before shipping):
1. No generic AI buzzwords: "cutting-edge", "next-gen", "revolutionary", "game-changer", "state-of-the-art", "leverage", "seamless"
2. No purple/pink gradient as default background (AI slop signature)
3. No Inter font as default — pick intentional typography
4. No shadcn/ui default look — customize buttons, cards, forms
5. No symmetrical 3-column grid by default — use asymmetry
6. No emoji as icons — use SVG icons (Lucide, Heroicons)
7. No "Get Started" as only CTA — use context-specific CTAs
8. No dark mode as default for non-tech products
9. No glassmorphism as default decorative effect
10. Every section must have purpose-specific content, not generic placeholder
11. Color contrast must meet WCAG AA minimum (4.5:1 for text)
12. Hover states must have smooth transitions (150-300ms)
13. Mobile responsive: test at 375px, 768px, 1024px, 1440px
14. prefers-reduced-motion must be respected
15. All clickable elements must have cursor:pointer
16. Focus states must be visible for keyboard navigation`;
}
