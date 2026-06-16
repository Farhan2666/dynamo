"use client";

import type { ContextProfile } from "@/types";

const INDUSTRY_NICHES: Record<string, { tags: string[]; mood: string; layoutBias: string }> = {
  "fintech": { tags: ["finance", "banking", "invest", "pay", "money", "crypto", "blockchain"], mood: "trust", layoutBias: "data-driven" },
  "saas-b2b": { tags: ["saas", "b2b", "enterprise", "software", "cloud", "platform", "workflow"], mood: "professional", layoutBias: "feature-forward" },
  "wellness": { tags: ["yoga", "meditation", "wellness", "health", "fitness", "mindfulness", "spa"], mood: "calm", layoutBias: "visual-showcase" },
  "education": { tags: ["course", "learn", "teach", "tutorial", "class", "academy", "training"], mood: "growth", layoutBias: "storytelling" },
  "ecommerce": { tags: ["shop", "store", "product", "buy", "sell", "marketplace", "retail"], mood: "energetic", layoutBias: "visual-heavy" },
  "creative": { tags: ["design", "art", "portfolio", "creative", "branding", "photography", "studio"], mood: "playful", layoutBias: "portfolio-style" },
  "healthtech": { tags: ["health", "medical", "patient", "doctor", "clinic", "telehealth", "healthcare"], mood: "trust", layoutBias: "social-proof" },
  "food": { tags: ["restaurant", "cafe", "bakery", "food", "catering", "vegan", "cooking"], mood: "warm", layoutBias: "visual-showcase" },
  "agency": { tags: ["agency", "consulting", "service", "freelance", "professional", "studio"], mood: "confident", layoutBias: "testimonial-first" },
  "realestate": { tags: ["property", "real estate", "apartment", "rent", "buy", "home", "housing"], mood: "stable", layoutBias: "gallery-heavy" },
  "nonprofit": { tags: ["nonprofit", "charity", "donate", "foundation", "community", "volunteer"], mood: "compassionate", layoutBias: "storytelling" },
  "coaching": { tags: ["coach", "consultant", "mentor", "guide", "advisor", "therapy"], mood: "personal", layoutBias: "people-first" },
};

const FALLBACK = { tags: ["general", "business"], mood: "balanced", layoutBias: "classic-conversion" };

const COLOR_PSYCHOLOGY: Record<string, { primary: string; secondary: string; accent: string; reason: string }> = {
  trust: { primary: "#2563EB", secondary: "#06B6D4", accent: "#F59E0B", reason: "Blue = trust + authority" },
  professional: { primary: "#1E293B", secondary: "#475569", accent: "#8B5CF6", reason: "Dark slate = executive" },
  calm: { primary: "#8B9D6E", secondary: "#D4C5A9", accent: "#C17817", reason: "Earthy = grounding" },
  growth: { primary: "#059669", secondary: "#10B981", accent: "#F97316", reason: "Green = growth + learning" },
  energetic: { primary: "#DC2626", secondary: "#F59E0B", accent: "#84CC16", reason: "Red = urgency + action" },
  playful: { primary: "#EC4899", secondary: "#8B5CF6", accent: "#F59E0B", reason: "Pink = creative + bold" },
  warm: { primary: "#D97706", secondary: "#F59E0B", accent: "#DC2626", reason: "Amber = appetite + warmth" },
  confident: { primary: "#7C3AED", secondary: "#3B82F6", accent: "#F97316", reason: "Purple = premium + confident" },
  stable: { primary: "#1E40AF", secondary: "#2563EB", accent: "#059669", reason: "Navy = stability + trust" },
  compassionate: { primary: "#BE185D", secondary: "#DB2777", accent: "#F59E0B", reason: "Rose = care + compassion" },
  personal: { primary: "#7C3AED", secondary: "#EC4899", accent: "#F59E0B", reason: "Purple-pink = personal growth" },
  balanced: { primary: "#6E56CF", secondary: "#00C4B4", accent: "#FF7E33", reason: "Brand default = balanced modern" },
};

const FONT_PAIRS: Record<string, { primary: string; secondary: string; reason: string }> = {
  trust: { primary: "Inter", secondary: "Merriweather", reason: "Clean sans + serif authority" },
  professional: { primary: "Inter", secondary: "Sora", reason: "Clean professional + accent heading" },
  calm: { primary: "Sora", secondary: "Inter", reason: "Rounded warmth + readability" },
  growth: { primary: "Merriweather", secondary: "Inter", reason: "Serif authority + sans readability" },
  energetic: { primary: "Sora", secondary: "Inter", reason: "Bold modern + clean body" },
  playful: { primary: "Sora", secondary: "Inter", reason: "Friendly + approachable" },
  warm: { primary: "Sora", secondary: "Inter", reason: "Friendly rounded + clean" },
  confident: { primary: "Inter", secondary: "Sora", reason: "Sharp sans + soft heading" },
  stable: { primary: "Merriweather", secondary: "Inter", reason: "Classic serif + modern sans" },
  compassionate: { primary: "Sora", secondary: "Inter", reason: "Warm rounded + readability" },
  personal: { primary: "Sora", secondary: "Inter", reason: "Approachable + clean" },
  balanced: { primary: "Sora", secondary: "Inter", reason: "Default modern pairing" },
};

export function analyzeContext(prompt: string): ContextProfile {
  const lower = prompt.toLowerCase();

  let bestNiche = "general";
  let bestScore = 0;

  for (const [niche, data] of Object.entries(INDUSTRY_NICHES)) {
    const score = data.tags.reduce((acc, tag) => {
      const regex = new RegExp(tag.replace(/\s+/g, "\\s*"), "i");
      return acc + (regex.test(lower) ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestNiche = niche;
    }
  }

  const nicheData = INDUSTRY_NICHES[bestNiche] || FALLBACK;
  const colors = COLOR_PSYCHOLOGY[nicheData.mood] || COLOR_PSYCHOLOGY.balanced;
  const fonts = FONT_PAIRS[nicheData.mood] || FONT_PAIRS.balanced;

  const tags = nicheData.tags.filter((t) => {
    const regex = new RegExp(t.replace(/\s+/g, "\\s*"), "i");
    return regex.test(lower);
  });

  return {
    niche: bestNiche,
    industryTags: tags.length > 0 ? tags.slice(0, 5) : [bestNiche],
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    primaryFont: fonts.primary,
    secondaryFont: fonts.secondary,
    layoutPriority: ["hero", "features", "cta"],
    audiencePersona: nicheData.mood,
    moodProfile: nicheData.mood,
  };
}
