"use client";

import type { ContextProfile, SectionType } from "@/types";
import { detectLanguage } from "@/lib/utils/language";

const INDUSTRY_NICHES: Record<string, { tags: string[]; mood: string; audience: string }> = {
  fintech: {
    tags: ["fintech", "finance", "banking", "invest", "payment", "money", "crypto", "blockchain", "wallet", "lending", "insurance", "wealth", "stock", "trading", "keuangan", "bank", "investasi", "uang", "kripto"],
    mood: "trust",
    audience: "financial professionals and modern investors",
  },
  saas: {
    tags: ["saas", "b2b", "enterprise", "software", "cloud", "platform", "workflow", "automation", "productivity", "tool", "dashboard", "analytics", "integration", "api", "subscription"],
    mood: "professional",
    audience: "forward-thinking business teams",
  },
  wellness: {
    tags: ["yoga", "meditation", "wellness", "health", "fitness", "mindfulness", "spa", "selfcare", "mental", "breath", "holistic", "kesehatan", "yoga", "meditasi"],
    mood: "calm",
    audience: "wellness seekers and mindful professionals",
  },
  education: {
    tags: ["education", "course", "learn", "teach", "tutorial", "class", "academy", "training", "online course", "elearning", "school", "student", "skill", "knowledge", "pendidikan", "belajar", "kursus", "pelatihan", "sekolah"],
    mood: "growth",
    audience: "lifelong learners and ambitious students",
  },
  ecommerce: {
    tags: ["ecommerce", "shop", "store", "product", "buy", "sell", "marketplace", "retail", "dropship", "wholesale", "fashion", "brand", "merchant", "belanja", "toko", "jual", "produk"],
    mood: "energetic",
    audience: "shoppers and modern consumers",
  },
  creative: {
    tags: ["design", "art", "portfolio", "creative", "branding", "photography", "studio", "illustration", "graphic", "visual", "artist", "desain", "seni", "kreatif", "fotografi"],
    mood: "playful",
    audience: "creative professionals and artists",
  },
  healthtech: {
    tags: ["healthtech", "medical", "patient", "doctor", "clinic", "telehealth", "healthcare", "hospital", "diagnostic", "wellness tech", "fitness tech", "kesehatan", "medis", "dokter", "klinik"],
    mood: "trust",
    audience: "healthcare providers and patients",
  },
  food: {
    tags: ["restaurant", "cafe", "bakery", "food", "catering", "vegan", "cooking", "recipe", "delivery", "kuliner", "makanan", "restoran", "kafe", "masakan"],
    mood: "warm",
    audience: "food lovers and culinary enthusiasts",
  },
  agency: {
    tags: ["agency", "consulting", "service", "freelance", "professional", "studio", "marketing", "growth", "strategy", "consultant", "agency", "konsultan", "jasa", "freelance"],
    mood: "confident",
    audience: "businesses seeking expert partners",
  },
  realestate: {
    tags: ["property", "real estate", "apartment", "rent", "buy", "home", "housing", "mortgage", "investasi properti", "rumah", "apartemen", "sewa", "jual properti"],
    mood: "stable",
    audience: "property seekers and real estate investors",
  },
  nonprofit: {
    tags: ["nonprofit", "charity", "donate", "foundation", "community", "volunteer", "social", "ngo", "yayasan", "donasi", "amal", "sosial", "relawan"],
    mood: "compassionate",
    audience: "donors and community supporters",
  },
  tech: {
    tags: ["tech", "startup", "ai", "artificial intelligence", "machine learning", "data", "developer", "devops", "cloud", "cyber", "security", "app", "mobile", "web", "digital", "teknologi", "aplikasi", "digital"],
    mood: "balanced",
    audience: "tech-savvy innovators and early adopters",
  },
  travel: {
    tags: ["travel", "tourism", "hotel", "vacation", "destination", "trip", "wanderlust", "booking", "hospitality", "wisata", "liburan", "hotel", "perjalanan", "destinasi"],
    mood: "energetic",
    audience: "adventurers and travel enthusiasts",
  },
  saas_b2c: {
    tags: ["productivity app", "lifestyle app", "social", "messaging", "dating", "entertainment", "streaming", "music", "gaming", "consumer app"],
    mood: "playful",
    audience: "everyday consumers",
  },
};

const FALLBACK = { tags: ["general", "business"], mood: "balanced", audience: "professionals and entrepreneurs" };

const COLOR_PSYCHOLOGY: Record<string, { primary: string; secondary: string; accent: string; reason: string }> = {
  trust: { primary: "#2563EB", secondary: "#06B6D4", accent: "#F59E0B", reason: "Blue = trust + authority; teal = clarity" },
  professional: { primary: "#1E293B", secondary: "#6366F1", accent: "#8B5CF6", reason: "Dark slate = executive; indigo = innovation" },
  calm: { primary: "#8B9D6E", secondary: "#D4C5A9", accent: "#C17817", reason: "Earthy sage = grounding; warm beige = comfort" },
  growth: { primary: "#059669", secondary: "#10B981", accent: "#F97316", reason: "Emerald = growth; amber = energy" },
  energetic: { primary: "#DC2626", secondary: "#F59E0B", accent: "#84CC16", reason: "Red = urgency; gold = optimism" },
  playful: { primary: "#EC4899", secondary: "#8B5CF6", accent: "#F59E0B", reason: "Pink = creative; purple = imagination" },
  warm: { primary: "#D97706", secondary: "#F59E0B", accent: "#DC2626", reason: "Amber = warmth; coral = appetite" },
  confident: { primary: "#7C3AED", secondary: "#3B82F6", accent: "#F97316", reason: "Purple = premium; blue = dependable" },
  stable: { primary: "#1E40AF", secondary: "#2563EB", accent: "#059669", reason: "Navy = stability; green = growth" },
  compassionate: { primary: "#BE185D", secondary: "#DB2777", accent: "#F59E0B", reason: "Rose = care; pink = compassion" },
  balanced: { primary: "#6E56CF", secondary: "#00C4B4", accent: "#FF7E33", reason: "Purple = wisdom; teal = clarity; orange = action" },
};

const FONT_PAIRS: Record<string, { primary: string; secondary: string; reason: string }> = {
  trust: { primary: "Inter", secondary: "Sora", reason: "Clean sans + modern heading authority" },
  professional: { primary: "Inter", secondary: "Sora", reason: "Trusted sans + distinctive heading" },
  calm: { primary: "Sora", secondary: "Inter", reason: "Soft rounded warmth + legible body" },
  growth: { primary: "Sora", secondary: "Inter", reason: "Friendly modern + clean readability" },
  energetic: { primary: "Sora", secondary: "Inter", reason: "Bold contemporary + stable body" },
  playful: { primary: "Sora", secondary: "Inter", reason: "Expressive heading + neutral body" },
  warm: { primary: "Sora", secondary: "Inter", reason: "Approachable curves + clean text" },
  confident: { primary: "Inter", secondary: "Sora", reason: "Sharp professionalism + accent" },
  stable: { primary: "Inter", secondary: "Sora", reason: "Classic stability + modern touch" },
  compassionate: { primary: "Sora", secondary: "Inter", reason: "Warm rounded + readable body" },
  balanced: { primary: "Sora", secondary: "Inter", reason: "Modern pairing with personality" },
};

const LAYOUT_PRIORITIES: Record<string, SectionType[]> = {
  trust: ["hero", "logos", "stats", "testimonials", "features", "cta"],
  professional: ["hero", "features", "comparison", "pricing", "testimonials", "faq", "cta"],
  calm: ["hero", "testimonials", "features", "gallery", "cta"],
  growth: ["hero", "stats", "features", "testimonials", "cta", "faq"],
  energetic: ["hero", "cta", "features", "testimonials", "pricing", "cta"],
  playful: ["hero", "gallery", "features", "testimonials", "cta"],
  warm: ["hero", "features", "testimonials", "cta", "contact"],
  confident: ["hero", "stats", "testimonials", "features", "pricing", "cta"],
  stable: ["hero", "stats", "features", "testimonials", "cta"],
  compassionate: ["hero", "testimonials", "features", "cta", "contact"],
  balanced: ["hero", "features", "testimonials", "pricing", "faq", "cta"],
};

export function analyzeContext(prompt: string): ContextProfile {
  const lower = prompt.toLowerCase();
  const language = detectLanguage(prompt);

  let bestNiche = "general";
  let bestScore = 0;
  const matchedTags: string[] = [];

  for (const [niche, data] of Object.entries(INDUSTRY_NICHES)) {
    let score = 0;
    for (const tag of data.tags) {
      const regex = new RegExp(tag.replace(/\s+/g, "\\s*"), "i");
      if (regex.test(lower)) {
        score += tag.length > 5 ? 2 : 1;
        matchedTags.push(tag);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestNiche = niche;
    }
  }

  const nicheData = INDUSTRY_NICHES[bestNiche] || FALLBACK;
  const mood = nicheData.mood || "balanced";
  const colors = COLOR_PSYCHOLOGY[mood] || COLOR_PSYCHOLOGY.balanced;
  const fonts = FONT_PAIRS[mood] || FONT_PAIRS.balanced;
  const layoutPriority = LAYOUT_PRIORITIES[mood] || LAYOUT_PRIORITIES.balanced;

  const tags = nicheData.tags
    .filter((t) => new RegExp(t.replace(/\s+/g, "\\s*"), "i").test(lower))
    .slice(0, 5);

  const persona = language === "id"
    ? `Pengguna dan profesional di bidang ${bestNiche}`
    : nicheData.audience || `professionals in ${bestNiche}`;

  return {
    niche: bestNiche,
    industryTags: tags.length > 0 ? tags : [bestNiche],
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    primaryFont: fonts.primary,
    secondaryFont: fonts.secondary,
    layoutPriority,
    audiencePersona: persona,
    moodProfile: mood,
    language,
  };
}
